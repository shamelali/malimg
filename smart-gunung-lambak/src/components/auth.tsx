'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ViewKey } from '@/lib/types';

export type AppRole =
  | 'super_admin'
  | 'park_manager'
  | 'ranger'
  | 'operator'
  | 'finance'
  | 'auditor'
  | 'visitor';

export type DemoUser = {
  name: string;
  email: string;
  role: AppRole;
  mfa: boolean;
};

const users: Record<AppRole, DemoUser> = {
  super_admin: { name: 'MPK Super Admin', email: 'admin@mpk.gov.my', role: 'super_admin', mfa: true },
  park_manager: { name: 'Park Manager', email: 'manager@mpk.gov.my', role: 'park_manager', mfa: true },
  ranger: { name: 'Ranger Hafiz', email: 'ranger.hafiz@mpk.gov.my', role: 'ranger', mfa: true },
  operator: { name: 'Chalet Operator', email: 'operator@mpk.gov.my', role: 'operator', mfa: true },
  finance: { name: 'Finance Officer', email: 'finance@mpk.gov.my', role: 'finance', mfa: true },
  auditor: { name: 'Auditor', email: 'auditor@mpk.gov.my', role: 'auditor', mfa: true },
  visitor: { name: 'Demo Visitor', email: 'visitor@example.com', role: 'visitor', mfa: false }
};

export const roleLabels: Record<AppRole, string> = {
  super_admin: 'Super Admin MPK',
  park_manager: 'Park Manager',
  ranger: 'Ranger',
  operator: 'Chalet Operator',
  finance: 'Finance',
  auditor: 'Auditor Read-only',
  visitor: 'Visitor'
};

const hikeViews: ViewKey[] = ['trails', 'hike', 'mytrails'];

const permissions: Record<AppRole, ViewKey[]> = {
  super_admin: ['visitor', ...hikeViews, 'ranger', 'command', 'admin', 'api', 'sla', 'budget'],
  park_manager: ['visitor', ...hikeViews, 'ranger', 'command', 'admin', 'api', 'sla', 'budget'],
  ranger: ['visitor', ...hikeViews, 'ranger', 'command', 'sla'],
  operator: ['visitor', ...hikeViews, 'ranger'],
  finance: ['visitor', ...hikeViews, 'command', 'budget', 'sla'],
  auditor: ['visitor', ...hikeViews, 'command', 'sla', 'api', 'budget'],
  visitor: ['visitor', ...hikeViews]
};

type AuthContextValue = {
  user: DemoUser;
  login: (role: AppRole) => Promise<void>;
  logout: () => Promise<void>;
  canAccess: (view: ViewKey) => boolean;
  allowedViews: ViewKey[];
};

const AuthContext = createContext<AuthContextValue | null>(null);

function initialRole(): AppRole {
  if (typeof window === 'undefined') return 'visitor';
  const saved = window.localStorage.getItem('lambak-role') as AppRole | null;
  return saved && users[saved] ? saved : 'visitor';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<AppRole>(initialRole);

  // Re-sync the server RBAC cookie after a reload where localStorage retained a staff role.
  useEffect(() => {
    if (role === 'visitor') return;
    fetch('/api/v1/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    }).catch(() => undefined);
  }, [role]);

  const value = useMemo<AuthContextValue>(() => ({
    user: users[role],
    login: async (nextRole) => {
      setRole(nextRole);
      window.localStorage.setItem('lambak-role', nextRole);
      await fetch('/api/v1/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: nextRole })
      }).catch(() => undefined);
    },
    logout: async () => {
      setRole('visitor');
      window.localStorage.setItem('lambak-role', 'visitor');
      await fetch('/api/v1/session', { method: 'DELETE' }).catch(() => undefined);
    },
    canAccess: (view) => permissions[role].includes(view),
    allowedViews: permissions[role]
  }), [role]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export const demoUsers = users;
