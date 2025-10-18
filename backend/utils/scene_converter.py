from openai.types import Video
from pydantic import BaseModel
from openai import AsyncOpenAI
from ruamel.yaml import YAML
import os
import asyncio
import tempfile


client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

yaml = YAML()
with open("prompts.yaml", "r") as f:
    prompts = yaml.load(f)


class Scene(BaseModel):
    visual: str
    voice_over: str
    reasoning: str


class ScenesResponse(BaseModel):
    scenes: list[Scene]


async def convert_to_scenes(article_content: str) -> ScenesResponse | None:
    print("Converting article to scenes...")
    system_prompt = prompts.get("scene_converter_prompt", "")
    response = await client.responses.parse(
        model="gpt-5",
        input=article_content,
        instructions=system_prompt,
        text_format=ScenesResponse,
        reasoning={"effort": "medium"},
    )
    return response.output_parsed


async def scene_to_sora_prompt(scene: Scene) -> str:
    print("Converting scene to Sora prompt...")
    sora_system = prompts.get("sora_prompt_converter", "")
    user_prompt = scene.visual + "\n\n" + scene.reasoning

    response = await client.responses.create(
        model="gpt-4o",
        input=user_prompt,
        instructions=sora_system,
    )
    return response.output_text


async def create_sora_video(sora_prompt: str, max_retries: int = 1) -> Video | None:
    """
    Create a Sora video with exponential retry mechanism.

    Args:
        sora_prompt: The prompt for Sora video generation
        max_retries: Maximum number of retry attempts (default: 3)

    Returns:
        Video object or None if all retries fail
    """
    for attempt in range(max_retries):
        try:
            print(f"Creating Sora video... (Attempt {attempt + 1}/{max_retries})")

            video = await client.videos.create_and_poll(
                prompt=sora_prompt,
                model="sora-2",
                timeout=120,
                seconds="4",
                size="720x1280",
            )

            print(f"✓ Sora video created successfully on attempt {attempt + 1}")
            return video

        except Exception as e:
            error_msg = f"✗ Error creating Sora video (Attempt {attempt + 1}/{max_retries}): {str(e)}"
            print(error_msg)

            if attempt < max_retries - 1:
                # Exponential backoff: 2^attempt seconds (1s, 2s, 4s, ...)
                wait_time = 2**attempt
                print(f"  Retrying in {wait_time} seconds...")
                await asyncio.sleep(wait_time)
            else:
                print(f"✗ Failed to create Sora video after {max_retries} attempts")
                return None

    return None


async def download_sora_video(video: Video) -> str:
    """
    Download Sora video content and save to a temporary file.

    Args:
        video: Video object from Sora API

    Returns:
        Path to the temporary file containing the video
    """
    print(f"Downloading Sora video {video.id}...")
    response = await client.videos.download_content(video.id, variant="video")

    # Create a temporary file with .mp4 extension
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4", mode="wb")

    try:
        # HTTPXBinaryResponse needs to be iterated or read
        for chunk in response.iter_bytes():
            temp_file.write(chunk)
        temp_file.flush()
        temp_path = temp_file.name
        print(f"✓ Video downloaded to: {temp_path}")
        return temp_path
    finally:
        temp_file.close()
