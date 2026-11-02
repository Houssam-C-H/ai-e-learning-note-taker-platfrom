'use client';

import Link from 'next/link';
import { BookOpen, FlipHorizontal2, Calendar, ExternalLink } from 'lucide-react';
import { useSessions } from '@/hooks/useSession';
import { useCourses } from '@/hooks/useCourses';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CourseTag } from '@/components/ui/CourseTag';
import { formatDate, formatDuration } from '@/lib/utils';
import type { Session } from '@/lib/types';

export function RecentSessions() {
  const { sessions, isLoading } = useSessions();
  const { courses } = useCourses();

  const courseMap = Object.fromEntries(courses.map((c) => [c.id, c]));
  const recent = sessions.slice(0, 8);

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <div className="skeleton h-5 w-36" />
          <div className="skeleton h-4 w-16" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-14 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-text-primary flex items-center gap-2">
          <Calendar className="w-4 h-4 text-accent" />
          Recent Sessions
        </h3>
        <Link
          href="/courses"
          className="text-xs text-text-muted hover:text-accent transition-colors"
        >
          View all →
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="text-center py-10">
          <BookOpen className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-50" />
          <p className="text-text-muted text-sm">No sessions yet. Ingest your first lecture above!</p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60">
                <th className="text-left text-text-muted font-medium px-5 py-2.5 whitespace-nowrap">
                  Course
                </th>
                <th className="text-left text-text-muted font-medium px-4 py-2.5">Title</th>
                <th className="text-left text-text-muted font-medium px-4 py-2.5 whitespace-nowrap hidden md:table-cell">
                  Date
                </th>
                <th className="text-left text-text-muted font-medium px-4 py-2.5 whitespace-nowrap hidden md:table-cell">
                  Duration
                </th>
                <th className="text-left text-text-muted font-medium px-4 py-2.5">Status</th>
                <th className="text-right text-text-muted font-medium px-5 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((session: Session) => {
                const course = courseMap[session.course_id];
                return (
                  <tr
                    key={session.id}
                    className="border-b border-border/30 hover:bg-surface-raised/50 transition-colors group"
                  >
                    <td className="px-5 py-3">
                      {course ? (
                        <CourseTag code={course.code} color={course.color} size="sm" />
                      ) : (
                        <span className="text-text-muted text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <span className="text-text-primary truncate block" title={session.title || session.bbb_meeting_id}>
                        {session.title || session.bbb_meeting_id.slice(0, 24) + '…'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-muted whitespace-nowrap hidden md:table-cell">
                      {formatDate(session.recorded_at)}
                    </td>
                    <td className="px-4 py-3 text-text-muted whitespace-nowrap hidden md:table-cell">
                      {formatDuration(session.duration_seconds)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={session.status} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {session.status === 'ready' && (
                          <>
                            <Link
                              href={`/study/${session.id}`}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent/15 text-accent text-xs font-medium hover:bg-accent/25 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Study
                            </Link>
                            <Link
                              href={`/flashcards/${session.id}`}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet/15 text-violet text-xs font-medium hover:bg-violet/25 transition-colors"
                            >
                              <FlipHorizontal2 className="w-3 h-3" />
                              Cards
                            </Link>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
