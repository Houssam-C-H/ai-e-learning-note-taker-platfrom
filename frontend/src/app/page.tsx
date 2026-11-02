'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Sparkles, Brain, CheckSquare, Layers } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { IngestForm } from '@/components/dashboard/IngestForm';
import { RecentSessions } from '@/components/dashboard/RecentSessions';
import { dashboardApi } from '@/lib/api';
import type { DashboardStats } from '@/lib/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await dashboardApi.getStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
        // Fallback default
        setStats({
          total_sessions: 0,
          flashcards_generated: 0,
          quizzes_completed: 0,
          courses_count: 0,
        });
      } finally {
        setLoadingStats(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-card border border-indigo-500/20 p-6 md:p-8">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            AI Academic Intelligence Cockpit
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Turn Any Lecture Into Permanent Knowledge
          </h1>
          <p className="text-sm md:text-base text-text-muted mt-2 leading-relaxed">
            Ingest BigBlueButton university recordings, transcribe with Whisper (EN/FR/AR),
            and generate high-yield Markdown notes, spaced-repetition flashcards, and self-test quizzes.
          </p>
        </div>
        <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Lectures"
          value={stats?.total_sessions ?? 0}
          icon={Layers}
          accentColor="#6366F1"
          isLoading={loadingStats}
        />
        <StatsCard
          title="Flashcards Generated"
          value={stats?.flashcards_generated ?? 0}
          icon={Brain}
          accentColor="#EC4899"
          isLoading={loadingStats}
        />
        <StatsCard
          title="Quiz Questions"
          value={stats?.quizzes_completed ?? 0}
          icon={CheckSquare}
          accentColor="#10B981"
          isLoading={loadingStats}
        />
        <StatsCard
          title="Active Courses"
          value={stats?.courses_count ?? 0}
          icon={BookOpen}
          accentColor="#F59E0B"
          isLoading={loadingStats}
        />
      </div>

      {/* Grid: Ingestion Engine + Recent Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-6">
          <IngestForm />
        </div>
        <div className="lg:col-span-7 space-y-6">
          <RecentSessions />
        </div>
      </div>
    </div>
  );
}

