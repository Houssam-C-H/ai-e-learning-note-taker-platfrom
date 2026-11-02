"""Main FastAPI application entrypoint."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import (
    calendar_router,
    chat_router,
    courses_router,
    dashboard_router,
    flashcards_router,
    notes_router,
    quiz_router,
    sessions_router,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("elearning.app")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Startup and shutdown lifecycle handler."""
    logger.info("Starting up AI E-Learning Note-Taker API...")
    logger.info("Configured CORS origins: %s", settings.CORS_ORIGINS)
    yield
    logger.info("Shutting down AI E-Learning Note-Taker API...")


app = FastAPI(
    title="AI E-Learning Note-Taker Platform API",
    description="Backend API powering BigBlueButton ingestion, Whisper STT, AI notes synthesis, Flashcards, and RAG Tutor.",
    version="1.0.0",
    lifespan=lifespan,
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(courses_router)
app.include_router(sessions_router)
app.include_router(notes_router)
app.include_router(flashcards_router)
app.include_router(quiz_router)
app.include_router(calendar_router)
app.include_router(chat_router)
app.include_router(dashboard_router)


@app.get("/", tags=["health"])
async def root():
    """Root health and discovery endpoint."""
    return {
        "status": "online",
        "service": "AI E-Learning Note-Taker Platform API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint for container orchestrators."""
    return {"status": "healthy"}
