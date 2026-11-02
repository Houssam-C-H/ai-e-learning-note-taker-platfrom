import { NextResponse } from 'next/server';
import { db } from '@/lib/server-state';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get('course_id');

  if (courseId) {
    return NextResponse.json(db.calendarEvents.filter((e) => e.course_id === courseId));
  }
  return NextResponse.json(db.calendarEvents);
}

