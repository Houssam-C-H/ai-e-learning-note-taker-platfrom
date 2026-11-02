import { NextResponse } from 'next/server';
import { db } from '@/lib/server-state';

export async function GET(
  _req: Request,
  { params }: { params: { sessionId: string } }
) {
  const note = db.notes[params.sessionId] || {
    id: `note-${params.sessionId}`,
    session_id: params.sessionId,
    executive_summary: 'Comprehensive academic study sheet synthesized from lecture transcript.',
    summary: 'Core theoretical and practical concepts discussed in this session.',
    markdown_content: `# Lecture Study Sheet \n\n## Overview\n\nNotes synthesized for session ${params.sessionId}.`,
  };
  return NextResponse.json(note);
}

