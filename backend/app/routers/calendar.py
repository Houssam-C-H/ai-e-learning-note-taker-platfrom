"""Calendar events router."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.calendar_event import CalendarEvent
from app.schemas.calendar_event import CalendarEventCreate, CalendarEventRead

router = APIRouter(prefix="/api/calendar", tags=["calendar"])


@router.get("/events", response_model=List[CalendarEventRead])
async def list_events(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    course_id: Optional[uuid.UUID] = Query(None),
    db: AsyncSession = Depends(get_db),
) -> List[CalendarEvent]:
    """
    Return calendar events with optional filters.

    - **start_date**: include events starting on or after this datetime
    - **end_date**: include events starting on or before this datetime
    - **course_id**: filter to a specific course
    """
    filters = []
    if start_date is not None:
        filters.append(CalendarEvent.start_time >= start_date)
    if end_date is not None:
        filters.append(CalendarEvent.start_time <= end_date)
    if course_id is not None:
        filters.append(CalendarEvent.course_id == course_id)

    query = select(CalendarEvent).order_by(CalendarEvent.start_time)
    if filters:
        query = query.where(and_(*filters))

    result = await db.execute(query)
    return list(result.scalars().all())


@router.post("/events", response_model=CalendarEventRead, status_code=status.HTTP_201_CREATED)
async def create_event(
    payload: CalendarEventCreate,
    db: AsyncSession = Depends(get_db),
) -> CalendarEvent:
    """Create a calendar event."""
    event = CalendarEvent(**payload.model_dump())
    db.add(event)
    await db.flush()
    await db.refresh(event)
    return event
