"""Dashboard metrics router."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.course import Course
from app.models.flashcard import Flashcard
from app.models.calendar_event import QuizQuestion
from app.models.session import Session

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


class DashboardStats(BaseModel):
    total_sessions: int
    flashcards_generated: int
    quizzes_completed: int
    courses_count: int


@router.get("/stats", response_model=DashboardStats)
async def get_stats(db: AsyncSession = Depends(get_db)) -> DashboardStats:
    """Aggregate statistics for the student cockpit dashboard."""
    sessions_cnt = await db.scalar(select(func.count(Session.id))) or 0
    flashcards_cnt = await db.scalar(select(func.count(Flashcard.id))) or 0
    quizzes_cnt = await db.scalar(select(func.count(QuizQuestion.id))) or 0
    courses_cnt = await db.scalar(select(func.count(Course.id))) or 0

    return DashboardStats(
        total_sessions=sessions_cnt,
        flashcards_generated=flashcards_cnt,
        quizzes_completed=quizzes_cnt,
        courses_count=courses_cnt,
    )

