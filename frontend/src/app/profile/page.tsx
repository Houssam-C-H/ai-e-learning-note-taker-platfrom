'use client';

import { useState } from 'react';
import {
  User,
  GraduationCap,
  BookOpen,
  Shield,
  Award,
  Calendar,
  CheckSquare,
  Brain,
  Layers,
  Save,
  CheckCircle2,
  School,
  BadgeCheck,
  Mail,
  Sparkles
} from 'lucide-react';
import { useRole, type UserRole } from '@/context/RoleContext';
import { useCourses } from '@/hooks/useCourses';
import { useSessions } from '@/hooks/useSession';
import { CourseTag } from '@/components/ui/CourseTag';

export default function ProfilePage() {
  const { role, profile, setRole, updateProfile } = useRole();
  const { courses } = useCourses();
  const { sessions } = useSessions();

  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [faculty, setFaculty] = useState(profile.faculty);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, email, faculty });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const roleDetails = {
    student: {
      badge: 'Student Identity',
      color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
      description: 'Access to real-time synchronized lecture player, 3D flashcards, self-test quizzes, and cross-course AI tutor.',
      permissions: ['Interactive lecture study cockpit', 'Active recall flashcards & Anki export', 'Self-test quizzes with performance analytics', 'AI Tutor chat across all past lectures'],
    },
    professor: {
      badge: 'Faculty Instructor',
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
      description: 'Authority to ingest BigBlueButton university recordings, edit synthesized markdown notes, publish exam alerts, and manage syllabi.',
      permissions: ['Ingest and process BigBlueButton recordings', 'Edit & annotate AI-synthesized lecture notes', 'Publish official exam dates and lab deadlines', 'Generate custom active recall flashcards & quizzes', 'Create and structure course catalogs'],
    },
    admin: {
      badge: 'System Administrator',
      color: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
      description: 'Full administrative control over campus platform infrastructure, OpenAI API keys, database stores, and user roles.',
      permissions: ['All Student and Professor permissions', 'System health diagnostics & latency logs', 'API key provisioning & usage monitoring', 'Manage global RBAC identities and permissions', 'Access MinIO / PostgreSQL storage directly'],
    },
  }[role];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-indigo-950/70 via-surface-raised to-card border border-border p-6 md:p-8 overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-tr from-accent via-indigo-500 to-purple-600 flex items-center justify-center text-2xl md:text-3xl font-extrabold text-white shadow-xl shadow-accent/30 flex-shrink-0">
              {profile.name.charAt(0)}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl md:text-2xl font-bold text-white">{profile.name}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${roleDetails.color}`}>
                  {role.toUpperCase()}
                </span>
              </div>
              <p className="text-xs md:text-sm text-text-muted flex items-center gap-2">
                <School className="w-3.5 h-3.5 text-accent" />
                {profile.university}
              </p>
              <p className="text-xs text-text-muted flex items-center gap-2 font-mono">
                <BadgeCheck className="w-3.5 h-3.5 text-accent" />
                ID: {profile.studentId || 'SUP-2026-USER'}
              </p>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 bg-surface/80 border border-border/80 p-3 rounded-2xl">
            <div className="text-center px-3 border-r border-border/60">
              <div className="text-lg font-bold text-accent">{sessions.length}</div>
              <div className="text-[10px] text-text-muted uppercase">Sessions</div>
            </div>
            <div className="text-center px-3 border-r border-border/60">
              <div className="text-lg font-bold text-emerald-400">92%</div>
              <div className="text-[10px] text-text-muted uppercase">Quiz Avg</div>
            </div>
            <div className="text-center px-3">
              <div className="text-lg font-bold text-pink-400">6 Days</div>
              <div className="text-[10px] text-text-muted uppercase">Streak</div>
            </div>
          </div>
        </div>
      </div>

      {/* RBAC Role Switcher Section */}
      <div className="card space-y-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-accent" />
            Role-Based Access Control (RBAC) Switcher
          </h2>
          <p className="text-xs text-text-muted mt-1">
            Toggle your active platform identity to experience the interface from student, professor, or admin perspectives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Student Role */}
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              role === 'student'
                ? 'bg-indigo-500/15 border-indigo-500 text-white shadow-lg shadow-indigo-500/15 ring-2 ring-indigo-500/30'
                : 'bg-surface hover:bg-surface-raised border-border text-text-secondary hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              {role === 'student' && (
                <span className="text-[11px] font-bold text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-full">
                  ACTIVE
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold text-white">Student</h3>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Dual-pane video study view, 3D flashcards, quiz modules, AI tutor chatbot.
            </p>
          </button>

          {/* Professor Role */}
          <button
            type="button"
            onClick={() => setRole('professor')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              role === 'professor'
                ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-lg shadow-emerald-500/15 ring-2 ring-emerald-500/30'
                : 'bg-surface hover:bg-surface-raised border-border text-text-secondary hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              {role === 'professor' && (
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                  ACTIVE
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold text-white">Professor / Faculty</h3>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Ingest recordings, edit note markdown, publish exam alerts & assignment deadlines.
            </p>
          </button>

          {/* Admin Role */}
          <button
            type="button"
            onClick={() => setRole('admin')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              role === 'admin'
                ? 'bg-rose-500/15 border-rose-500 text-white shadow-lg shadow-rose-500/15 ring-2 ring-rose-500/30'
                : 'bg-surface hover:bg-surface-raised border-border text-text-secondary hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              {role === 'admin' && (
                <span className="text-[11px] font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-full">
                  ACTIVE
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold text-white">Administrator</h3>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Full system privileges, API key provisioning, user management, and health telemetry.
            </p>
          </button>
        </div>

        {/* Active Role Capabilities Checklist */}
        <div className="p-4 rounded-2xl bg-surface-raised/70 border border-border/80 space-y-2 mt-4">
          <div className="text-xs font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            Granted Capabilities for {role.toUpperCase()}:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {roleDetails.permissions.map((perm, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-text-secondary">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>{perm}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-7 card space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-accent" />
            Academic Identity Details
          </h2>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-base text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Institutional Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-base text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Department / Faculty Specialization</label>
              <input
                type="text"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                className="input-base text-xs"
                required
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="submit"
                className="btn-accent text-xs flex items-center gap-1.5 py-2 px-4 shadow-md shadow-accent/20"
              >
                <Save className="w-3.5 h-3.5" />
                Save Changes
              </button>

              {saved && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 animate-fade-in font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Profile updated successfully!
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Enrolled Courses Overview */}
        <div className="md:col-span-5 card space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-accent" />
            Enrolled Courses ({courses.length})
          </h2>

          <div className="space-y-3">
            {courses.map((course) => (
              <div
                key={course.id}
                className="p-3 rounded-xl bg-surface-raised border border-border/80 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-xs text-white">{course.name}</div>
                  <div className="text-[11px] text-text-muted mt-0.5">{course.code} • {course.instructor || 'Prof. Academic'}</div>
                </div>
                <CourseTag code={course.code} color={course.color} size="sm" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
