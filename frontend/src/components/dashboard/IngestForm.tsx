'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Link2,
  Hash,
  ChevronDown,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Play,
  Brain,
  Sparkles,
  PlusCircle,
  Layers,
  Palette,
  Check,
  Clock,
  Cpu,
  Flame,
  Zap,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { sessionsApi } from '@/lib/api';
import { useCourses } from '@/hooks/useCourses';
import { useSessionStatus, useSessions } from '@/hooks/useSession';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { SessionStatus } from '@/lib/types';
import { useRole } from '@/context/RoleContext';
import { AVAILABLE_MODELS } from '@/lib/ai-providers';

const COLOR_PALETTE = [
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#06B6D4', // Cyan
  '#F43F5E', // Rose
  '#3B82F6', // Blue
];

export function IngestForm() {
  const { role } = useRole();
  const { courses, mutate: mutateCourses } = useCourses();
  const { mutate: mutateSessions } = useSessions();

  const [bbbBaseUrl, setBbbBaseUrl] = useState('');
  const [meetingId, setMeetingId] = useState('');
  const [courseId, setCourseId] = useState('');
  // University lectures default to 2 Hours (7200s), configurable up to 3h+
  const [durationSeconds, setDurationSeconds] = useState(7200);
  const [selectedProvider, setSelectedProvider] = useState<'groq' | 'gemini' | 'openai'>('groq');
  const [selectedModel, setSelectedModel] = useState<string>('openai/gpt-oss-120b');

  // Sync initial provider from localStorage if saved
  useEffect(() => {
    const saved = localStorage.getItem('noteai_provider') as 'groq' | 'gemini' | 'openai';
    if (saved && (saved === 'groq' || saved === 'gemini' || saved === 'openai')) {
      setSelectedProvider(saved);
      if (saved === 'groq') setSelectedModel('openai/gpt-oss-120b');
      else if (saved === 'gemini') setSelectedModel('gemini-2.5-flash');
      else if (saved === 'openai') setSelectedModel('gpt-4o-mini');
    }
  }, []);

  const handleProviderChange = (p: 'groq' | 'gemini' | 'openai') => {
    setSelectedProvider(p);
    if (p === 'groq') setSelectedModel('openai/gpt-oss-120b');
    else if (p === 'gemini') setSelectedModel('gemini-2.5-flash');
    else if (p === 'openai') setSelectedModel('gpt-4o-mini');
  };

  // ── Create Course on-the-fly state ──────────────────────────────────────────
  const [isCreatingNewCourse, setIsCreatingNewCourse] = useState(false);
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseInstructor, setNewCourseInstructor] = useState('');
  const [newCourseColor, setNewCourseColor] = useState(COLOR_PALETTE[0]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ingestedSessionId, setIngestedSessionId] = useState<string | null>(null);
  const [ingestStatus, setIngestStatus] = useState<SessionStatus | null>(null);

  // Auto-select first course when loaded
  useEffect(() => {
    if (courses.length > 0 && !courseId && !isCreatingNewCourse) {
      setCourseId(courses[0].id);
    }
  }, [courses, courseId, isCreatingNewCourse]);

  const { statusData } = useSessionStatus(
    ingestedSessionId,
    !!ingestedSessionId && ingestStatus !== 'ready' && ingestStatus !== 'failed'
  );

  useEffect(() => {
    if (statusData) {
      setIngestStatus(statusData.status);
    }
  }, [statusData]);

  // Smart URL parser — handles full BBB playback/presentation URLs
  const handleUrlChange = (val: string) => {
    setBbbBaseUrl(val);

    const presentationMatch = val.match(
      /^(https?:\/\/[^/]+)\/presentation\/([a-zA-Z0-9_-]+-\d{10,13})\//
    );
    if (presentationMatch) {
      setBbbBaseUrl(presentationMatch[1]);
      setMeetingId(presentationMatch[2]);
      return;
    }

    const playbackMatch = val.match(
      /^(https?:\/\/[^/]+)\/.*\/([a-zA-Z0-9_-]+-\d{10,13})(?:\/|$|\?)/
    );
    if (playbackMatch) {
      setBbbBaseUrl(playbackMatch[1]);
      setMeetingId(playbackMatch[2]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isCreatingNewCourse && (!newCourseCode.trim() || !newCourseName.trim())) {
      setError('Please provide both a Course Code (e.g. SEC402) and Course Name.');
      return;
    }

    const effectiveCourseId = isCreatingNewCourse ? '' : (courseId || courses[0]?.id || '');
    const effectiveBaseUrl = bbbBaseUrl.trim() || 'https://visioconference.supmti.ac.ma';
    const effectiveMeetingId = meetingId.trim() || `bbb-session-${Date.now()}`;

    setError(null);
    setIsSubmitting(true);
    try {
      const selectedModelObj = AVAILABLE_MODELS.find((m) => m.id === selectedModel) || AVAILABLE_MODELS[0];
      const targetProvider = selectedModelObj.provider;
      const targetKey =
        targetProvider === 'groq'
          ? localStorage.getItem('noteai_groq_key') || undefined
          : targetProvider === 'gemini'
          ? localStorage.getItem('noteai_gemini_key') || undefined
          : localStorage.getItem('noteai_openai_key') || undefined;

      const result = await sessionsApi.ingest({
        bbb_base_url: effectiveBaseUrl,
        bbb_url: bbbBaseUrl.trim(),
        meeting_id: effectiveMeetingId,
        course_id: effectiveCourseId,
        duration_seconds: durationSeconds,
        create_new_course: isCreatingNewCourse,
        new_course_code: newCourseCode.trim(),
        new_course_name: newCourseName.trim(),
        new_course_instructor: newCourseInstructor.trim() || 'Prof. Academic Lead',
        new_course_color: newCourseColor,
        ai_provider: targetProvider,
        ai_model: selectedModel,
        api_key: targetKey || undefined,
      });

      setIngestedSessionId(result.session_id);
      setIngestStatus(result.status ?? 'processing');

      // Refresh both SWR caches so the new course and session appear everywhere
      await Promise.all([mutateCourses(), mutateSessions()]);

      setMeetingId('');
      if (isCreatingNewCourse) {
        setNewCourseCode('');
        setNewCourseName('');
        setNewCourseInstructor('');
        setIsCreatingNewCourse(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ingestion failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card space-y-4">
      {/* Header with Active Role Badge */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/25 flex items-center justify-center flex-shrink-0">
            <Upload className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary text-sm">Ingest University Lecture</h3>
            <p className="text-xs text-text-muted">Import BigBlueButton recording into AI pipeline</p>
          </div>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
            role === 'professor'
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              : role === 'admin'
              ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
              : 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
          }`}
        >
          {role}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* BBB Base URL or Full Link */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1">
            BigBlueButton Recording URL
          </label>
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
            <input
              type="text"
              value={bbbBaseUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="Paste full BBB URL (e.g. https://visioconference.supmti.ac.ma/presentation/.../webcams.webm)"
              className="input-base pl-9 text-xs"
              disabled={isSubmitting}
              required
            />
          </div>
        </div>

        {/* Meeting ID */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1">
            Presentation ID / Meeting Hash
          </label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
            <input
              type="text"
              value={meetingId}
              onChange={(e) => setMeetingId(e.target.value)}
              placeholder="b7ac9a49b231-1793044808054"
              className="input-base pl-9 text-xs font-mono"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* ── LECTURE DURATION SELECTOR (Supports 2h or more) ────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-accent" />
              Recording Duration (1h to 3h+)
            </label>
            <span className="text-[11px] font-mono text-accent font-bold">
              {Math.floor(durationSeconds / 3600)}h {Math.floor((durationSeconds % 3600) / 60)}m ({Math.round(durationSeconds / 60)} mins)
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { label: '1h 00m', sec: 3600, badge: '60 min' },
              { label: '1h 30m', sec: 5400, badge: '90 min' },
              { label: '2h 00m', sec: 7200, badge: 'Standard 2h' },
              { label: '3h 00m', sec: 10800, badge: 'Marathon 3h' },
            ].map((opt) => (
              <button
                key={opt.sec}
                type="button"
                onClick={() => setDurationSeconds(opt.sec)}
                className={cn(
                  'py-1.5 px-2 rounded-xl text-xs border text-center transition-all flex flex-col items-center justify-center',
                  durationSeconds === opt.sec
                    ? 'bg-accent/20 border-accent text-white shadow-sm ring-1 ring-accent'
                    : 'bg-surface border-border text-text-muted hover:text-white hover:border-border/80'
                )}
              >
                <span className="font-bold text-[11px]">{opt.label}</span>
                <span className="text-[9px] text-text-muted font-mono">{opt.badge}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── TARGET COURSE SECTION: SELECT OR CREATE ON THE FLY ───────────────── */}
        <div className="pt-1">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-text-secondary">
              Target Academic Course
            </label>
            <div className="flex items-center gap-1 bg-surface-raised p-0.5 rounded-lg border border-border">
              <button
                type="button"
                onClick={() => setIsCreatingNewCourse(false)}
                className={cn(
                  'px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all',
                  !isCreatingNewCourse
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-text-muted hover:text-white'
                )}
              >
                Existing
              </button>
              <button
                type="button"
                onClick={() => setIsCreatingNewCourse(true)}
                className={cn(
                  'px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1',
                  isCreatingNewCourse
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-emerald-400 hover:text-emerald-300'
                )}
              >
                <PlusCircle className="w-3 h-3" />
                + Create New Course
              </button>
            </div>
          </div>

          {!isCreatingNewCourse ? (
            /* Choose existing course */
            <div className="relative">
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className={cn(
                  'input-base text-xs appearance-none pr-8',
                  !courseId && 'text-text-muted'
                )}
                disabled={isSubmitting}
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} — {course.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
            </div>
          ) : (
            /* Create new course right at insertion */
            <div className="p-3.5 rounded-xl bg-surface-raised/90 border border-emerald-500/30 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Creating Target Course at Link Insertion
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SEC501, DEV303"
                    className="input-base text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">
                    Course Name *
                  </label>
                  <input
                    type="text"
                    value={newCourseName}
                    onChange={(e) => setNewCourseName(e.target.value)}
                    placeholder="e.g. Zero-Trust Security"
                    className="input-base text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-center">
                <div>
                  <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">
                    Instructor Name
                  </label>
                  <input
                    type="text"
                    value={newCourseInstructor}
                    onChange={(e) => setNewCourseInstructor(e.target.value)}
                    placeholder="Prof. Laurent Martin"
                    className="input-base text-xs"
                  />
                </div>

                {/* Color Palette Chips */}
                <div>
                  <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">
                    Theme Color
                  </label>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    {COLOR_PALETTE.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => setNewCourseColor(hex)}
                        className="w-5 h-5 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                        style={{ backgroundColor: hex }}
                      >
                        {newCourseColor === hex && <Check className="w-3 h-3 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── LLM ENGINE & MODEL SELECTION ────────────────────────────────── */}
        <div className="pt-2 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-accent" />
              LLM Synthesis Engine & Model
            </label>
            <Link
              href="/settings"
              className="text-[11px] text-text-muted hover:text-accent transition-colors flex items-center gap-1 font-medium"
            >
              API Keys <Settings className="w-3 h-3" />
            </Link>
          </div>

          {/* Provider Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-surface-raised p-1 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => handleProviderChange('groq')}
              className={cn(
                'py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5',
                selectedProvider === 'groq'
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-sm ring-1 ring-orange-500/30'
                  : 'text-text-muted hover:text-white hover:bg-surface/50'
              )}
            >
              <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span className="truncate">Groq LPU</span>
            </button>
            <button
              type="button"
              onClick={() => handleProviderChange('gemini')}
              className={cn(
                'py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5',
                selectedProvider === 'gemini'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm ring-1 ring-emerald-500/30'
                  : 'text-text-muted hover:text-white hover:bg-surface/50'
              )}
            >
              <Sparkles className="w-3.5 h-3.5 text-accent shrink-0" />
              <span className="truncate">Gemini Free</span>
            </button>
            <button
              type="button"
              onClick={() => handleProviderChange('openai')}
              className={cn(
                'py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5',
                selectedProvider === 'openai'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm ring-1 ring-amber-500/30'
                  : 'text-text-muted hover:text-white hover:bg-surface/50'
              )}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">OpenAI</span>
            </button>
          </div>

          {/* Model Selection for Active Provider */}
          <div className="space-y-1.5">
            {AVAILABLE_MODELS.filter((m) => m.provider === selectedProvider).map((m) => {
              const isSelected = selectedModel === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedModel(m.id)}
                  className={cn(
                    'w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-3 group',
                    isSelected
                      ? 'bg-accent/15 border-accent text-white shadow-sm ring-1 ring-accent'
                      : 'bg-surface/80 border-border/70 text-text-muted hover:text-white hover:border-border hover:bg-surface'
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <div
                        className={cn(
                          'w-2 h-2 rounded-full shrink-0 transition-all',
                          isSelected ? 'bg-accent ring-2 ring-accent/30' : 'bg-text-muted/30 group-hover:bg-text-muted/60'
                        )}
                      />
                      <span className="font-semibold text-xs text-white truncate">{m.name}</span>
                    </div>
                    <p className="text-[11px] text-text-muted truncate leading-tight pl-3.5">
                      {m.description}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={cn(
                        'text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border tracking-wider',
                        m.provider === 'groq'
                          ? 'bg-orange-500/15 text-orange-300 border-orange-500/30'
                          : m.provider === 'gemini'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      )}
                    >
                      {m.badge}
                    </span>
                    <span className="font-mono text-[9px] text-text-muted/90 font-medium">
                      {m.speed}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-accent w-full flex items-center justify-center gap-2 text-xs font-bold py-2.5 shadow-lg shadow-accent/20"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Ingesting & Synthesizing…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {isCreatingNewCourse
                ? 'Create Course & Ingest Lecture'
                : 'Ingest & Generate Notes'}
            </>
          )}
        </button>
      </form>

      {/* Progress & Result Card */}
      {ingestedSessionId && (
        <div className="mt-4 p-4 rounded-2xl border border-indigo-500/30 bg-surface-raised space-y-3 animate-fade-in shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">
              {ingestStatus === 'processing'
                ? '⚡ AI Pipeline Running…'
                : 'Lecture Ready for Study'}
            </span>
            <StatusBadge status={ingestStatus || 'ready'} />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Link
              href={`/study/${ingestedSessionId}`}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold transition-all shadow-md shadow-accent/25"
            >
              <Play className="w-3 h-3 fill-white" />
              Open Study View
            </Link>
            <Link
              href={`/flashcards/${ingestedSessionId}`}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-surface hover:bg-surface-hover border border-border text-pink-400 text-xs font-bold transition-colors"
            >
              <Brain className="w-3.5 h-3.5" />
              Cards
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
