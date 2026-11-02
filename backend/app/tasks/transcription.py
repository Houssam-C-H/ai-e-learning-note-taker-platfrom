"""Celery task: transcribe audio with faster-whisper and persist transcript."""

from __future__ import annotations

import json
import logging

from app.config import settings
from app.services.whisper_service import transcribe
from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)


def _sync_save_transcript(session_id: str, segments: list) -> None:
    """Persist transcript segments to the notes table via psycopg2."""
    import psycopg2  # type: ignore[import]
    import psycopg2.extras

    dsn = settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
    conn = psycopg2.connect(dsn)
    try:
        with conn.cursor() as cur:
            # Upsert into notes: insert a note row if one doesn't exist yet,
            # then update the raw_transcript field.
            cur.execute(
                """
                INSERT INTO notes (id, session_id, raw_transcript)
                VALUES (gen_random_uuid(), %s, %s)
                ON CONFLICT (session_id)
                DO UPDATE SET raw_transcript = EXCLUDED.raw_transcript
                """,
                (session_id, json.dumps(segments)),
            )
        conn.commit()
    finally:
        conn.close()


def _sync_update_session_status(session_id: str, status: str, error: str | None = None) -> None:
    import psycopg2  # type: ignore[import]

    dsn = settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
    conn = psycopg2.connect(dsn)
    try:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE sessions SET status = %s, error_message = %s WHERE id = %s",
                (status, error, session_id),
            )
        conn.commit()
    finally:
        conn.close()


@celery_app.task(bind=True, name="tasks.transcribe_audio", max_retries=2)
def transcribe_audio(self, session_id: str, audio_path: str) -> dict:
    """
    Transcribe an audio file using faster-whisper.

    Args:
        session_id: UUID string of the parent session.
        audio_path: Local filesystem path to the MP3 file.

    Returns:
        Dict with ``session_id`` and number of transcript ``segments``.
    """
    logger.info("[transcribe] session=%s audio=%s", session_id, audio_path)

    try:
        segments = transcribe(
            audio_path,
            model_size=settings.WHISPER_MODEL,
            device=settings.WHISPER_DEVICE,
        )
    except Exception as exc:
        logger.exception("[transcribe] Failed: %s", exc)
        _sync_update_session_status(session_id, "failed", str(exc))
        raise self.retry(exc=exc, countdown=120)

    _sync_save_transcript(session_id, segments)
    logger.info("[transcribe] Saved %d segments for session=%s", len(segments), session_id)

    return {"session_id": session_id, "segments": len(segments)}
