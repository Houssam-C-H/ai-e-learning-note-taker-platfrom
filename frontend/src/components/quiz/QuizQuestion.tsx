'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, HelpCircle, ArrowRight } from 'lucide-react';
import type { QuizQuestion as QuizQuestionType } from '@/lib/types';

interface QuizQuestionProps {
  question: QuizQuestionType;
  questionNumber: number;
  totalQuestions: number;
  onAnswerSelected: (isCorrect: boolean) => void;
  onNext: () => void;
  isLast: boolean;
}

export function QuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  onAnswerSelected,
  onNext,
  isLast,
}: QuizQuestionProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedIndex(index);
    setIsAnswered(true);
    const isCorrect = index === question.correct_option_index;
    onAnswerSelected(isCorrect);
  };

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="card max-w-2xl mx-auto p-6 md:p-8 space-y-6 border border-border shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between text-xs text-text-muted">
        <span className="font-semibold text-accent uppercase tracking-wider">
          Question {questionNumber} of {totalQuestions}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-surface border border-border font-mono text-[10px]">
          Single Choice
        </span>
      </div>

      {/* Question Text */}
      <h3 className="text-lg md:text-xl font-bold text-white leading-relaxed">
        {question.question}
      </h3>

      {/* Options List */}
      <div className="space-y-3">
        {question.options.map((opt, i) => {
          const isSelected = selectedIndex === i;
          const isCorrect = i === question.correct_option_index;

          let btnStyle = 'bg-surface hover:bg-surface-hover border-border text-text-primary';

          if (isAnswered) {
            if (isCorrect) {
              btnStyle = 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300 font-medium';
            } else if (isSelected && !isCorrect) {
              btnStyle = 'bg-rose-500/15 border-rose-500/60 text-rose-300 font-medium';
            } else {
              btnStyle = 'bg-surface/50 border-border/40 text-text-muted opacity-60';
            }
          }

          return (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(i)}
              disabled={isAnswered}
              className={`w-full p-4 rounded-xl border text-left text-sm flex items-start gap-3.5 transition-all ${btnStyle}`}
            >
              <span
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                  isAnswered && isCorrect
                    ? 'bg-emerald-500 text-white'
                    : isAnswered && isSelected && !isCorrect
                    ? 'bg-rose-500 text-white'
                    : 'bg-card border border-border text-text-muted'
                }`}
              >
                {optionLetters[i]}
              </span>
              <span className="flex-1 leading-snug">{opt}</span>
              {isAnswered && isCorrect && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              )}
              {isAnswered && isSelected && !isCorrect && (
                <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Authoritative Explanation (Revealed on Answer) */}
      {isAnswered && (
        <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-2 animate-fade-in">
          <div className="flex items-center gap-1.5 text-xs font-bold text-accent uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            Instructor Explanation
          </div>
          <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
            {question.explanation || 'No detailed explanation provided for this question.'}
          </p>
        </div>
      )}

      {/* Next Question Button */}
      {isAnswered && (
        <div className="flex justify-end pt-2 animate-fade-in">
          <button
            onClick={onNext}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-lg shadow-accent/25 transition-all"
          >
            {isLast ? 'View Final Results' : 'Next Question'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

