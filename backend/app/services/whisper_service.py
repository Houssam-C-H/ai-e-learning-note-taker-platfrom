"""Whisper speech-to-text service using faster-whisper."""

from __future__ import annotations

import logging
from typing import Any

logger = logging.getLogger(__name__)

# Lazy-load the model so worker startup is fast
_model: Any = None


def _get_model(model_size: str = "base", device: str = "cpu") -> Any:
    """Return a cached WhisperModel instance."""
    global _model  # noqa: PLW0603
    if _model is None:
        try:
            from faster_whisper import WhisperModel  # type: ignore[import]

            logger.info("Loading Whisper model '%s' on %s …", model_size, device)
            _model = WhisperModel(model_size, device=device, compute_type="int8")
            logger.info("Whisper model loaded.")
        except ImportError as exc:
            raise RuntimeError(
                "faster-whisper is not installed. "
                "Run: pip install faster-whisper"
            ) from exc
    return _model


def transcribe(
    audio_path: str,
    model_size: str = "base",
    device: str = "cpu",
) -> list[dict[str, Any]]:
    """
    Transcribe an audio file and return a list of segment dicts.

    Supports language auto-detection (French, English, Arabic).

    Args:
        audio_path: Local path to the MP3/WAV audio file.
        model_size: Whisper model variant (``tiny``, ``base``, ``small``, …).
        device: ``cpu`` or ``cuda``.

    Returns:
        List of dicts with keys ``id``, ``start``, ``end``, ``text``, ``language``.
    """
    model = _get_model(model_size, device)

    logger.info("Transcribing %s …", audio_path)
    segments_iter, info = model.transcribe(
        audio_path,
        language=None,                 # auto-detect
        vad_filter=True,               # remove silence
        vad_parameters={"min_silence_duration_ms": 500},
    )

    detected_language = getattr(info, "language", "unknown")
    logger.info("Detected language: %s", detected_language)

    segments: list[dict[str, Any]] = []
    for i, seg in enumerate(segments_iter):
        segments.append(
            {
                "id": i,
                "start": round(seg.start, 2),
                "end": round(seg.end, 2),
                "text": seg.text.strip(),
                "language": detected_language,
            }
        )

    logger.info("Transcription complete: %d segments", len(segments))
    return segments
