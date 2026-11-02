"""CalendarEvent and QuizQuestion ORM models."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class CalendarEvent(Base):
    """A scheduled event (lecture, exam, deadline) linked to a course."""

    __tablename__ = "calendar_events"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    session_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("sessions.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    title: Mapped[str] = mapped_column(Text, nullable=False)
    start_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    event_type: Mapped[str] = mapped_column(
        String(50), nullable=False, default="lecture"
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # ── Relationships ─────────────────────────────────────────────────────────
    course: Mapped["Course"] = relationship(  # noqa: F821
        "Course", back_populates="calendar_events"
    )
    session: Mapped["Session | None"] = relationship(  # noqa: F821
        "Session", back_populates="calendar_events"
    )

    def __repr__(self) -> str:
        return f"<CalendarEvent id={self.id} type={self.event_type!r}>"


class QuizQuestion(Base):
    """Multiple-choice quiz question generated from a session."""

    __tablename__ = "quiz_questions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    question: Mapped[str] = mapped_column(Text, nullable=False)
    options: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    correct_option_index: Mapped[int] = mapped_column(Integer, nullable=False)
    explanation: Mapped[str | None] = mapped_column(Text, nullable=True)

    # ── Relationships ─────────────────────────────────────────────────────────
    session: Mapped["Session"] = relationship(  # noqa: F821
        "Session", back_populates="quiz_questions"
    )

    def __repr__(self) -> str:
        return f"<QuizQuestion id={self.id}>"


class LectureSegment(Base):
    """Transcript segment with optional vector embedding for RAG."""

    __tablename__ = "lecture_segments"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    start_time_seconds: Mapped[int] = mapped_column(Integer, nullable=False)
    end_time_seconds: Mapped[int] = mapped_column(Integer, nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    # Use Text for embedding when pgvector is unavailable; swap for VECTOR(1536)
    embedding: Mapped[str | None] = mapped_column(Text, nullable=True)

    # ── Relationships ─────────────────────────────────────────────────────────
    session: Mapped["Session"] = relationship(  # noqa: F821
        "Session", back_populates="lecture_segments"
    )

    def __repr__(self) -> str:
        return (
            f"<LectureSegment id={self.id} "
            f"[{self.start_time_seconds}s-{self.end_time_seconds}s]>"
        )
