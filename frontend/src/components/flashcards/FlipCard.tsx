'use client';

import { RotateCw, Brain, Sparkles, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import type { Flashcard } from '@/lib/types';

interface FlipCardProps {
  card: Flashcard;
  isFlipped: boolean;
  onFlip: () => void;
  onRate?: (difficulty: number) => void;
}

export function FlipCard({ card, isFlipped, onFlip, onRate }: FlipCardProps) {
  return (
    <div className="flip-card-container w-full max-w-2xl h-[380px] mx-auto cursor-pointer select-none">
      <div
        className={`flip-card-inner w-full h-full ${isFlipped ? 'flipped' : ''}`}
        onClick={onFlip}
      >
        {/* FRONT OF CARD */}
        <div className="flip-card-face bg-gradient-to-br from-surface-raised via-surface to-surface border border-indigo-500/30 p-8 flex flex-col justify-between shadow-2xl shadow-black/60 hover:border-indigo-500/60 transition-colors">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              <Brain className="w-3.5 h-3.5 text-pink-400" />
              Active Recall
            </span>
            <span className="text-xs font-mono text-text-muted flex items-center gap-1">
              <RotateCw className="w-3 h-3 text-accent animate-spin-slow" />
              Click to Reveal Answer
            </span>
          </div>

          <div className="my-auto text-center px-4">
            <h3 className="text-xl md:text-2xl font-bold text-white leading-relaxed">
              {card.front}
            </h3>
          </div>

          <div className="flex items-center justify-between text-xs text-text-muted border-t border-border/40 pt-4">
            <span>Press Space or click anywhere to flip</span>
            <span className="px-2 py-0.5 rounded bg-surface border border-border text-[10px] font-mono text-indigo-400">
              Difficulty: {card.difficulty === 0 ? 'Normal' : `Level ${card.difficulty}`}
            </span>
          </div>
        </div>

        {/* BACK OF CARD */}
        <div className="flip-card-face flip-card-back bg-gradient-to-br from-[#121422] via-surface to-[#0E101A] border border-accent/40 p-8 flex flex-col justify-between shadow-2xl shadow-indigo-950/30">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Explanation & Key Syntax
            </span>
            <span className="text-xs font-mono text-text-muted">
              Click to flip back
            </span>
          </div>

          <div className="my-auto overflow-y-auto max-h-[220px] px-2 py-2 pr-3 custom-scrollbar text-center">
            <p className="text-base md:text-lg text-text-primary leading-relaxed whitespace-pre-wrap font-medium">
              {card.back}
            </p>
          </div>

          {/* Self-Rating Bar */}
          <div
            className="flex items-center justify-between border-t border-border/50 pt-3"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-xs text-text-muted">How well did you know this?</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onRate?.(3)}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/15 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 transition-all"
              >
                Hard
              </button>
              <button
                type="button"
                onClick={() => onRate?.(2)}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 transition-all"
              >
                Medium
              </button>
              <button
                type="button"
                onClick={() => onRate?.(1)}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition-all"
              >
                Easy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

