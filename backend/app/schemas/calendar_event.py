"""Pydantic schemas for CalendarEvent and QuizQuestion."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, List, Literal

from pydantic import BaseModel, Field

EventType = Literal["lecture", "exam", "deadline"]


class CalendarEventRead(BaseModel):
    id: uuid.UUID
    course_id: uuid.UUID
    session_id: uuid.UUID | None = None
    title: str
    start_time: datetime
    end_time: datetime
    event_type: str
    description: str | None = None

    model_config = {"from_attributes": True}


class CalendarEventCreate(BaseModel):
    course_id: uuid.UUID
    session_id: uuid.UUID | None = None
    title: str
    start_time: datetime
    end_time: datetime
    event_type: EventType = "lecture"
    description: str | None = None


class QuizQuestionRead(BaseModel):
    id: uuid.UUID
    session_id: uuid.UUID
    question: str
    options: List[str]
    correct_option_index: int
    explanation: str | None = None

    model_config = {"from_attributes": True}


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1)
    course_id: uuid.UUID | None = None


class ChatResponse(BaseModel):
    answer: str
    sources: List[dict[str, Any]] = Field(default_factory=list)
