"""Main ingestion Celery task — orchestrates the full BBB recording pipeline."""

from __future__ import annotations

import logging
import tempfile

import httpx
from celery import chain

from app.services.audio_extractor import extract_audio
from app.services.bbb_parser import parse_metadata
from app.services.storage import upload_file
from app.tasks.ai_pipeline import generate_notes_task
from app.tasks.celery_app import celery_app
from app.tasks.transcription import transcribe_audio

logger = logging.getLogger(__name__)


def _sync_update_session(session_id: str, **fields) -> None:
    """Synchronously update session fields using a new sync DB connection."""
    import psycopg2  # type: ignore[import]
    from app.config import settings

    # Build a synchronous DSN from the async one
    dsn = settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
    conn = psycopg2.connect(dsn)
    try:
        with conn.cursor() as cur:
            set_clause = ", ".join(f"{k} = %s" for k in fields)
            values = list(fields.values()) + [session_id]
            cur.execute(
                f"UPDATE sessions SET {set_clause} WHERE id = %s",  # noqa: S608
                values,
            )
        conn.commit()
    finally:
        conn.close()


@celery_app.task(bind=True, name="tasks.ingest_bbb_recording", max_retries=3)
def ingest_bbb_recording(
    self,
    session_id: str,
    bbb_base_url: str,
    bbb_meeting_id: str,
) -> dict:
    """
    Orchestrate full ingestion of a BBB recording.

    Steps:
    1. Fetch metadata.xml → update session with recorded_at / duration.
    2. Download webcams.webm, extract MP3 via ffmpeg.
    3. Upload MP3 to MinIO.
    4. Chain: transcribe → generate_notes.

    Args:
        session_id: UUID string of the target session row.
        bbb_base_url: Base URL of the BBB instance (no trailing slash).
        bbb_meeting_id: Internal BBB meeting ID.
    """
    logger.info("[ingest] Starting session=%s", session_id)
    _sync_update_session(session_id, status="transcribing")

    # ── 1. Fetch metadata ────────────────────────────────────────────────────
    metadata_url = (
        f"{bbb_base_url}/presentation/{bbb_meeting_id}/metadata.xml"
    )
    try:
        response = httpx.get(metadata_url, timeout=30, follow_redirects=True)
        response.raise_for_status()
        metadata = parse_metadata(response.text)

        _sync_update_session(
            session_id,
            recorded_at=metadata["recorded_at"].isoformat(),
            duration_seconds=metadata["duration_seconds"],
        )
        logger.info("[ingest] Metadata parsed: %s", metadata["name"])
    except Exception as exc:
        logger.exception("[ingest] Metadata fetch failed: %s", exc)
        _sync_update_session(session_id, status="failed", error_message=str(exc))
        raise self.retry(exc=exc, countdown=60)

    # ── 2. Download and extract audio ────────────────────────────────────────
    video_url = (
        f"{bbb_base_url}/presentation/{bbb_meeting_id}/video/webcams.webm"
    )
    try:
        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
            audio_path = tmp.name

        audio_path = extract_audio(video_url, audio_path)
        logger.info("[ingest] Audio extracted: %s", audio_path)
    except Exception as exc:
        logger.exception("[ingest] Audio extraction failed: %s", exc)
        _sync_update_session(session_id, status="failed", error_message=str(exc))
        raise self.retry(exc=exc, countdown=60)

    # ── 3. Upload to MinIO ───────────────────────────────────────────────────
    try:
        object_name = f"audio/{session_id}.mp3"
        audio_url = upload_file(audio_path, object_name)
        _sync_update_session(session_id, audio_url=audio_url)
        logger.info("[ingest] Audio uploaded: %s", audio_url)
    except Exception as exc:
        logger.exception("[ingest] Audio upload failed: %s", exc)
        _sync_update_session(session_id, status="failed", error_message=str(exc))
        raise self.retry(exc=exc, countdown=60)

    # ── 4. Chain downstream tasks ────────────────────────────────────────────
    pipeline = chain(
        transcribe_audio.si(session_id, audio_path),
        generate_notes_task.si(session_id),
    )
    pipeline.delay()

    return {"session_id": session_id, "status": "transcribing"}
