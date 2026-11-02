"""Note ORM model."""

from __future__ import annotations

import uuid

from sqlalchemy import ForeignKey, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Note(Base):
    """AI-generated notes for a session."""

    __tablename__ = "notes"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    raw_transcript: Mapped[dict | list | None] = mapped_column(JSONB, nullable=True)
    markdown_content: Mapped[str | None] = mapped_column(Text, nullable=True)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    key_terms: Mapped[dict | list | None] = mapped_column(JSONB, nullable=True)
    executive_summary: Mapped[str | None] = mapped_column(Text, nullable=True)

    # ── Relationships ─────────────────────────────────────────────────────────
    session: Mapped["Session"] = relationship("Session", back_populates="notes")  # noqa: F821

    def __repr__(self) -> str:
        return f"<Note id={self.id} session_id={self.session_id}>"
