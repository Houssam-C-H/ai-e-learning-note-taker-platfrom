import { NextResponse } from 'next/server';
import { db } from '@/lib/server-state';

export async function GET(
  _req: Request,
  { params }: { params: { sessionId: string } }
) {
  const session = db.sessions.find((s) => s.id === params.sessionId);
  if (!session) {
    return NextResponse.json({ detail: 'Session not found' }, { status: 404 });
  }
  return NextResponse.json(session);
}

