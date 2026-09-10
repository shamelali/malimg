'use client';

// Offline-first personal hike log: localStorage persistence, weekly aggregation and gamification badges.
import { useCallback, useEffect, useState } from 'react';
import type { Language } from './types';
import type { HikeSession } from './trails';

const STORAGE_KEY = 'lambak-hikes-v1';
const BOOKMARK_KEY = 'lambak-trail-bookmarks-v1';
const SEED_KEY = 'lambak-hikes-seeded-v1';

export interface HikeBadge {
  key: string;
  emoji: string;
  nameEn: string;
  nameBm: string;
  earned: boolean;
}

function daysAgoAt(days: number, hour: number, minute: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

// A few seeded past hikes so charts/badges feel alive before the first recorded hike.
function seededHikes(): HikeSession[] {
  const make = (
    id: string,
    trailId: string,
    trailNameEn: string,
    trailNameBm: string,
    days: number,
    hour: number,
    minute: number,
    durationSec: number,
    distanceKm: number,
    elevationM: number
  ): HikeSession => ({
    id,
    trailId,
    trailNameEn,
    trailNameBm,
    startedAt: daysAgoAt(days, hour, minute),
    durationSec,
    distanceKm,
    paceSecPerKm: Math.round(durationSec / distanceKm),
    elevationM,
    steps: Math.round(distanceKm * 1350),
    caloriesKcal: Math.round(distanceKm * 55),
    source: 'simulated',
    seeded: true
  });

  return [
    make('seed-family', 'lambak-family', 'Gunung Lambak Family Loop', 'Gelung Keluarga Gunung Lambak', 0, 7, 18, 8280, 4.2, 405),
    make('seed-soga', 'soga', 'Bukit Soga Sunrise Steps', 'Tangga Matahari Terbit Bukit Soga', 3, 6, 52, 7080, 3.4, 280),
    make('seed-bandar', 'hutan-bandar', 'Hutan Bandar Kluang Green Loop', 'Gelung Hijau Hutan Bandar Kluang', 5, 17, 5, 2700, 1.8, 35),
    make('seed-north', 'lambak-north', 'North Peak Trail (510 m)', 'Denai Puncak Utara (510 m)', 6, 8, 40, 6300, 3.1, 510)
  ];
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function loadHikes(): HikeSession[] {
  if (typeof window === 'undefined') return [];
  if (!window.localStorage.getItem(SEED_KEY)) {
    const seed = seededHikes();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    window.localStorage.setItem(SEED_KEY, 'true');
    return seed;
  }
  return safeParse<HikeSession[]>(window.localStorage.getItem(STORAGE_KEY), []);
}

function loadBookmarks(): string[] {
  if (typeof window === 'undefined') return [];
  return safeParse<string[]>(window.localStorage.getItem(BOOKMARK_KEY), []);
}

export function getBadges(hikes: HikeSession[]): HikeBadge[] {
  const totalKm = hikes.reduce((sum, hike) => sum + hike.distanceKm, 0);
  const earlyBird = hikes.some((hike) => new Date(hike.startedAt).getHours() < 9);
  const summit = hikes.some((hike) => hike.elevationM >= 450);
  const waterfall = hikes.some((hike) => hike.trailId === 'pulai');
  return [
    { key: 'pioneer', emoji: '🥾', nameEn: 'Trail Pioneer', nameBm: 'Perintis Denai', earned: hikes.length >= 1 },
    { key: 'early', emoji: '🌅', nameEn: 'Early Bird', nameBm: 'Burung Awal', earned: earlyBird },
    { key: 'summit', emoji: '⛰️', nameEn: 'Summit Seeker', nameBm: 'Pencari Puncak', earned: summit },
    { key: 'waterfall', emoji: '💦', nameEn: 'Waterfall Hunter', nameBm: 'Pemburu Air Terjun', earned: waterfall },
    { key: 'veteran', emoji: '🎒', nameEn: 'Five Trails', nameBm: 'Lima Denai', earned: hikes.length >= 5 },
    { key: 'fire', emoji: '🔥', nameEn: 'Fire Trail 25 km', nameBm: 'Denai Berapi 25 km', earned: totalKm >= 25 }
  ];
}

export function weeklyKilometres(hikes: HikeSession[]): { label: string; km: number; today: boolean }[] {
  const labelsEn = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const result = labelsEn.map((label) => ({ label, km: 0, today: false }));
  const today = new Date();
  for (const hike of hikes) {
    const date = new Date(hike.startedAt);
    const dayIndex = (date.getDay() + 6) % 7; // Monday = 0
    result[dayIndex].km += hike.distanceKm;
    if (date.toDateString() === today.toDateString()) result[dayIndex].today = true;
  }
  return result;
}

export function relativeWhen(iso: string, lang: Language): string {
  const start = new Date(iso);
  const today = new Date();
  const dayMs = 86_400_000;
  const dayDiff = Math.floor((new Date(today.toDateString()).getTime() - new Date(start.toDateString()).getTime()) / dayMs);
  if (lang === 'BM') {
    if (dayDiff === 0) return 'Hari ini';
    if (dayDiff === 1) return 'Semalam';
    if (dayDiff < 7) return `${dayDiff} hari lalu`;
    if (dayDiff < 30) return `${Math.floor(dayDiff / 7)} minggu lalu`;
    return new Date(iso).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' });
  }
  if (dayDiff === 0) return 'Today';
  if (dayDiff === 1) return 'Yesterday';
  if (dayDiff < 7) return `${dayDiff} days ago`;
  if (dayDiff < 30) return `${Math.floor(dayDiff / 7)} weeks ago`;
  return new Date(iso).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' });
}

export function useHikeLog() {
  const [ready, setReady] = useState(false);
  const [hikes, setHikes] = useState<HikeSession[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      setHikes(loadHikes());
      setBookmarks(loadBookmarks());
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const addHike = useCallback((session: HikeSession) => {
    setHikes((current) => {
      const next = [session, ...current];
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Storage may be unavailable; keep the hike in memory for this session.
      }
      return next;
    });
  }, []);

  const toggleBookmark = useCallback((trailId: string) => {
    setBookmarks((current) => {
      const next = current.includes(trailId) ? current.filter((id) => id !== trailId) : [...current, trailId];
      try {
        window.localStorage.setItem(BOOKMARK_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage failures.
      }
      return next;
    });
  }, []);

  return { ready, hikes, bookmarks, addHike, toggleBookmark };
}
