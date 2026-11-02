import useSWR from 'swr';
import { sessionsApi } from '@/lib/api';
import type { Session, SessionStatusResponse } from '@/lib/types';

export function useSession(sessionId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Session>(
    sessionId ? `session-${sessionId}` : null,
    () => sessionsApi.get(sessionId!),
    { revalidateOnFocus: false }
  );

  return { session: data, error, isLoading, mutate };
}

export function useSessionStatus(
  sessionId: string | null,
  shouldPoll: boolean = false
) {
  const { data, error, isLoading, mutate } = useSWR<SessionStatusResponse>(
    sessionId && shouldPoll ? `session-status-${sessionId}` : null,
    () => sessionsApi.getStatus(sessionId!),
    {
      refreshInterval: (data) => {
        if (!data) return 3000;
        const { status } = data;
        if (status === 'ready' || status === 'failed') return 0;
        return 3000;
      },
      revalidateOnFocus: false,
    }
  );

  return { statusData: data, error, isLoading, mutate };
}

export function useSessions(courseId?: string) {
  const { data, error, isLoading, mutate } = useSWR<Session[]>(
    courseId ? `sessions-course-${courseId}` : 'sessions-all',
    () => sessionsApi.list(courseId ? { course_id: courseId } : undefined),
    { revalidateOnFocus: false }
  );

  return { sessions: data ?? [], error, isLoading, mutate };
}
