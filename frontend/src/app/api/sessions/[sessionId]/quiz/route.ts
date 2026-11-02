import { NextResponse } from 'next/server';
import { db } from '@/lib/server-state';

export async function GET(
  _req: Request,
  { params }: { params: { sessionId: string } }
) {
  const quiz = db.quizQuestions[params.sessionId] || [
    {
      id: `q-default-1`,
      question: 'Which of the following is the primary prerequisite for this lecture session?',
      options: [
        'Fundamental TCP/IP and OSI Layer understanding',
        'Advanced quantum cryptography algorithms',
        'Non-relational document indexing',
        'Assembly register memory mapping',
      ],
      correct_option_index: 0,
      explanation: 'The course assumes foundational networking and computer science knowledge.',
    },
  ];
  return NextResponse.json(quiz);
}

