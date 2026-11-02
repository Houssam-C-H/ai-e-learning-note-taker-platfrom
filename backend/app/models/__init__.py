"""Models package — import all ORM models so Alembic can detect them."""

from app.database import Base
from app.models.calendar_event import CalendarEvent, LectureSegment, QuizQuestion
from app.models.course import Course
from app.models.flashcard import Flashcard
from app.models.note import Note
from app.models.session import Session

__all__ = [
    "Base",
    "Course",
    "Session",
    "Note",
    "Flashcard",
    "CalendarEvent",
    "QuizQuestion",
    "LectureSegment",
]
