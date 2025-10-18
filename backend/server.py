from datetime import datetime
import json
from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from browseruse_get_latest_articles import get_latest_articles_and_summarize

from utils.elevenlabs import text_to_speech
from utils.scene_converter import (
    Scene,
    convert_to_scenes,
    create_sora_video,
    download_sora_video,
    scene_to_sora_prompt,
)
from utils.video_processing import (
    combine_video_audio,
    combine_video_audio_with_padding,
    concatenate_videos,
)
import uvicorn
import asyncio
from ruamel.yaml import YAML


app = FastAPI()

MAX_CONCURRENT_REQUESTS = 10
semaphore = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)


async def process_scene(scene: Scene, scene_index: int):
    async with semaphore:
        try:
            print(f"Processing scene {scene_index}...")

            # Add timeout for entire scene processing (3 minutes max)
            async with asyncio.timeout(180):
                sora_prompt = await scene_to_sora_prompt(scene)

                # Convert Sora Video
                sora_video = await create_sora_video(sora_prompt)
                if sora_video is None:
                    raise Exception("Sora video creation failed")
                sora_video_path = await download_sora_video(sora_video)

                # Convert Audio with 11Labs
                audio_bytes = await text_to_speech(scene.voice_over)

                # Combine video and audio
                final_video_path = await combine_video_audio_with_padding(sora_video_path, audio_bytes)

                print(f"✓ Scene {scene_index} processed successfully")
                return {
                    "scene_index": scene_index,
                    "scene": scene.dict(),
                    "sora_prompt": sora_prompt,
                    "sora_video": sora_video.model_dump() if sora_video else None,
                    "final_video_path": final_video_path,
                }
        except asyncio.TimeoutError:
            error_msg = f"✗ Scene {scene_index} timed out after 600 seconds"
            print(error_msg)
            return {
                "scene_index": scene_index,
                "scene": scene.model_dump(),
                "error": error_msg,
            }
        except Exception as e:
            error_msg = f"✗ Error processing scene {scene_index}: {type(e).__name__}: {str(e)}"
            print(error_msg)
            return {
                "scene_index": scene_index,
                "scene": scene.model_dump(),
                "error": str(e),
            }


@app.get("/latest")
async def latest_articles(
    url: str = Query(..., description="Website to look for articles"),
):
    print(f"Working on: {url}")
    summaries: dict[str, str] | None = await get_latest_articles_and_summarize(
        url, num_articles=3, max_summary_length=4
    )
    if summaries:
        result = {}
        result["status"] = "success"
        result["summaries"] = summaries
        now = datetime.now()
        # Format it as a string
        formatted_now = now.strftime("%Y-%m-%d_%H:%M:%S")
        with open(f"summaries/{url.replace("/", "-")}_{formatted_now}.json", "w") as f:
            json.dump(summaries, f)

    # If result is None, it failed
    else:
        result = {}
        result["status"] = "failed"
    return JSONResponse(content=result)


class Articles(BaseModel):
    summaries: dict[str, str]
    status: str


@app.post("/sora")
async def generate_video(articles: Articles):
    # result = await get_latest_articles(url)

    structured_articles = {}
    for article_url, content in articles.summaries:
        scenes = await convert_to_scenes(
            content,
        )
        if not scenes:
            print(f"Scene generation fail for {article_url}")
            continue

        # Process scenes with return_exceptions=True so failures don't block others
        processed_scenes = await asyncio.gather(
            *[process_scene(scene, idx) for idx, scene in enumerate(scenes.scenes)],
            return_exceptions=True,
        )

        # Filter out exceptions and failed scenes
        final_videos = []
        valid_scenes = []
        for idx, result in enumerate(processed_scenes):
            if isinstance(result, Exception):
                print(f"✗ Scene {idx} raised exception: {type(result).__name__}: {result}")
                valid_scenes.append(
                    {
                        "scene_index": idx,
                        "error": f"{type(result).__name__}: {str(result)}",
                    }
                )
            elif isinstance(result, dict) and "error" in result:
                print(f"✗ Scene {idx} failed: {result['error']}")
                valid_scenes.append(result)
            elif isinstance(result, dict) and "final_video_path" in result:
                final_videos.append(result["final_video_path"])
                valid_scenes.append(result)
            else:
                print(f"✗ Scene {idx} returned unexpected result: {result}")
                valid_scenes.append({"scene_index": idx, "error": "Unexpected result format"})

        if not final_videos:
            print(f"✗ No valid videos generated for {article_url}")
            structured_articles[article_url] = {
                "error": "All scenes failed to process",
                "scenes": valid_scenes,
            }
            continue

        print(f"✓ Concatenating {len(final_videos)} videos...")
        final_video = await concatenate_videos(final_videos)
        print(f"✓ Final video created: {final_video}")

        structured_articles[article_url] = {
            "final_video_path": final_video,
            "scenes": valid_scenes,
        }

    return JSONResponse(content=structured_articles)


if __name__ == "__main__":
    uvicorn.run("server:app", host="127.0.0.1", port=3000)
