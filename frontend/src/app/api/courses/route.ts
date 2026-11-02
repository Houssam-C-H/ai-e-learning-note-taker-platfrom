import { NextResponse } from 'next/server';
import { db } from '@/lib/server-state';

export async function GET() {
  return NextResponse.json(db.courses);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newCourse = {
      id: `course-${Date.now()}`,
      code: body.code || 'COURSE',
      name: body.name || 'Untitled Course',
      color: body.color || '#6366F1',
      instructor: body.instructor,
    };
    db.courses.push(newCourse);
    return NextResponse.json(newCourse, { status: 201 });
  } catch (err) {
    return NextResponse.json({ detail: 'Failed to create course' }, { status: 400 });
  }
}

