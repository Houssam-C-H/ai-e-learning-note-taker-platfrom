'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar as CalendarIcon, Clock, BookOpen, Brain, ExternalLink, X, MapPin } from 'lucide-react';
import type { CalendarEvent, Course } from '@/lib/types';
import { formatDate, formatDuration } from '@/lib/utils';
import { CourseTag } from '@/components/ui/CourseTag';

interface CalendarViewProps {
  events: CalendarEvent[];
  courses: Course[];
}

export function CalendarView({ events, courses }: CalendarViewProps) {
  const router = useRouter();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const courseMap = Object.fromEntries(courses.map((c) => [c.id, c]));

  const filteredEvents = events.filter((e) => {
    if (selectedCourseFilter !== 'all' && e.course_id !== selectedCourseFilter) {
      return false;
    }
    return true;
  });

  // Simple calendar month grid calculations
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getEventsForDay = (day: number) => {
    return filteredEvents.filter((ev) => {
      const d = new Date(ev.start_time);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  };

  return (
    <div className="space-y-6">
      {/* Course Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card/60 border border-border p-4 rounded-xl">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setSelectedCourseFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedCourseFilter === 'all'
                ? 'bg-accent text-white shadow-lg shadow-accent/25'
                : 'bg-surface text-text-muted hover:text-text-primary'
            }`}
          >
            All Courses ({events.length})
          </button>
          {courses.map((course) => {
            const isSelected = selectedCourseFilter === course.id;
            return (
              <button
                key={course.id}
                onClick={() => setSelectedCourseFilter(course.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                  isSelected
                    ? 'ring-2 ring-offset-2 ring-offset-background text-white'
                    : 'bg-surface text-text-muted hover:text-text-primary'
                }`}
                style={{
                  backgroundColor: isSelected ? course.color : undefined,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: course.color }}
                />
                {course.code}
              </button>
            );
          })}
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold text-white">
            {monthNames[month]} {year}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg bg-surface hover:bg-surface-hover text-text-muted hover:text-white transition-colors"
            >
              ←
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg bg-surface hover:bg-surface-hover text-text-muted hover:text-white transition-colors"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Timetable Calendar Grid */}
      <div className="card p-0 overflow-hidden border border-border">
        {/* Day Header */}
        <div className="grid grid-cols-7 border-b border-border bg-surface text-center py-2.5 text-xs font-semibold text-text-muted">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 auto-rows-fr gap-px bg-border/40">
          {emptyDays.map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[110px] bg-card/40 p-2" />
          ))}

          {days.map((day) => {
            const dayEvents = getEventsForDay(day);
            const isToday =
              new Date().getDate() === day &&
              new Date().getMonth() === month &&
              new Date().getFullYear() === year;

            return (
              <div
                key={`day-${day}`}
                className={`min-h-[110px] bg-card p-2 hover:bg-surface/50 transition-colors flex flex-col justify-between ${
                  isToday ? 'ring-1 ring-accent' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      isToday ? 'bg-accent text-white font-bold' : 'text-text-muted'
                    }`}
                  >
                    {day}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[10px] text-text-muted font-medium">
                      {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 my-1.5 overflow-hidden">
                  {dayEvents.slice(0, 3).map((ev) => {
                    const c = courseMap[ev.course_id];
                    return (
                      <button
                        key={ev.id}
                        onClick={() => setSelectedEvent(ev)}
                        className="w-full text-left truncate px-2 py-1 rounded text-[11px] font-medium transition-transform hover:scale-[1.02] block text-white shadow-sm"
                        style={{
                          backgroundColor: `${c?.color || '#6366F1'}22`,
                          borderLeft: `3px solid ${c?.color || '#6366F1'}`,
                        }}
                      >
                        {ev.title}
                      </button>
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <span className="text-[10px] text-accent px-1">
                      +{dayEvents.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Event Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border w-full max-w-lg rounded-2xl p-6 shadow-2xl relative space-y-5 animate-scale-up">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-surface text-text-muted hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <CourseTag
                  course={courseMap[selectedEvent.course_id] || {
                    id: selectedEvent.course_id,
                    code: 'COURSE',
                    name: 'Course',
                    color: '#6366F1',
                  }}
                />
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-accent/15 text-accent font-semibold uppercase">
                  {selectedEvent.event_type}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white leading-tight">
                {selectedEvent.title}
              </h3>
            </div>

            <div className="space-y-2 text-sm text-text-muted">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-text-muted" />
                <span>
                  {formatDate(selectedEvent.start_time)}
                </span>
              </div>
              {selectedEvent.description && (
                <p className="text-text-primary text-sm bg-surface p-3 rounded-lg border border-border/50">
                  {selectedEvent.description}
                </p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {selectedEvent.session_id ? (
                <>
                  <button
                    onClick={() => router.push(`/study/${selectedEvent.session_id}`)}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold transition-all shadow-lg shadow-accent/25"
                  >
                    <BookOpen className="w-4 h-4" />
                    Study Notes
                  </button>
                  <button
                    onClick={() => router.push(`/flashcards/${selectedEvent.session_id}`)}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-surface hover:bg-surface-hover border border-border text-white text-xs font-semibold transition-all"
                  >
                    <Brain className="w-4 h-4 text-pink-400" />
                    Flashcards
                  </button>
                  <button
                    onClick={() => router.push(`/quiz/${selectedEvent.session_id}`)}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-surface hover:bg-surface-hover border border-border text-white text-xs font-semibold transition-all"
                  >
                    <ExternalLink className="w-4 h-4 text-emerald-400" />
                    Quiz
                  </button>
                </>
              ) : (
                <div className="col-span-3 text-center py-2 text-xs text-text-muted italic">
                  No recorded lecture session linked yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

