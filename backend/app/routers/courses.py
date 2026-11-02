"""CRUD router for courses."""

from __future__ import annotations

import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.course import Course
from app.schemas.course import CourseCreate, CoursePatch, CourseRead

router = APIRouter(prefix="/api/courses", tags=["courses"])


@router.get("", response_model=List[CourseRead])
async def list_courses(
    db: AsyncSession = Depends(get_db),
) -> List[Course]:
    """Return all courses."""
    result = await db.execute(select(Course).order_by(Course.name))
    return list(result.scalars().all())


@router.post("", response_model=CourseRead, status_code=status.HTTP_201_CREATED)
async def create_course(
    payload: CourseCreate,
    db: AsyncSession = Depends(get_db),
) -> Course:
    """Create a new course."""
    course = Course(**payload.model_dump())
    db.add(course)
    await db.flush()
    await db.refresh(course)
    return course


@router.get("/{course_id}", response_model=CourseRead)
async def get_course(
    course_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> Course:
    """Retrieve a single course by ID."""
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.patch("/{course_id}", response_model=CourseRead)
async def patch_course(
    course_id: uuid.UUID,
    payload: CoursePatch,
    db: AsyncSession = Depends(get_db),
) -> Course:
    """Partially update a course."""
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(course, field, value)

    await db.flush()
    await db.refresh(course)
    return course
