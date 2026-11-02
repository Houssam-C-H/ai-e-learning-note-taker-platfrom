'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  ArrowLeft,
  Calendar,
  Clock,
  Layers,
  Brain,
  CheckSquare,
  Play,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { coursesApi, sessionsApi } from '@/lib/api';
import type { Course, Session } from '@/lib/types';
import { formatDate, formatDuration } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!courseId) return;
      try {
        const [c, s] = await Promise.all([
          coursesApi.get(courseId),
          sessionsApi.list({ course_id: courseId }),
        ]);
        setCourse(c);
        setSessions(s);
      } catch (err) {
        console.error('Failed to load course details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [courseId]);

  if (loading) {
    return (
      <div className="card flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="card text-center py-16 space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-white">Course Not Found</h2>
        <Link href="/courses" className="text-accent text-sm hover:underline">
          Return to courses
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.push('/courses')}
        className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Courses
      </button>

      {/* Course Header Banner */}
      <div
        className="card relative overflow-hidden p-6 md:p-8"
        style={{
          borderLeft: `6px solid ${course.color}`,
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span
              className="inline-block px-2.5 py-1 rounded text-xs font-bold text-white mb-2"
              style={{ backgroundColor: `${course.color}35`, color: course.color }}
            >
              {course.code}
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              {course.name}
            </h1>
            <p className="text-xs text-text-muted">
              {sessions.length} {sessions.length === 1 ? 'lecture session' : 'lecture sessions'} recorded & analyzed
            </p>
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="card space-y-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-accent" />
          Recorded Lectures & Sessions
        </h3>

        {sessions.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <p className="text-sm text-text-muted">
              No sessions ingested for this course yet.
            </p>
            <Link
              href="/"
              className="inline-block text-xs text-accent font-semibold hover:underline"
            >
              Go to Dashboard to ingest a BigBlueButton recording →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-text-muted text-xs font-medium">
                  <th className="px-5 py-3">Lecture</th>
                  <th className="px-5 py-3">Recorded At</th>
                  <th className="px-5 py-3">Duration</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-surface/40 transition-colors">
                    <td className="px-5 py-4 font-medium text-white max-w-xs truncate">
                      {s.title || `Lecture ${s.bbb_meeting_id.slice(0, 16)}...`}
                    </td>
                    <td className="px-5 py-4 text-xs text-text-muted whitespace-nowrap">
                      {formatDate(s.recorded_at)}
                    </td>
                    <td className="px-5 py-4 text-xs text-text-muted whitespace-nowrap">
                      {formatDuration(s.duration_seconds)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/study/${s.id}`}
                          className="px-3 py-1.5 rounded-lg bg-accent/20 hover:bg-accent text-accent hover:text-white text-xs font-semibold transition-all inline-flex items-center gap-1.5"
                        >
                          <Play className="w-3 h-3" />
                          Study
                        </Link>
                        <Link
                          href={`/flashcards/${s.id}`}
                          className="px-2.5 py-1.5 rounded-lg bg-surface hover:bg-surface-hover text-text-muted hover:text-white text-xs font-medium transition-colors"
                          title="Review Flashcards"
                        >
                          <Brain className="w-3.5 h-3.5 text-pink-400" />
                        </Link>
                        <Link
                          href={`/quiz/${s.id}`}
                          className="px-2.5 py-1.5 rounded-lg bg-surface hover:bg-surface-hover text-text-muted hover:text-white text-xs font-medium transition-colors"
                          title="Self-Test Quiz"
                        >
                          <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

