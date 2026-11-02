"""Chat / RAG router."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.calendar_event import LectureSegment
from app.schemas.calendar_event import ChatRequest, ChatResponse
from app.services.llm_service import generate_chat_answer

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
async def chat(
    payload: ChatRequest,
    db: AsyncSession = Depends(get_db),
) -> ChatResponse:
    """
    Simple RAG chatbot endpoint.

    Fetches relevant lecture segments and uses the LLM to answer the question.
    """
    # Basic keyword retrieval (replace with vector similarity when pgvector is enabled)
    query = select(LectureSegment).where(
        LectureSegment.text.ilike(f"%{payload.question[:50]}%")
    )
    if payload.course_id is not None:
        query = query.join(
            LectureSegment.session  # type: ignore[arg-type]
        ).where(
            # Filter by course via the session relationship
            LectureSegment.session.has(course_id=payload.course_id)  # type: ignore[attr-defined]
        )
    query = query.limit(10)

    result = await db.execute(query)
    segments = result.scalars().all()

    context = [
        {"start": seg.start_time_seconds, "text": seg.text} for seg in segments
    ]

    answer = generate_chat_answer(payload.question, context)

    sources = [
        {"segment_id": str(seg.id), "start_seconds": seg.start_time_seconds}
        for seg in segments
    ]

    return ChatResponse(answer=answer, sources=sources)
