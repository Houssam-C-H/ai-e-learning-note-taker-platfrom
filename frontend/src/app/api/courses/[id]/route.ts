import { NextResponse } from 'next/server';
import { db } from '@/lib/server-state';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const course = db.courses.find((c) => c.id === params.id);
  if (!course) {
    return NextResponse.json({ detail: 'Course not found' }, { status: 404 });
  }
  return NextResponse.json(course);
}

