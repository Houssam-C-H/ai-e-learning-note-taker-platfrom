'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  MessageSquare,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  User,
  Shield,
  GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import Image from 'next/image';
import { useRole } from '@/context/RoleContext';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { label: 'Calendar', icon: CalendarDays, href: '/calendar' },
  { label: 'Courses', icon: BookOpen, href: '/courses' },
  { label: 'AI Tutor', icon: MessageSquare, href: '/chat' },
  { label: 'Profile', icon: User, href: '/profile' },
  { label: 'Settings', icon: Settings, href: '/settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { role, profile } = useRole();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const roleBadgeConfig = {
    student: {
      label: 'Student',
      icon: GraduationCap,
      className: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    },
    professor: {
      label: 'Professor',
      icon: BookOpen,
      className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    },
    admin: {
      label: 'Admin',
      icon: Shield,
      className: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    },
  }[role];

  return (
    <aside
      className={cn(
        'relative flex flex-col h-screen sticky top-0 bg-surface border-r border-border/60 transition-all duration-300 flex-shrink-0 z-30 select-none',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-5 border-b border-border/60',
          collapsed && 'justify-center px-0'
        )}
      >
        <Link href="/" className="flex items-center gap-2.5 min-w-0">
          <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-tr from-accent to-purple-500 flex items-center justify-center shadow-lg shadow-accent/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-base text-white tracking-tight leading-tight flex items-center gap-1.5">
                NoteAI
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-accent/20 text-accent font-bold">
                  PRO
                </span>
              </span>
              <span className="text-[10px] text-text-muted truncate">SUP MTI Platform</span>
            </div>
          )}
        </Link>
      </div>

      {/* Collapse toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 w-6 h-6 bg-surface border border-border rounded-full flex items-center justify-center hover:bg-surface-raised hover:border-accent text-text-muted hover:text-white transition-all duration-200 z-10 shadow-md"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {!collapsed && (
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted px-2 mb-2">
            Academic Suite
          </p>
        )}
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
                active
                  ? 'bg-accent text-white shadow-md shadow-accent/25'
                  : 'text-text-secondary hover:text-white hover:bg-surface-raised',
                collapsed && 'justify-center px-0'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon
                className={cn(
                  'flex-shrink-0 transition-colors',
                  collapsed ? 'w-5 h-5' : 'w-4 h-4',
                  active ? 'text-white' : 'text-text-muted'
                )}
              />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Role Card & Footer */}
      <div className={cn('p-3 border-t border-border/60 bg-surface/50', collapsed && 'flex justify-center p-2')}>
        {!collapsed ? (
          <div className="p-3 rounded-xl bg-surface-raised/80 border border-border/60 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-accent/30 to-purple-500/30 border border-accent/40 flex items-center justify-center text-xs font-bold text-accent">
                  {profile.name.charAt(0)}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-white truncate">{profile.name}</div>
                  <div className="text-[10px] text-text-muted truncate">{profile.university}</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-border/40">
              <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1', roleBadgeConfig.className)}>
                <roleBadgeConfig.icon className="w-3 h-3" />
                {roleBadgeConfig.label}
              </span>
              <Link href="/profile" className="text-[10px] text-text-muted hover:text-accent font-medium">
                Edit & Switch →
              </Link>
            </div>
          </div>
        ) : (
          <Link
            href="/profile"
            className="w-10 h-10 rounded-xl bg-surface-raised hover:bg-accent/20 border border-border flex items-center justify-center text-xs font-bold text-accent"
            title={`${profile.name} (${roleBadgeConfig.label})`}
          >
            {profile.name.charAt(0)}
          </Link>
        )}
      </div>
    </aside>
  );
}
