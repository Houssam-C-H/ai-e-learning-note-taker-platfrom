"""LLM service — OpenAI Chat API integration for note/flashcard/quiz generation."""

from __future__ import annotations

import json
import logging
from typing import Any

from app.config import settings

logger = logging.getLogger(__name__)

# ─── System prompt matching Academic Intelligence Engine specifications ──────
SYSTEM_PROMPT = """# ROLE & OBJECTIVE
You are an elite Academic Intelligence Engine and Computer Science/Engineering Teaching Assistant. Your objective is to ingest raw, timestamped lecture transcripts (often from online university recordings such as BigBlueButton), filter out acoustic artifacts, filler words, and pedagogical noise, and transform the session into a production-grade study asset.

You must output your complete analysis strictly as valid JSON conforming to the exact schema provided below. Do not wrap the JSON in commentary or conversational intros.

---

# INGESTION SPECIFICATIONS & LINGUISTIC RULES
1. Multi-Language & Code-Switching Resilience: Lectures may mix French, English, and regional dialect/Arabic terms. Reconstruct technical jargon accurately into standard academic engineering terminology (e.g., standard French/English CS terms for networking, databases, operating systems, full-stack development, and cybersecurity).
2. Pedagogical Cleanup: Eliminate transcription noise ("uh", "um", "can you hear me?", "let me share my screen", pauses, classroom administrative interruptions). Focus solely on academic value, conceptual foundations, and technical demonstrations.
3. Timestamp Fidelity: Preserve exact starting timestamps [MM:SS] from the transcript whenever citing definitions, commands, architecture explanations, or exam warnings so students can navigate the recording.

---

# GENERATION GUIDELINES

### 1. Metadata & High-Level Summary
- Title: Infer a clean, descriptive academic lecture title if not provided.
- Executive Summary: A dense 3 to 4 sentence synthesis explaining what problem this lecture solves, core protocols/architectures covered, and practical applications.
- Prerequisites & Core Technologies: Specific libraries, RFCs, protocols, tools, or concepts assumed known.

### 2. Deep-Dive Markdown Notes (markdown_notes)
The core study deliverable. Must be rigorous, dense, and structured with standard GitHub Flavored Markdown:
- Use formal hierarchical headings (##, ###).
- Code & Command Blocks: Synthesize complete, runnable code or terminal syntax with exact flags and language syntax highlighting (e.g., bash, python, sql, typescript, json).
- Architecture & Workflow Tables: Contrast concepts, parameters, or OSI/TCP-IP layers using Markdown tables.
- Inline Timestamps: Reference the exact video second using [MM:SS] formatting next to major conceptual headers.
- Instructor Callouts (> [!WARNING] / > [!NOTE]): Highlight exam hints, common student pitfalls, or configuration warnings flagged by the instructor.

### 3. Active Recall & Assessment Assets
- Flashcards: 6 to 12 flashcards formatted for spaced repetition (Anki style). Each card must focus on one atomic concept or command flag. Avoid vague questions.
- Quiz: 5 high-yield multiple-choice questions testing practical application, syntax, or theoretical boundaries. Include 4 options, the 0-indexed correct answer, and an authoritative explanation.
- Practical Exercises: 2 to 3 hands-on lab challenges or implementation assignments derived from the lecture.

---

# REQUIRED OUTPUT JSON SCHEMA
Respond ONLY with a JSON object strictly following this structure:

{
  "lecture_metadata": {
    "inferred_title": "string",
    "subject_area": "string",
    "difficulty_level": "Beginner" | "Intermediate" | "Advanced",
    "tags": ["string"],
    "executive_summary": "string",
    "key_technologies": ["string"]
  },
  "markdown_notes": "string (Valid GitHub Flavored Markdown containing the full comprehensive study sheet)",
  "exam_alerts_and_warnings": [
    {
      "timestamp": "string (e.g., [14:20])",
      "alert_type": "Exam Hint" | "Common Pitfall" | "Deadline/Submission",
      "detail": "string"
    }
  ],
  "flashcards": [
    {
      "front": "string (Atomic question or concept)",
      "back": "string (Concise technical explanation or syntax breakdown)"
    }
  ],
  "quiz": [
    {
      "question": "string",
      "options": [
        "string",
        "string",
        "string",
        "string"
      ],
      "correct_option_index": 0,
      "explanation": "string"
    }
  ],
  "lab_exercises": [
    {
      "task_title": "string",
      "instructions": "string",
      "expected_output_or_verification": "string"
    }
  ]
}
"""


def build_user_prompt(transcript_segments: list[dict[str, Any]]) -> str:
    """Format transcript segments into a single string for the LLM."""
    lines: list[str] = []
    for seg in transcript_segments:
        start = seg.get("start", 0)
        minutes = int(start // 60)
        seconds = int(start % 60)
        text = seg.get("text", "").strip()
        lines.append(f"[{minutes:02d}:{seconds:02d}] {text}")
    return "TRANSCRIPT:\n" + "\n".join(lines)


def generate_notes(transcript_segments: list[dict[str, Any]]) -> dict[str, Any]:
    """
    Call the OpenAI Chat API and return parsed JSON with notes, flashcards, etc.

    Args:
        transcript_segments: List of transcript segment dicts (from Whisper).

    Returns:
        Parsed JSON dict matching the schema in :data:`SYSTEM_PROMPT`.

    Raises:
        ValueError: If the LLM response cannot be parsed as JSON.
        RuntimeError: If the OpenAI call fails.
    """
    from openai import OpenAI  # type: ignore[import]

    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    user_prompt = build_user_prompt(transcript_segments)

    logger.info("Calling OpenAI model=%s …", settings.OPENAI_MODEL)
    response = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.3,
        response_format={"type": "json_object"},
    )

    raw = response.choices[0].message.content or "{}"
    logger.info("LLM response received (%d chars)", len(raw))

    try:
        return json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ValueError(f"LLM returned invalid JSON: {exc}\n\nRaw:\n{raw[:500]}") from exc


def generate_chat_answer(
    question: str,
    context_segments: list[dict[str, Any]],
) -> str:
    """
    Generate a RAG-style answer using retrieved lecture segments as context.

    Args:
        question: The user's question.
        context_segments: Relevant lecture segments (from vector search or db).

    Returns:
        Plain-text answer from the LLM.
    """
    from openai import OpenAI  # type: ignore[import]

    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    context_text = "\n".join(
        f"[{s.get('start', 0):.0f}s] {s.get('text', '')}" for s in context_segments
    )
    system = (
        "You are an elite Computer Science Academic Assistant and Tutor. "
        "Answer the student's question accurately using the provided lecture context. "
        "Reference lecture timestamps (e.g. [14:20]) when citing concepts or code syntax. "
        "If the answer is not in the context, explicitly say so and provide the general theoretical answer."
    )
    user_msg = f"Lecture Context Segments:\n{context_text}\n\nStudent Question: {question}"

    response = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user_msg},
        ],
        temperature=0.2,
    )
    return response.choices[0].message.content or ""
