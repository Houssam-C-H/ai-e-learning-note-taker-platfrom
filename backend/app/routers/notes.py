"""Notes router."""

from __future__ import annotations

import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.note import Note
from app.schemas.note import NoteRead, NoteUpdate

router = APIRouter(prefix="/api/sessions", tags=["notes"])


@router.get("/{session_id}/notes", response_model=List[NoteRead])
async def get_notes(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> List[Note]:
    """Retrieve all notes for a session."""
    result = await db.execute(select(Note).where(Note.session_id == session_id))
    notes = list(result.scalars().all())
    if not notes:
        raise HTTPException(status_code=404, detail="No notes found for this session")
    return notes


@router.patch("/{session_id}/notes/{note_id}", response_model=NoteRead)
async def update_note(
    session_id: uuid.UUID,
    note_id: uuid.UUID,
    payload: NoteUpdate,
    db: AsyncSession = Depends(get_db),
) -> Note:
    """Partially update a note."""
    result = await db.execute(
        select(Note).where(Note.id == note_id, Note.session_id == session_id)
    )
    note = result.scalar_one_or_none()
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(note, field, value)

    await db.flush()
    await db.refresh(note)
    return note
