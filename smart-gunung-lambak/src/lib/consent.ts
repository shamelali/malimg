'use client';

// PDPA consent state (bilingual prompt). The decision is kept on the device and
// mirrored to /api/v1/consent for the compliance audit trail.
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'lambak-pdpa-consent-v1';

export type ConsentDecision = {
  accepted: boolean;
  at: string;
  scope: string;
} | null;

function load(): ConsentDecision {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ConsentDecision) : null;
  } catch {
    return null;
  }
}

export function useConsent() {
  const [decision, setDecision] = useState<ConsentDecision>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        setDecision(load());
        setReady(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const decide = useCallback(async (accepted: boolean) => {
    const next: NonNullable<ConsentDecision> = { accepted, at: new Date().toISOString(), scope: 'pdpa-v1' };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage failures.
    }
    setDecision(next);
    await fetch('/api/v1/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accepted, scope: 'pdpa-v1' })
    }).catch(() => undefined);
  }, []);

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage failures.
    }
    setDecision(null);
  }, []);

  return { decision, ready, decide, reset };
}
