"""Pydantic schemas for Flashcard."""

from __future__ import annotations

import uuid

from pydantic import BaseModel, Field


class FlashcardRead(BaseModel):
    id: uuid.UUID
    session_id: uuid.UUID
    front: str
    back: str
    difficulty: int

    model_config = {"from_attributes": True}


class FlashcardUpdate(BaseModel):
    front: str | None = None
    back: str | None = None
    difficulty: int | None = Field(None, ge=0, le=5)
