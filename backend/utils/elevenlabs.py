from elevenlabs import AsyncElevenLabs
import os


client = AsyncElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))


async def text_to_speech(
    text: str, voice: str = "rU18Fk3uSDhmg5Xh41o4", model: str = "eleven_turbo_v2_5"
) -> bytes:
    """
    Convert text to speech using ElevenLabs API.

    Args:
        text: The text to convert to speech
        voice: The voice ID or name to use (default: "Rachel")
        model: The model to use (default: "eleven_turbo_v2_5")

    Returns:
        Audio data as bytes
    """
    print("Converting text to speech...")
    audio_generator = client.text_to_speech.convert(
        text=text,
        voice_id=voice,
        model_id=model,
    )

    audio_bytes = b""
    async for chunk in audio_generator:
        audio_bytes += chunk

    return audio_bytes
