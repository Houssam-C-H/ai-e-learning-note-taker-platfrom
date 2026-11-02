"""Celery task: run LLM pipeline to generate notes, flashcards, quiz, etc."""

from __future__ import annotations

import json
import logging
import uuid as _uuid
from datetime import datetime, timezone
from typing import Any

from app.config import settings
from app.services.llm_service import generate_notes
from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)


def _get_sync_conn():
    import psycopg2  # type: ignore[import]
    import psycopg2.extras  # noqa: F401 — registers UUID adapter

    dsn = settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
    return psycopg2.connect(dsn)


def _fetch_transcript(session_id: str) -> list[dict[str, Any]]:
    """Load raw_transcript JSON from the notes table."""
    conn = _get_sync_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT raw_transcript FROM notes WHERE session_id = %s LIMIT 1",
                (session_id,),
            )
            row = cur.fetchone()
            if row is None or row[0] is None:
                return []
            data = row[0]
            return data if isinstance(data, list) else json.loads(data)
    finally:
        conn.close()


def _save_results(session_id: str, data: dict[str, Any]) -> None:
    """Persist all LLM output to the database."""
    conn = _get_sync_conn()
    try:
        with conn.cursor() as cur:
            meta = data.get("lecture_metadata", {})
            markdown = data.get("markdown_notes", "")
            exec_summary = meta.get("executive_summary", "")

            # Update the notes row
            cur.execute(
                """
                UPDATE notes
                SET markdown_content   = %s,
                    executive_summary  = %s,
                    key_terms          = %s
                WHERE session_id = %s
                """,
                (
                    markdown,
                    exec_summary,
                    json.dumps(meta.get("tags", [])),
                    session_id,
                ),
            )

            # Flashcards
            for fc in data.get("flashcards", []):
                cur.execute(
                    """
                    INSERT INTO flashcards (id, session_id, front, back, difficulty)
                    VALUES (%s, %s, %s, %s, 0)
                    """,
                    (str(_uuid.uuid4()), session_id, fc["front"], fc["back"]),
                )

            # Quiz questions
            for q in data.get("quiz", []):
                cur.execute(
                    """
                    INSERT INTO quiz_questions
                        (id, session_id, question, options, correct_option_index, explanation)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """,
                    (
                        str(_uuid.uuid4()),
                        session_id,
                        q["question"],
                        json.dumps(q.get("options", [])),
                        q.get("correct_option_index", 0),
                        q.get("explanation", ""),
                    ),
                )

            # Mark session ready
            cur.execute(
                "UPDATE sessions SET status = 'ready' WHERE id = %s",
                (session_id,),
            )

        conn.commit()
    finally:
        conn.close()


@celery_app.task(bind=True, name="tasks.generate_notes", max_retries=2)
def generate_notes_task(self, session_id: str) -> dict:
    """
    Read the transcript and call the LLM to produce structured academic content.

    Args:
        session_id: UUID string of the parent session.

    Returns:
        Dict with ``session_id`` and counts of generated content.
    """
    logger.info("[ai_pipeline] Generating notes for session=%s", session_id)

    segments = _fetch_transcript(session_id)
    if not segments:
        msg = f"No transcript found for session {session_id}"
        logger.error(msg)
        conn = _get_sync_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE sessions SET status = 'failed', error_message = %s WHERE id = %s",
                    (msg, session_id),
                )
            conn.commit()
        finally:
            conn.close()
        return {"session_id": session_id, "error": msg}

    try:
        result = generate_notes(segments)
    except Exception as exc:
        logger.exception("[ai_pipeline] LLM call failed: %s", exc)
        conn = _get_sync_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE sessions SET status = 'failed', error_message = %s WHERE id = %s",
                    (str(exc), session_id),
                )
            conn.commit()
        finally:
            conn.close()
        raise self.retry(exc=exc, countdown=120)

    _save_results(session_id, result)

    logger.info(
        "[ai_pipeline] Done session=%s flashcards=%d quiz=%d",
        session_id,
        len(result.get("flashcards", [])),
        len(result.get("quiz", [])),
    )

    return {
        "session_id": session_id,
        "flashcards": len(result.get("flashcards", [])),
        "quiz_questions": len(result.get("quiz", [])),
        "status": "ready",
    }
