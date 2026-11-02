'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Brain,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Download,
  RotateCcw,
  Sparkles,
  Loader2,
  CheckCircle,
  BookOpen
} from 'lucide-react';
import { flashcardsApi, sessionsApi } from '@/lib/api';
import type { Flashcard, Session } from '@/lib/types';
import { FlipCard } from '@/components/flashcards/FlipCard';

export default function FlashcardsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.sessionId as string;

  const [session, setSession] = useState<Session | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [ratings, setRatings] = useState<Record<number, number>>({});

  useEffect(() => {
    async function loadData() {
      if (!sessionId) return;
      try {
        const [s, fcs] = await Promise.all([
          sessionsApi.get(sessionId),
          flashcardsApi.list(sessionId),
        ]);
        setSession(s);
        setCards(fcs);
      } catch (err) {
        console.error('Failed to load flashcards:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [sessionId]);

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCompleted(true);
    }
  }, [currentIndex, cards.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setCompleted(false);
  };

  const handleRate = (difficulty: number) => {
    setRatings((prev) => ({ ...prev, [currentIndex]: difficulty }));
    handleNext();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev]);

  // Export as Anki tab-delimited text
  const handleExportAnki = () => {
    if (cards.length === 0) return;
    const tsvContent = cards
      .map((c) => `${c.front.replace(/\t/g, ' ')}\t${c.back.replace(/\t/g, ' ')}`)
      .join('\n');
    const blob = new Blob([tsvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `anki-deck-${sessionId.slice(0, 8)}.tsv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="card flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const progressPercent = cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Lecture
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShuffle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-hover text-xs font-semibold text-text-muted hover:text-white border border-border transition-colors"
          >
            <Shuffle className="w-3.5 h-3.5" />
            Shuffle Deck
          </button>
          <button
            onClick={handleExportAnki}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent/20 hover:bg-accent text-accent hover:text-white text-xs font-semibold border border-accent/40 transition-all"
            title="Export for Anki spaced repetition app"
          >
            <Download className="w-3.5 h-3.5" />
            Export for Anki
          </button>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="card text-center py-20 space-y-4">
          <Brain className="w-12 h-12 text-pink-400 mx-auto opacity-50" />
          <h3 className="text-lg font-bold text-white">No Flashcards Generated Yet</h3>
          <p className="text-sm text-text-muted max-w-sm mx-auto">
            Flashcards are automatically synthesized from the lecture transcript. If the session is still processing, please check back in a moment.
          </p>
          <Link
            href={`/study/${sessionId}`}
            className="inline-block text-xs font-semibold text-accent hover:underline"
          >
            Return to Study View →
          </Link>
        </div>
      ) : completed ? (
        /* Completion celebration */
        <div className="card text-center py-16 space-y-5 animate-scale-up border-emerald-500/30">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white">Deck Completed!</h2>
            <p className="text-sm text-text-muted">
              You reviewed all {cards.length} spaced-repetition concepts for this lecture.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={() => {
                setCurrentIndex(0);
                setIsFlipped(false);
                setCompleted(false);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-hover text-white text-xs font-semibold border border-border"
            >
              <RotateCcw className="w-4 h-4" />
              Review Again
            </button>
            <Link
              href={`/quiz/${sessionId}`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-lg shadow-accent/25"
            >
              Take Self-Test Quiz →
            </Link>
          </div>
        </div>
      ) : (
        /* Flashcard Study Cockpit */
        <div className="space-y-5">
          {/* Progress tracker */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span className="font-semibold text-white">
                Card {currentIndex + 1} of {cards.length}
              </span>
              <span>{Math.round(progressPercent)}% completed</span>
            </div>
            <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* 3D Flip Card */}
          {currentCard && (
            <FlipCard
              card={currentCard}
              isFlipped={isFlipped}
              onFlip={handleFlip}
              onRate={handleRate}
            />
          )}

          {/* Bottom Nav Controls */}
          <div className="flex items-center justify-between max-w-2xl mx-auto pt-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface hover:bg-surface-hover disabled:opacity-40 text-xs font-semibold text-white border border-border transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <div className="text-xs text-text-muted hidden sm:block">
              Use <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border text-[10px]">Space</kbd> to flip, <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border text-[10px]">←</kbd> <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border text-[10px]">→</kbd> to navigate
            </div>
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-accent hover:bg-accent-hover text-xs font-semibold text-white transition-all shadow-lg shadow-accent/25"
            >
              {currentIndex === cards.length - 1 ? 'Finish Deck' : 'Next Card'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

