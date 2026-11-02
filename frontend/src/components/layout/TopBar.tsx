'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronRight,
  User,
  GraduationCap,
  BookOpen,
  Shield,
  Check,
  ChevronDown,
  Sparkles,
  Settings as SettingsIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';
import { useRole, type UserRole } from '@/context/RoleContext';

const routeLabels: Record<string, string> = {
  '/': 'Dashboard',
  '/calendar': 'Academic Calendar',
  '/courses': 'Courses Management',
  '/chat': 'AI Tutor Chatbot',
  '/profile': 'My Academic Profile',
  '/settings': 'System Settings',
};

function getBreadcrumbs(pathname: string): { label: string; href: string }[] {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return [{ label: 'Dashboard', href: '/' }];

  const crumbs: { label: string; href: string }[] = [];
  let path = '';

  for (const segment of segments) {
    path += `/${segment}`;
    const label = routeLabels[path] || segment.charAt(0).toUpperCase() + segment.slice(1);
    crumbs.push({ label, href: path });
  }

  return crumbs;
}

export function TopBar() {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);
  const { role, setRole, profile } = useRole();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowRoleMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const rolesList: Array<{ id: UserRole; label: string; icon: React.ElementType; desc: string }> = [
    {
      id: 'student',
      label: 'Student',
      icon: GraduationCap,
      desc: 'Study cockpit, quizzes, 3D flashcards & AI Tutor',
    },
    {
      id: 'professor',
      label: 'Professor / Instructor',
      icon: BookOpen,
      desc: 'Ingest lectures, edit notes, publish announcements & exams',
    },
    {
      id: 'admin',
      label: 'Administrator',
      icon: Shield,
      desc: 'Manage users, API keys, system health & course catalogs',
    },
  ];

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-border/60 bg-surface/70 backdrop-blur-md sticky top-0 z-20">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm min-w-0">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.href} className="flex items-center gap-2 min-w-0">
            {index > 0 && (
              <ChevronRight className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
            )}
            <Link
              href={crumb.href}
              className={cn(
                'truncate font-semibold transition-colors',
                index === breadcrumbs.length - 1
                  ? 'text-white'
                  : 'text-text-muted hover:text-white'
              )}
            >
              {crumb.label}
            </Link>
          </div>
        ))}
      </nav>

      {/* Right Controls: Interactive RBAC Role Switcher & Profile */}
      <div className="flex items-center gap-3">
        {/* Interactive RBAC Role Switcher */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-raised hover:bg-surface-raised/80 border border-border text-xs font-semibold text-white transition-all shadow-sm"
            title="Switch RBAC Role"
          >
            <span className="text-text-muted text-[11px] uppercase tracking-wider hidden sm:inline">
              Role:
            </span>
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-[11px] font-bold border capitalize',
                role === 'student' && 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
                role === 'professor' && 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
                role === 'admin' && 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              )}
            >
              {role}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
          </button>

          {/* Role Dropdown */}
          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-surface-raised border border-border rounded-2xl shadow-2xl p-2 z-50 animate-fade-in space-y-1">
              <div className="px-3 py-2 border-b border-border/60">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-accent" />
                  Role-Based Access Control (RBAC)
                </div>
                <div className="text-[10px] text-text-muted mt-0.5">
                  Select an identity to preview role capabilities
                </div>
              </div>

              {rolesList.map((item) => {
                const isSelected = role === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setRole(item.id);
                      setShowRoleMenu(false);
                    }}
                    className={cn(
                      'w-full text-left p-2.5 rounded-xl flex items-start gap-3 transition-colors',
                      isSelected
                        ? 'bg-accent/15 border border-accent/30 text-white'
                        : 'hover:bg-surface text-text-secondary hover:text-white'
                    )}
                  >
                    <div
                      className={cn(
                        'p-2 rounded-lg mt-0.5',
                        item.id === 'student' && 'bg-indigo-500/20 text-indigo-400',
                        item.id === 'professor' && 'bg-emerald-500/20 text-emerald-400',
                        item.id === 'admin' && 'bg-rose-500/20 text-rose-400'
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold flex items-center justify-between">
                        <span>{item.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-accent" />}
                      </div>
                      <div className="text-[11px] text-text-muted leading-relaxed mt-0.5">
                        {item.desc}
                      </div>
                    </div>
                  </button>
                );
              })}

              <div className="pt-1 border-t border-border/40 px-2 flex justify-between items-center text-[10px] text-text-muted">
                <span>Active Profile: {profile.name}</span>
                <Link
                  href="/profile"
                  onClick={() => setShowRoleMenu(false)}
                  className="text-accent hover:underline"
                >
                  View Details →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Settings Shortcut */}
        <Link
          href="/settings"
          className="p-2 rounded-xl bg-surface hover:bg-surface-raised border border-border text-text-muted hover:text-white transition-colors"
          title="Settings"
        >
          <SettingsIcon className="w-4 h-4" />
        </Link>

        {/* Profile Link */}
        <Link
          href="/profile"
          className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl bg-surface hover:bg-surface-raised border border-border transition-colors group"
          title="Open Profile"
        >
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-white group-hover:text-accent transition-colors leading-tight">
              {profile.name}
            </div>
            <div className="text-[10px] text-text-muted leading-tight">SUP MTI Rabat</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent to-purple-600 flex items-center justify-center font-bold text-white text-xs shadow-md shadow-accent/20">
            {profile.name.charAt(0)}
          </div>
        </Link>
      </div>
    </header>
  );
}
