"""Audio extraction service using ffmpeg."""

from __future__ import annotations

import logging
import subprocess
import tempfile
from pathlib import Path

logger = logging.getLogger(__name__)


def extract_audio(video_url: str, output_path: str | None = None) -> str:
    """
    Extract audio from a video URL using ffmpeg and save as MP3.

    Args:
        video_url: Direct URL or local path to the source video/audio file.
        output_path: Optional explicit destination path. If ``None``, a temp
                     file is created automatically.

    Returns:
        Absolute path to the extracted MP3 file.

    Raises:
        RuntimeError: If ffmpeg exits with a non-zero return code.
    """
    if output_path is None:
        tmp = tempfile.NamedTemporaryFile(suffix=".mp3", delete=False)
        output_path = tmp.name
        tmp.close()

    cmd = [
        "ffmpeg",
        "-y",                # overwrite output without asking
        "-i", video_url,     # input (URL or file path)
        "-vn",               # strip video
        "-acodec", "libmp3lame",
        "-q:a", "2",         # VBR quality 2 (~190 kbps)
        "-ar", "16000",      # 16 kHz sample rate (optimal for Whisper)
        "-ac", "1",          # mono
        output_path,
    ]

    logger.info("Running ffmpeg: %s", " ".join(cmd))
    result = subprocess.run(cmd, capture_output=True, text=True)  # noqa: S603

    if result.returncode != 0:
        raise RuntimeError(
            f"ffmpeg failed (code {result.returncode}):\n{result.stderr}"
        )

    logger.info("Audio extracted to %s", output_path)
    return output_path


def extract_keyframes(video_url: str, output_dir: str | None = None) -> list[str]:
    """
    Extract scene-change keyframes from a video using ffmpeg scene detection.

    Args:
        video_url: Source video URL or path.
        output_dir: Directory to save JPEG frames. Defaults to a temp directory.

    Returns:
        Sorted list of absolute paths to the extracted JPEG files.

    Raises:
        RuntimeError: If ffmpeg exits with a non-zero return code.
    """
    if output_dir is None:
        output_dir = tempfile.mkdtemp()

    frames_pattern = str(Path(output_dir) / "frame_%04d.jpg")

    cmd = [
        "ffmpeg",
        "-y",
        "-i", video_url,
        "-vf", "select=gt(scene\\,0.3),scale=1280:-1",
        "-vsync", "vfr",
        frames_pattern,
    ]

    logger.info("Extracting keyframes: %s", " ".join(cmd))
    result = subprocess.run(cmd, capture_output=True, text=True)  # noqa: S603

    if result.returncode != 0:
        raise RuntimeError(
            f"ffmpeg keyframe extraction failed (code {result.returncode}):\n{result.stderr}"
        )

    frames = sorted(Path(output_dir).glob("frame_*.jpg"))
    logger.info("Extracted %d keyframes to %s", len(frames), output_dir)
    return [str(f) for f in frames]
