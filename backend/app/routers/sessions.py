"""Sessions router — CRUD + BBB ingestion trigger."""

from __future__ import annotations

import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.course import Course
from app.models.session import Session
from app.schemas.session import (
    IngestRequest,
    IngestResponse,
    SessionRead,
    SessionStatusResponse,
)

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


@router.post("/ingest", response_model=IngestResponse, status_code=status.HTTP_202_ACCEPTED)
async def ingest_session(
    payload: IngestRequest,
    db: AsyncSession = Depends(get_db),
) -> IngestResponse:
    """
    Trigger ingestion of a BigBlueButton recording.

    Creates (or returns existing) session record and enqueues a Celery task.
    """
    meeting_id = payload.bbb_meeting_id or payload.meeting_id
    if not meeting_id:
        raise HTTPException(status_code=400, detail="Meeting ID is required")

    # Validate course exists
    course_result = await db.execute(
        select(Course).where(Course.id == payload.course_id)
    )
    if course_result.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail="Course not found")

    # Check if session already exists
    existing = await db.execute(
        select(Session).where(Session.bbb_meeting_id == meeting_id)
    )
    session = existing.scalar_one_or_none()

    if session is None:
        session = Session(
            course_id=payload.course_id,
            bbb_meeting_id=meeting_id,
            bbb_base_url=payload.bbb_base_url,
            status="queued",
        )
        db.add(session)
        await db.flush()
        await db.refresh(session)

    # Import here to avoid circular imports at module level
    from app.tasks.ingestion import ingest_bbb_recording  # noqa: PLC0415

    task = ingest_bbb_recording.delay(
        str(session.id), payload.bbb_base_url, meeting_id
    )

    return IngestResponse(
        task_id=task.id,
        session_id=session.id,
        status=session.status,
        message="Recording queued for processing",
    )


@router.get("/{session_id}/status", response_model=SessionStatusResponse)
async def get_session_status(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> SessionStatusResponse:
    """Return processing status of a session."""
    result = await db.execute(select(Session).where(Session.id == session_id))
    session = result.scalar_one_or_none()
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    progress_map = {
        "queued": 10,
        "transcribing": 40,
        "generating": 75,
        "ready": 100,
        "failed": 0,
    }

    return SessionStatusResponse(
        id=session.id,
        session_id=session.id,
        status=session.status,
        progress=progress_map.get(session.status, 20),
        error_message=session.error_message,
        recorded_at=session.recorded_at,
        duration_seconds=session.duration_seconds,
    )


@router.get("", response_model=List[SessionRead])
async def list_sessions(
    course_id: uuid.UUID | None = None,
    db: AsyncSession = Depends(get_db),
) -> List[Session]:
    """List sessions, optionally filtered by course."""
    query = select(Session).order_by(Session.created_at.desc())
    if course_id is not None:
        query = query.where(Session.course_id == course_id)
    result = await db.execute(query)
    return list(result.scalars().all())


@router.get("/{session_id}", response_model=SessionRead)
async def get_session(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> Session:
    """Retrieve a single session."""
    result = await db.execute(select(Session).where(Session.id == session_id))
    session = result.scalar_one_or_none()
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return session
