import { NextResponse } from 'next/server';
import { db } from '@/lib/server-state';

export async function GET(
  _req: Request,
  { params }: { params: { sessionId: string } }
) {
  const cards = db.flashcards[params.sessionId] || [
    {
      id: `fc-default-1`,
      front: 'What is the primary objective of this lecture session?',
      back: 'To master the fundamental architectural protocols and configurations presented in class.',
      difficulty: 1,
    },
    {
      id: `fc-default-2`,
      front: 'What key verification command should be used during troubleshooting?',
      back: 'Inspect state tables and configuration logs to verify protocol convergence.',
      difficulty: 2,
    },
  ];
  return NextResponse.json(cards);
}

