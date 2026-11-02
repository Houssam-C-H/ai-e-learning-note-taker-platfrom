'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  FileText,
  Brain,
  CheckSquare,
  Download,
  Copy,
  Check,
  AlertTriangle,
  Bell,
  Sparkles,
  Target
} from 'lucide-react';
import { useVideoSync } from '@/hooks/useVideoSync';
import { VideoPlayer } from '@/components/study/VideoPlayer';
import { MarkdownNotes } from '@/components/study/MarkdownNotes';
import type { Session, Note, Course } from '@/lib/types';
import { CourseTag } from '@/components/ui/CourseTag';
import { formatTime } from '@/lib/utils';

interface StudyPaneProps {
  session: Session;
  note: Note | null;
  course: Course | null;
}

export function StudyPane({ session, note, course }: StudyPaneProps) {
  const {
    videoRef,
    state,
    seekTo,
    togglePlay,
    setPlaybackRate,
    setVolume,
    toggleMute,
    skip,
  } = useVideoSync();

  const [activeTab, setActiveTab] = useState<'notes' | 'summary' | 'announcements' | 'exam'>('notes');
  const [copied, setCopied] = useState(false);
  const [generatingOffline, setGeneratingOffline] = useState(false);

  const handleGenerateOffline = async () => {
    setGeneratingOffline(true);
    try {
      await fetch('/api/sessions/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.id,
          bbb_url: session.video_url,
          course_id: session.course_id,
          force_offline_reference: true,
        }),
      });
      window.location.reload();
    } catch (e) {
      console.error('Failed to generate offline reference:', e);
    } finally {
      setGeneratingOffline(false);
    }
  };

  const handleCopyNotes = () => {
    if (note?.markdown_content) {
      navigator.clipboard.writeText(note.markdown_content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadMarkdown = () => {
    if (!note?.markdown_content) return;
    const blob = new Blob([note.markdown_content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `lecture-${session.id.slice(0, 8)}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Extract Announcements section if present (supports multi-hour and 1h notes)
  const announcementsContent = useMemo(() => {
    if (!note?.markdown_content) return '';
    const match = note.markdown_content.match(/## \d+\.[^\n]*(?:Teacher Announcements|Announcements|Deadlines)[\s\S]*?(?=## \d+\.|$)/i);
    return match ? match[0] : '';
  }, [note?.markdown_content]);

  // Extract Exam section if present
  const examContent = useMemo(() => {
    if (!note?.markdown_content) return '';
    const match = note.markdown_content.match(/## \d+\.[^\n]*(?:Exam Training|Exam Pitfalls|Practice Problems)[\s\S]*?(?=## \d+\.|$)/i);
    return match ? match[0] : '';
  }, [note?.markdown_content]);

  // Smoothly seek video and bring into viewport if user scrolled down
  const handleTimestampClick = (seconds: number) => {
    seekTo(seconds);
    if (typeof window !== 'undefined' && window.scrollY > 300) {
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Study Cockpit Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card/90 border border-border p-4 md:p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          {course && <CourseTag course={course} />}
          <h1 className="text-base md:text-lg font-bold text-white truncate max-w-md">
            {session.title || `Lecture Session (${session.bbb_meeting_id.slice(0, 16)})`}
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Link
            href={`/flashcards/${session.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-hover text-xs font-semibold text-pink-400 border border-border transition-colors"
          >
            <Brain className="w-3.5 h-3.5" />
            15 Flashcards
          </Link>
          <Link
            href={`/quiz/${session.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-hover text-xs font-semibold text-emerald-400 border border-border transition-colors"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Self-Test Quiz (10 Qs)
          </Link>
          <button
            onClick={handleCopyNotes}
            className="p-2 rounded-xl bg-surface hover:bg-surface-hover text-text-muted hover:text-white border border-border transition-colors"
            title="Copy notes"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleDownloadMarkdown}
            className="p-2 rounded-xl bg-surface hover:bg-surface-hover text-text-muted hover:text-white border border-border transition-colors"
            title="Download .md for Obsidian / Notion"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Dual Pane Grid: Sticky Video Left (50%), Natural Flowing Notes Right (50%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Synced Video Player (Sticky on Desktop) */}
        <div className="lg:col-span-6 space-y-4 lg:sticky lg:top-20 z-10">
          <VideoPlayer
            videoRef={videoRef}
            state={state}
            videoUrl={session.video_url}
            audioUrl={session.audio_url}
            togglePlay={togglePlay}
            seekTo={seekTo}
            setPlaybackRate={setPlaybackRate}
            setVolume={setVolume}
            toggleMute={toggleMute}
            skip={skip}
          />

          {/* Stream Information Card */}
          <div className="card p-3 text-xs text-text-muted flex items-center justify-between border-border/60">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              BigBlueButton Synced Player ({formatTime(session.duration_seconds || 7200)})
            </span>
            <span className="font-mono text-indigo-400 font-semibold">
              Status: {session.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Right Column: Interactive Study Assets & Tabs (Natural Clean Page Scroll) */}
        <div className="lg:col-span-6 card p-6 space-y-6 border border-border shadow-lg">
          {/* AI Generation Failure Banner */}
          {(session.status === 'failed' || session.error_message) && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/80 space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-red-200">AI Note Synthesis Notice</h4>
                  <p className="text-xs text-red-300 mt-1 leading-relaxed">
                    {session.error_message ||
                      'The AI provider was unable to generate notes for this session (OpenAI returned 429: Account credit balance exhausted).'}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-red-900/60">
                <Link
                  href="/settings"
                  className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent/80 transition-colors"
                >
                  ⚙️ Settings: Switch to Free Gemini Key
                </Link>
                <button
                  type="button"
                  onClick={handleGenerateOffline}
                  disabled={generatingOffline}
                  className="px-3 py-1.5 rounded-lg bg-surface text-text-primary text-xs font-semibold hover:bg-surface-hover border border-border transition-colors disabled:opacity-50"
                >
                  {generatingOffline ? 'Generating…' : '📄 Generate Offline Reference Guide'}
                </button>
              </div>
            </div>
          )}

          {/* Note View Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-border/80 pb-3 overflow-x-auto">
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'notes'
                  ? 'bg-accent text-white shadow-md shadow-accent/20'
                  : 'text-text-muted hover:text-white hover:bg-surface'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Detailed Study Notes
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'announcements'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-rose-300/80 hover:text-rose-200 hover:bg-rose-500/10'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              📢 Announcements
            </button>
            <button
              onClick={() => setActiveTab('exam')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'exam'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'text-amber-300/80 hover:text-amber-200 hover:bg-amber-500/10'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              🎯 Exam Training
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'summary'
                  ? 'bg-accent text-white shadow-md shadow-accent/20'
                  : 'text-text-muted hover:text-white hover:bg-surface'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Summary
            </button>
          </div>

          {/* Tab Content Display — No rigid height trap, clean natural reading experience */}
          <div className="min-h-[500px]">
            {activeTab === 'notes' && (
              <div className="animate-fade-in">
                {note?.markdown_content ? (
                  <MarkdownNotes
                    content={note.markdown_content}
                    onTimestampClick={handleTimestampClick}
                    currentSecond={state.currentTime}
                  />
                ) : (
                  <div className="text-center py-20 space-y-3">
                    <Sparkles className="w-8 h-8 text-indigo-400 mx-auto animate-pulse" />
                    <h4 className="text-sm font-semibold text-white">Synthesizing Detailed Dossier</h4>
                    <p className="text-xs text-text-muted max-w-xs mx-auto">
                      AI is generating full lecture notes, announcements, and exam drills.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'announcements' && (
              <div className="space-y-4 animate-fade-in">
                {announcementsContent ? (
                  <MarkdownNotes
                    content={announcementsContent}
                    onTimestampClick={handleTimestampClick}
                    currentSecond={state.currentTime}
                  />
                ) : (
                  <div className="p-6 rounded-2xl bg-surface border border-border text-center space-y-2">
                    <Bell className="w-6 h-6 text-rose-400 mx-auto" />
                    <h4 className="text-sm font-semibold text-white">Teacher Announcements</h4>
                    <p className="text-xs text-text-muted">
                      Check the main Detailed Study Notes tab for complete announcements and deadlines.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'exam' && (
              <div className="space-y-6 animate-fade-in">
                {examContent ? (
                  <MarkdownNotes
                    content={examContent}
                    onTimestampClick={handleTimestampClick}
                    currentSecond={state.currentTime}
                  />
                ) : (
                  <div className="p-6 rounded-2xl bg-surface border border-border text-center space-y-2">
                    <Target className="w-6 h-6 text-amber-400 mx-auto" />
                    <h4 className="text-sm font-semibold text-white">Exam Training & Practice</h4>
                    <p className="text-xs text-text-muted">
                      Review Section 7 in the Detailed Notes tab or open the interactive Quiz.
                    </p>
                  </div>
                )}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Link
                    href={`/quiz/${session.id}`}
                    className="btn-accent flex-1 flex items-center justify-center gap-2 text-xs py-2.5 font-semibold shadow-md shadow-accent/20"
                  >
                    <CheckSquare className="w-4 h-4" />
                    Take 10-Question Self-Test Quiz
                  </Link>
                  <Link
                    href={`/flashcards/${session.id}`}
                    className="flex-1 flex items-center justify-center gap-2 text-xs py-2.5 font-semibold bg-surface hover:bg-surface-hover border border-border text-pink-400 rounded-xl transition-colors"
                  >
                    <Brain className="w-4 h-4" />
                    Review 15 Flashcards
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'summary' && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-5 rounded-2xl bg-surface border border-border space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Executive Core Takeaway
                  </h4>
                  <p className="text-sm text-text-primary leading-relaxed">
                    {note?.executive_summary ||
                      note?.summary ||
                      'Executive summary will appear once the AI pipeline finishes synthesizing the transcript.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
