import { NextResponse } from 'next/server';
import { db } from '@/lib/server-state';

export async function GET() {
  const flashcardCount = Object.values(db.flashcards).reduce((acc, fcs) => acc + fcs.length, 0);
  const quizCount = Object.values(db.quizQuestions).reduce((acc, qs) => acc + qs.length, 0);

  return NextResponse.json({
    total_sessions: db.sessions.length,
    flashcards_generated: flashcardCount,
    quizzes_completed: quizCount,
    courses_count: db.courses.length,
  });
}

