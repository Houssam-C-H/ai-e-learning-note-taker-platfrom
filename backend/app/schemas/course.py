"""Pydantic schemas for Course."""

from __future__ import annotations

import uuid

from pydantic import BaseModel, Field


class CourseBase(BaseModel):
    code: str = Field(..., max_length=50, examples=["CS101"])
    name: str = Field(..., max_length=255, examples=["Introduction to Computer Science"])
    color: str = Field(default="#3B82F6", pattern=r"^#[0-9A-Fa-f]{6}$")


class CourseCreate(CourseBase):
    pass


class CoursePatch(BaseModel):
    code: str | None = Field(None, max_length=50)
    name: str | None = Field(None, max_length=255)
    color: str | None = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")


class CourseRead(CourseBase):
    id: uuid.UUID

    model_config = {"from_attributes": True}
