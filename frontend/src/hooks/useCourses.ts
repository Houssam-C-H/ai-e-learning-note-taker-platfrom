import useSWR from 'swr';
import { coursesApi } from '@/lib/api';
import type { Course } from '@/lib/types';

export function useCourses() {
  const { data, error, isLoading, mutate } = useSWR<Course[]>(
    'courses',
    () => coursesApi.list(),
    { revalidateOnFocus: false }
  );

  return { courses: data ?? [], error, isLoading, mutate };
}

export function useCourse(courseId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Course>(
    courseId ? `course-${courseId}` : null,
    () => coursesApi.get(courseId!),
    { revalidateOnFocus: false }
  );

  return { course: data, error, isLoading, mutate };
}
