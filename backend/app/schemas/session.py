"""Pydantic schemas for Session."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, model_validator

SessionStatus = Literal["queued", "transcribing", "generating", "ready", "failed"]


class IngestRequest(BaseModel):
    bbb_base_url: str = Field(..., examples=["https://bbb.example.com"])
    bbb_meeting_id: str | None = Field(default=None, examples=["abc123-xyz"])
    meeting_id: str | None = Field(default=None, examples=["abc123-xyz"])
    course_id: uuid.UUID

    @model_validator(mode="after")
    def validate_meeting_id(self) -> IngestRequest:
        if not self.bbb_meeting_id and not self.meeting_id:
            raise ValueError("Either bbb_meeting_id or meeting_id must be provided")
        if not self.bbb_meeting_id and self.meeting_id:
            self.bbb_meeting_id = self.meeting_id
        return self


class IngestResponse(BaseModel):
    task_id: str
    session_id: uuid.UUID
    status: str = "queued"
    message: str = "Ingestion pipeline triggered successfully."


class SessionRead(BaseModel):
    id: uuid.UUID
    course_id: uuid.UUID
    bbb_meeting_id: str
    bbb_base_url: str | None = None
    recorded_at: datetime | None = None
    duration_seconds: int | None = None
    video_url: str | None = None
    audio_url: str | None = None
    status: str
    error_message: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class SessionStatusResponse(BaseModel):
    id: uuid.UUID
    session_id: uuid.UUID
    status: str
    progress: int | None = 0
    error_message: str | None = None
    recorded_at: datetime | None = None
    duration_seconds: int | None = None
