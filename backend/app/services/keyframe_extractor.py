"""Keyframe extraction service — thin wrapper kept for import compatibility.

The actual implementation lives in :mod:`app.services.audio_extractor`.
"""

from app.services.audio_extractor import extract_keyframes  # noqa: F401

__all__ = ["extract_keyframes"]
