"""Routers package."""

from app.routers.calendar import router as calendar_router
from app.routers.chat import router as chat_router
from app.routers.courses import router as courses_router
from app.routers.dashboard import router as dashboard_router
from app.routers.flashcards import router as flashcards_router
from app.routers.notes import router as notes_router
from app.routers.quiz import router as quiz_router
from app.routers.sessions import router as sessions_router

__all__ = [
    "courses_router",
    "sessions_router",
    "notes_router",
    "flashcards_router",
    "quiz_router",
    "calendar_router",
    "chat_router",
    "dashboard_router",
]
