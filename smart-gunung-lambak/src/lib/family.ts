'use client';

// Offline-first family linking for the visitor 50 m safe-zone geofence.
import { useCallback, useEffect, useState } from 'react';

export type FamilyRelation = 'child' | 'elderly' | 'partner';
export type ZoneStatus = 'in_zone' | 'near' | 'outside';

export interface FamilyMember {
  id: string;
  name: string;
  relation: FamilyRelation;
  age: number | null;
  linkedAt: string;
  distanceM: number;
  battery: number;
  status: ZoneStatus;
}

const STORAGE_KEY = 'lambak-family-v1';

const relationOrder: FamilyRelation[] = ['child', 'elderly', 'partner'];

function loadMembers(): FamilyMember[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FamilyMember[]) : [];
  } catch {
    return [];
  }
}

export function statusFromDistance(distanceM: number): ZoneStatus {
  if (distanceM <= 50) return 'in_zone';
  if (distanceM <= 80) return 'near';
  return 'outside';
}

export function useFamily() {
  const [members, setMembers] = useState<FamilyMember[]>([]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) setMembers(loadMembers());
    });
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback((next: FamilyMember[]) => {
    setMembers(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Keep in memory if storage is unavailable.
    }
  }, []);

  const addMember = useCallback(
    (input: { name: string; relation: FamilyRelation; age: number | null }) => {
      const distanceM = Math.round(8 + Math.random() * 30);
      const member: FamilyMember = {
        id: `fam-${Date.now()}`,
        name: input.name.trim() || 'Family member',
        relation: relationOrder.includes(input.relation) ? input.relation : 'child',
        age: input.age,
        linkedAt: new Date().toISOString(),
        distanceM,
        battery: 55 + Math.floor(Math.random() * 40),
        status: statusFromDistance(distanceM)
      };
      persist([member, ...loadMembers()]);
      return member;
    },
    [persist]
  );

  const removeMember = useCallback(
    (id: string) => {
      persist(loadMembers().filter((member) => member.id !== id));
    },
    [persist]
  );

  // Simulated periodic safe-zone check (a real deployment reads paired device GPS).
  const runSafetyCheck = useCallback(() => {
    const next = loadMembers().map((member) => {
      const drift = Math.random();
      // 80% stay comfortably in-zone, 12% near the edge, 8% step outside for a short alert.
      const distanceM = drift < 0.8 ? Math.round(6 + Math.random() * 38) : drift < 0.92 ? Math.round(51 + Math.random() * 24) : Math.round(81 + Math.random() * 40);
      return { ...member, distanceM, status: statusFromDistance(distanceM) };
    });
    persist(next);
    return next;
  }, [persist]);

  return { members, addMember, removeMember, runSafetyCheck };
}
