'use client';

import { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { CalendarView } from '@/components/calendar/CalendarView';
import { calendarApi, coursesApi } from '@/lib/api';
import type { CalendarEvent, Course } from '@/lib/types';

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [loadedEvents, loadedCourses] = await Promise.all([
          calendarApi.listEvents(),
          coursesApi.list(),
        ]);
        setEvents(loadedEvents);
        setCourses(loadedCourses);
      } catch (err) {
        console.error('Failed to load calendar data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <CalendarIcon className="w-6 h-6 text-accent" />
            Academic Calendar & Timetable
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Track past university recordings, exam warnings, and upcoming lecture sessions.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="card flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </div>
      ) : (
        <CalendarView events={events} courses={courses} />
      )}
    </div>
  );
}

