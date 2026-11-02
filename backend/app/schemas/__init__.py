"""Schemas package."""

from app.schemas.calendar_event import (
    CalendarEventCreate,
    CalendarEventRead,
    ChatRequest,
    ChatResponse,
    QuizQuestionRead,
)
from app.schemas.course import CourseCreate, CoursePatch, CourseRead
from app.schemas.flashcard import FlashcardRead, FlashcardUpdate
from app.schemas.note import NoteRead, NoteUpdate
from app.schemas.session import (
    IngestRequest,
    IngestResponse,
    SessionRead,
    SessionStatusResponse,
)

__all__ = [
    "CourseCreate",
    "CoursePatch",
    "CourseRead",
    "IngestRequest",
    "IngestResponse",
    "SessionRead",
    "SessionStatusResponse",
    "NoteRead",
    "NoteUpdate",
    "FlashcardRead",
    "FlashcardUpdate",
    "CalendarEventCreate",
    "CalendarEventRead",
    "QuizQuestionRead",
    "ChatRequest",
    "ChatResponse",
]
