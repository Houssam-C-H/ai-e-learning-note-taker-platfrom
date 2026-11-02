"""Pydantic schemas for Note."""

from __future__ import annotations

import uuid
from typing import Any

from pydantic import BaseModel


class NoteRead(BaseModel):
    id: uuid.UUID
    session_id: uuid.UUID
    raw_transcript: Any | None = None
    markdown_content: str | None = None
    summary: str | None = None
    key_terms: Any | None = None
    executive_summary: str | None = None

    model_config = {"from_attributes": True}


class NoteUpdate(BaseModel):
    markdown_content: str | None = None
    summary: str | None = None
    executive_summary: str | None = None
