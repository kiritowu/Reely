import ffmpeg
import tempfile
import os
from typing import List


async def combine_video_audio(video_path: str, audio_bytes: bytes) -> str:
    """
    Combine video file with audio bytes using FFmpeg.

    Args:
        video_path: Path to the video file (.mp4)
        audio_bytes: Audio data as bytes

    Returns:
        Path to the combined video file
    """
    print(f"Combining video and audio...")

    # Save audio bytes to temporary file
    audio_temp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3", mode="wb")
    audio_temp.write(audio_bytes)
    audio_temp.close()
    audio_path = audio_temp.name

    # Create output temporary file
    output_temp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
    output_temp.close()
    output_path = output_temp.name

    try:
        # Load video and audio streams
        video = ffmpeg.input(video_path)
        audio = ffmpeg.input(audio_path)

        # Combine video and audio, replacing original audio if exists
        stream = ffmpeg.output(
            video.video,  # Take video stream from video file
            audio.audio,  # Take audio stream from audio file
            output_path,
            vcodec="copy",  # Copy video codec (no re-encoding)
            acodec="aac",  # Encode audio to AAC
            strict="experimental",
            shortest=None,  # Don't cut to shortest stream
        )

        # Run FFmpeg command
        ffmpeg.run(stream, overwrite_output=True, quiet=True)

        print(f"✓ Video and audio combined: {output_path}")
        return output_path

    finally:
        # Clean up temporary audio file
        if os.path.exists(audio_path):
            os.remove(audio_path)


async def combine_video_audio_with_padding(video_path: str, audio_bytes: bytes) -> str:
    """
    Combine video with audio, adjusting lengths to match.
    If audio is longer, loop the video. If video is longer, loop the audio.

    Args:
        video_path: Path to the video file (.mp4)
        audio_bytes: Audio data as bytes

    Returns:
        Path to the combined video file
    """
    print(f"Combining video and audio with length adjustment...")

    # Save audio bytes to temporary file
    audio_temp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3", mode="wb")
    audio_temp.write(audio_bytes)
    audio_temp.close()
    audio_path = audio_temp.name

    # Create output temporary file
    output_temp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
    output_temp.close()
    output_path = output_temp.name

    try:
        # Probe to get video and audio durations
        video_info = ffmpeg.probe(video_path)
        audio_info = ffmpeg.probe(audio_path)

        video_duration = float(video_info["format"]["duration"])
        audio_duration = float(audio_info["format"]["duration"])

        print(f"Video duration: {video_duration}s, Audio duration: {audio_duration}s")

        # If video is shorter than audio, loop the video
        if video_duration < audio_duration:
            # Calculate how many times to loop
            loop_count = int(audio_duration / video_duration) + 1
            print(f"Looping video {loop_count} times to match audio length")

            # Use stream_loop to repeat the video input
            video = ffmpeg.input(video_path, stream_loop=loop_count)
            audio = ffmpeg.input(audio_path)

            stream = ffmpeg.output(
                video.video,
                audio.audio,
                output_path,
                vcodec="libx264",
                acodec="aac",
                t=audio_duration,  # Trim to audio duration
                preset="fast",  # Faster encoding
            )
        else:
            # Video is longer or equal - just combine normally
            video = ffmpeg.input(video_path)
            audio = ffmpeg.input(audio_path)

            stream = ffmpeg.output(
                video.video,
                audio.audio,
                output_path,
                vcodec="copy",  # Copy video codec (faster)
                acodec="aac",
                shortest=None,
            )

        ffmpeg.run(stream, overwrite_output=True, quiet=True)

        print(f"✓ Video and audio combined with padding: {output_path}")
        return output_path
    except Exception as e:
        print(f"✗ Error combining video and audio with padding: {str(e)}")
        raise e
    finally:
        # Clean up temporary audio file
        if os.path.exists(audio_path):
            os.remove(audio_path)


async def concatenate_videos(
    video_paths: List[str], output_path: str | None = None
) -> str:
    """
    Concatenate multiple videos sequentially into one video.

    Args:
        video_paths: List of paths to video files to concatenate
        output_path: Optional output path. If None, creates a temporary file

    Returns:
        Path to the concatenated video file
    """
    if not video_paths:
        raise ValueError("video_paths list cannot be empty")

    if len(video_paths) == 1:
        print("Only one video provided, returning as is")
        return video_paths[0]

    print(f"Concatenating {len(video_paths)} videos...")

    # Create output path if not provided
    if output_path is None:
        output_temp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
        output_temp.close()
        output_path = output_temp.name

    # Create a temporary file list for FFmpeg concat demuxer
    concat_file = tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".txt")

    try:
        # Write file list in FFmpeg concat format
        for video_path in video_paths:
            # Escape special characters and write to concat file
            escaped_path = video_path.replace("'", "'\\''")
            concat_file.write(f"file '{escaped_path}'\n")
        concat_file.close()

        # Use concat demuxer (fast, no re-encoding if codecs match)
        stream = ffmpeg.input(concat_file.name, format="concat", safe=0)
        stream = ffmpeg.output(stream, output_path, c="copy")

        ffmpeg.run(stream, overwrite_output=True, quiet=True)

        print(f"✓ Videos concatenated successfully: {output_path}")
        return output_path

    except Exception as e:
        print(f"✗ Concat demuxer failed, trying concat filter: {str(e)}")

        # Fallback: use concat filter (slower but more flexible)
        try:
            # Load all video inputs
            inputs = [ffmpeg.input(path) for path in video_paths]

            # Concatenate using filter
            stream = ffmpeg.concat(*inputs, v=1, a=1)
            stream = ffmpeg.output(stream, output_path)

            ffmpeg.run(stream, overwrite_output=True, quiet=True)

            print(f"✓ Videos concatenated with filter: {output_path}")
            return output_path

        except Exception as filter_error:
            print(f"✗ Error concatenating videos: {str(filter_error)}")
            raise

    finally:
        # Clean up concat file list
        if os.path.exists(concat_file.name):
            os.remove(concat_file.name)
