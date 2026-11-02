"""Quiz router."""

from __future__ import annotations

import uuid
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.calendar_event import QuizQuestion
from app.schemas.calendar_event import QuizQuestionRead

router = APIRouter(prefix="/api/sessions", tags=["quiz"])


@router.get("/{session_id}/quiz", response_model=List[QuizQuestionRead])
async def get_quiz(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> List[QuizQuestion]:
    """Retrieve all quiz questions for a session."""
    result = await db.execute(
        select(QuizQuestion).where(QuizQuestion.session_id == session_id)
    )
    return list(result.scalars().all())
