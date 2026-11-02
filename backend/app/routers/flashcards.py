"""Flashcards router."""

from __future__ import annotations

import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.flashcard import Flashcard
from app.schemas.flashcard import FlashcardRead, FlashcardUpdate

router = APIRouter(prefix="/api/sessions", tags=["flashcards"])


@router.get("/{session_id}/flashcards", response_model=List[FlashcardRead])
async def get_flashcards(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> List[Flashcard]:
    """Retrieve all flashcards for a session."""
    result = await db.execute(
        select(Flashcard)
        .where(Flashcard.session_id == session_id)
        .order_by(Flashcard.difficulty)
    )
    return list(result.scalars().all())


@router.patch("/{session_id}/flashcards/{flashcard_id}", response_model=FlashcardRead)
async def update_flashcard(
    session_id: uuid.UUID,
    flashcard_id: uuid.UUID,
    payload: FlashcardUpdate,
    db: AsyncSession = Depends(get_db),
) -> Flashcard:
    """Partially update a flashcard (e.g., adjust difficulty)."""
    result = await db.execute(
        select(Flashcard).where(
            Flashcard.id == flashcard_id, Flashcard.session_id == session_id
        )
    )
    card = result.scalar_one_or_none()
    if card is None:
        raise HTTPException(status_code=404, detail="Flashcard not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(card, field, value)

    await db.flush()
    await db.refresh(card)
    return card
