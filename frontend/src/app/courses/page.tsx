'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Plus, Layers, ArrowRight, Loader2, Sparkles, X } from 'lucide-react';
import { useCourses } from '@/hooks/useCourses';
import { useSessions } from '@/hooks/useSession';
import { coursesApi } from '@/lib/api';

export default function CoursesPage() {
  const { courses, isLoading, mutate } = useCourses();
  const { sessions } = useSessions();
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366F1');
  const [creating, setCreating] = useState(false);

  const colors = [
    '#6366F1', // Indigo
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#F43F5E', // Rose
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#06B6D4', // Cyan
    '#3B82F6', // Blue
  ];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) return;
    setCreating(true);
    try {
      await coursesApi.create({ code, name, color });
      mutate();
      setShowModal(false);
      setCode('');
      setName('');
    } catch (err) {
      console.error('Failed to create course:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-accent" />
            Enrolled Academic Courses
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Organize lectures, syllabi, notes, and study sets by university module.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-semibold transition-all shadow-lg shadow-accent/25"
        >
          <Plus className="w-4 h-4" />
          Add Course
        </button>
      </div>

      {isLoading ? (
        <div className="card flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </div>
      ) : courses.length === 0 ? (
        <div className="card text-center py-16 space-y-4">
          <BookOpen className="w-12 h-12 text-text-muted mx-auto opacity-50" />
          <h3 className="text-lg font-semibold text-white">No courses yet</h3>
          <p className="text-sm text-text-muted max-w-sm mx-auto">
            Create your first university course module to start organizing your BigBlueButton lecture notes.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            Create Course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const courseSessions = sessions.filter((s) => s.course_id === course.id);
            return (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="card group hover:border-accent/40 transition-all duration-300 flex flex-col justify-between overflow-hidden relative"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: course.color }}
                />
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="px-2.5 py-1 rounded-md text-xs font-bold text-white shadow-sm"
                      style={{ backgroundColor: `${course.color}25`, color: course.color, border: `1px solid ${course.color}40` }}
                    >
                      {course.code}
                    </span>
                    <span className="text-xs text-text-muted flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      {courseSessions.length} {courseSessions.length === 1 ? 'lecture' : 'lectures'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-accent transition-colors line-clamp-1">
                    {course.name}
                  </h3>
                  <p className="text-xs text-text-muted mt-2 line-clamp-2">
                    Access all transcripts, AI summaries, flashcard decks, and quiz sets for this course.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/50 text-xs font-semibold text-accent group-hover:translate-x-0.5 transition-transform">
                  <span>View lectures</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* New Course Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl p-6 shadow-2xl relative space-y-5 animate-scale-up">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-surface text-text-muted hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                Add New Course
              </h3>
              <p className="text-xs text-text-muted">
                Create a subject space to group incoming lecture recordings.
              </p>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5">
                  Course Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. CS401 or NET302"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5">
                  Course Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Systems & Cloud Computing"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-sm text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-2">
                  Accent Color
                </label>
                <div className="flex items-center gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-background' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-accent/25"
                >
                  {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

