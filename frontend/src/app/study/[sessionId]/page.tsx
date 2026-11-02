'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { sessionsApi, notesApi, coursesApi } from '@/lib/api';
import type { Session, Note, Course } from '@/lib/types';
import { StudyPane } from '@/components/study/StudyPane';

export default function StudyPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.sessionId as string;

  const [session, setSession] = useState<Session | null>(null);
  const [note, setNote] = useState<Note | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!sessionId) return;
      try {
        const s = await sessionsApi.get(sessionId);
        setSession(s);

        const [n, c] = await Promise.all([
          notesApi.get(sessionId).catch(() => null),
          s.course_id ? coursesApi.get(s.course_id).catch(() => null) : Promise.resolve(null),
        ]);
        setNote(n);
        setCourse(c);
      } catch (err) {
        console.error('Failed to load study data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="card flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="card text-center py-20 space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-white">Lecture Session Not Found</h2>
        <Link href="/" className="text-accent text-sm hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back
      </button>

      <StudyPane session={session} note={note} course={course} />
    </div>
  );
}

