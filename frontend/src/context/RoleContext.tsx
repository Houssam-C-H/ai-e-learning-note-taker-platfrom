'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'student' | 'professor' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  university: string;
  faculty: string;
  studentId?: string;
  avatarUrl?: string;
}

export type Permission =
  | 'ingest_lecture'
  | 'edit_notes'
  | 'publish_announcements'
  | 'take_quiz'
  | 'review_flashcards'
  | 'ask_tutor'
  | 'manage_courses'
  | 'manage_users'
  | 'view_system_analytics';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  student: [
    'take_quiz',
    'review_flashcards',
    'ask_tutor',
  ],
  professor: [
    'ingest_lecture',
    'edit_notes',
    'publish_announcements',
    'take_quiz',
    'review_flashcards',
    'ask_tutor',
    'manage_courses',
  ],
  admin: [
    'ingest_lecture',
    'edit_notes',
    'publish_announcements',
    'take_quiz',
    'review_flashcards',
    'ask_tutor',
    'manage_courses',
    'manage_users',
    'view_system_analytics',
  ],
};

const DEFAULT_PROFILES: Record<UserRole, UserProfile> = {
  student: {
    id: 'user-stu-001',
    name: 'Sami Ben Ali',
    email: 's.benali@supmti.ac.ma',
    role: 'student',
    university: 'SUP MTI Rabat',
    faculty: 'Computer Systems & Cyber Security (SEC401)',
    studentId: 'SUP-2026-8841',
  },
  professor: {
    id: 'user-prof-102',
    name: 'Prof. Laurent Martin',
    email: 'l.martin@supmti.ac.ma',
    role: 'professor',
    university: 'SUP MTI Rabat',
    faculty: 'Department of Networking & Distributed Systems',
    studentId: 'FACULTY-092',
  },
  admin: {
    id: 'user-adm-999',
    name: 'System Administrator',
    email: 'admin@supmti.ac.ma',
    role: 'admin',
    university: 'SUP MTI Rabat (Campus Core)',
    faculty: 'Academic IT & Teleconference Infrastructure',
    studentId: 'ROOT-001',
  },
};

interface RoleContextType {
  role: UserRole;
  profile: UserProfile;
  setRole: (newRole: UserRole) => void;
  hasPermission: (perm: Permission) => boolean;
  updateProfile: (updated: Partial<UserProfile>) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>('student');
  const [profile, setProfileState] = useState<UserProfile>(DEFAULT_PROFILES.student);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const savedRole = localStorage.getItem('noteai_role') as UserRole;
      if (savedRole && DEFAULT_PROFILES[savedRole]) {
        setRoleState(savedRole);
        setProfileState(DEFAULT_PROFILES[savedRole]);
      }
    } catch {
      // Ignore localStorage read errors in SSR
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    setProfileState(DEFAULT_PROFILES[newRole]);
    try {
      localStorage.setItem('noteai_role', newRole);
    } catch {
      // Ignore
    }
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    setProfileState((prev) => ({ ...prev, ...updated }));
  };

  const hasPermission = (perm: Permission): boolean => {
    return ROLE_PERMISSIONS[role]?.includes(perm) ?? false;
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        profile,
        setRole,
        hasPermission,
        updateProfile,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}

