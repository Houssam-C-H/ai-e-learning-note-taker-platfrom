'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckSquare,
  ArrowLeft,
  RotateCcw,
  Trophy,
  Loader2,
  BookOpen,
  Brain,
  Award
} from 'lucide-react';
import { quizApi, sessionsApi } from '@/lib/api';
import type { QuizQuestion as QuizQuestionType, Session } from '@/lib/types';
import { QuizQuestion } from '@/components/quiz/QuizQuestion';

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.sessionId as string;

  const [session, setSession] = useState<Session | null>(null);
  const [questions, setQuestions] = useState<QuizQuestionType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!sessionId) return;
      try {
        const [s, qs] = await Promise.all([
          sessionsApi.get(sessionId),
          quizApi.getQuestions(sessionId),
        ]);
        setSession(s);
        setQuestions(qs);
      } catch (err) {
        console.error('Failed to load quiz:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [sessionId]);

  const handleAnswerSelected = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setIsCompleted(false);
  };

  if (loading) {
    return (
      <div className="card flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const progressPercent = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const percentageScore = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Lecture
        </button>

        <span className="text-xs font-semibold text-text-muted flex items-center gap-1.5">
          <CheckSquare className="w-4 h-4 text-emerald-400" />
          Self-Assessment Module
        </span>
      </div>

      {questions.length === 0 ? (
        <div className="card text-center py-20 space-y-4">
          <CheckSquare className="w-12 h-12 text-emerald-400 mx-auto opacity-50" />
          <h3 className="text-lg font-bold text-white">No Quiz Questions Available</h3>
          <p className="text-sm text-text-muted max-w-sm mx-auto">
            Self-assessment questions are automatically derived from the lecture concepts.
          </p>
          <Link
            href={`/study/${sessionId}`}
            className="inline-block text-xs font-semibold text-accent hover:underline"
          >
            Return to Study View →
          </Link>
        </div>
      ) : isCompleted ? (
        /* Final Score Screen */
        <div className="card text-center py-16 space-y-6 animate-scale-up border-emerald-500/30">
          <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-950/40">
            {percentageScore >= 80 ? (
              <Trophy className="w-10 h-10" />
            ) : (
              <Award className="w-10 h-10" />
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">
              {percentageScore >= 80 ? 'Mastery Demonstrated! 🎉' : 'Quiz Completed!'}
            </h2>
            <p className="text-sm text-text-muted max-w-sm mx-auto">
              You scored <span className="font-bold text-white">{score}</span> out of{' '}
              <span className="font-bold text-white">{questions.length}</span> (
              <span className="text-emerald-400 font-bold">{percentageScore}%</span>)
            </p>
          </div>

          {/* Quick summary stats */}
          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto text-left">
            <div className="p-3 rounded-xl bg-surface border border-border">
              <div className="text-xs text-text-muted">Correct Answers</div>
              <div className="text-xl font-bold text-emerald-400">{score}</div>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-border">
              <div className="text-xs text-text-muted">Incorrect</div>
              <div className="text-xl font-bold text-rose-400">{questions.length - score}</div>
            </div>
          </div>

          {/* Next steps */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={handleRestart}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-hover text-white text-xs font-semibold border border-border"
            >
              <RotateCcw className="w-4 h-4" />
              Retake Quiz
            </button>
            <Link
              href={`/study/${sessionId}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-hover text-white text-xs font-semibold border border-border"
            >
              <BookOpen className="w-4 h-4 text-accent" />
              Review Notes
            </Link>
            <Link
              href={`/flashcards/${sessionId}`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-lg shadow-accent/25"
            >
              <Brain className="w-4 h-4" />
              Review Flashcards
            </Link>
          </div>
        </div>
      ) : (
        /* Quiz Active Flow */
        <div className="space-y-5">
          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>Progress</span>
              <span>
                {currentIndex + 1} of {questions.length}
              </span>
            </div>
            <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          {currentQ && (
            <QuizQuestion
              key={currentIndex}
              question={currentQ}
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
              onAnswerSelected={handleAnswerSelected}
              onNext={handleNext}
              isLast={currentIndex === questions.length - 1}
            />
          )}
        </div>
      )}
    </div>
  );
}

