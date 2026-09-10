'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, Pause, Play, ShieldAlert, Square, X } from 'lucide-react';
import type { Language } from '@/lib/types';
import {
  buildHikeSession,
  formatClock,
  formatPace,
  STEPS_PER_KM,
  trailName,
  TRAILS,
  trailById,
  type HikeSession,
  type HikeSource,
  type Trail
} from '@/lib/trails';

type Phase = 'idle' | 'active' | 'summary';

interface LiveMetrics {
  elapsed: number;
  distanceKm: number;
  elevationM: number;
  steps: number;
  source: HikeSource;
}

function haversineKm(a: GeolocationCoordinates, b: GeolocationCoordinates) {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function HikeTrackerPanel({
  lang,
  trail,
  onSaved,
  onExplore,
  onSos
}: {
  lang: Language;
  trail: Trail | null;
  onSaved: (session: HikeSession) => void;
  onExplore: () => void;
  onSos: () => void;
}) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [paused, setPaused] = useState(false);
  const [pickedId, setPickedId] = useState(trail?.id ?? 'lambak-family');
  const [live, setLive] = useState<LiveMetrics>({ elapsed: 0, distanceKm: 0, elevationM: 0, steps: 0, source: 'simulated' });
  const [summary, setSummary] = useState<HikeSession | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const elapsedRef = useRef(0);
  const simDistanceRef = useRef(0);
  const gpsDistanceRef = useRef(0);
  const gpsClimbRef = useRef(0);
  const lastFixRef = useRef<GeolocationCoordinates | null>(null);
  const lastAltitudeRef = useRef<number | null>(null);
  const autoStartedRef = useRef<string | null>(null);

  const selected = trailById(pickedId);

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (watchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const start = useCallback(
    (target: Trail) => {
      cleanup();
      elapsedRef.current = 0;
      simDistanceRef.current = 0;
      gpsDistanceRef.current = 0;
      gpsClimbRef.current = 0;
      lastFixRef.current = null;
      lastAltitudeRef.current = null;
      pausedRef.current = false;
      setPaused(false);
      setSummary(null);
      setLive({ elapsed: 0, distanceKm: 0, elevationM: 0, steps: 0, source: 'simulated' });
      setPhase('active');

      intervalRef.current = setInterval(() => {
        if (pausedRef.current) return;
        elapsedRef.current += 1;
        const ratePerSec = target.distanceKm / (target.estMinutes * 60);
        simDistanceRef.current += ratePerSec * (0.82 + Math.random() * 0.36);
        const distance = gpsDistanceRef.current > 0 ? gpsDistanceRef.current : simDistanceRef.current;
        const elevation = gpsClimbRef.current > 0 ? gpsClimbRef.current : (distance / target.distanceKm) * target.elevationM;
        setLive({
          elapsed: elapsedRef.current,
          distanceKm: distance,
          elevationM: elevation,
          steps: Math.round(distance * STEPS_PER_KM),
          source: gpsDistanceRef.current > 0 ? 'gps' : 'simulated'
        });
      }, 1000);

      // Real GPS when available (PWA / Capacitor); the simulated tick is the offline fallback.
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const fix = position.coords;
            if (pausedRef.current) {
              lastFixRef.current = fix;
              return;
            }
            if (fix.accuracy > 100) return;
            if (lastFixRef.current) {
              const moved = haversineKm(lastFixRef.current, fix);
              if (moved > 0.002 && moved < 0.1) gpsDistanceRef.current += moved;
            }
            if (typeof fix.altitude === 'number' && lastAltitudeRef.current !== null) {
              const gain = fix.altitude - lastAltitudeRef.current;
              if (gain > 0.3 && gain < 12) gpsClimbRef.current += gain;
            }
            if (typeof fix.altitude === 'number') lastAltitudeRef.current = fix.altitude;
            lastFixRef.current = fix;
          },
          () => undefined,
          { enableHighAccuracy: true, maximumAge: 5000, timeout: 20_000 }
        );
      }
    },
    [cleanup]
  );

  // Auto-start when launched from a trail detail page.
  useEffect(() => {
    if (trail && trail.id !== autoStartedRef.current) {
      autoStartedRef.current = trail.id;
      setPickedId(trail.id);
      start(trail);
    }
  }, [trail, start]);

  useEffect(() => cleanup, [cleanup]);

  function togglePause() {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
  }

  function stopToSummary() {
    cleanup();
    const usedGps = gpsDistanceRef.current > 0;
    const distance = usedGps ? gpsDistanceRef.current : simDistanceRef.current;
    const elevation = gpsClimbRef.current > 0 ? gpsClimbRef.current : (distance / selected.distanceKm) * selected.elevationM;
    const session = buildHikeSession({
      trail: selected,
      durationSec: elapsedRef.current,
      distanceKm: distance,
      elevationM: elevation,
      source: usedGps ? 'gps' : 'simulated'
    });
    setSummary(session);
    setPhase('summary');
  }

  function cancelHike() {
    cleanup();
    setPhase('idle');
  }

  function saveHike() {
    if (summary) onSaved(summary);
    autoStartedRef.current = null;
    setSummary(null);
    setPhase('idle');
  }

  const paceSecPerKm = live.distanceKm > 0 ? live.elapsed / live.distanceKm : 0;
  const progressPct = Math.min(100, (live.distanceKm / selected.distanceKm) * 100);

  if (phase === 'active') {
    return (
      <div className="mx-auto max-w-xl">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-b from-forest-900 via-forest-800 to-forest-700 p-5 text-white">
          <div className="flex items-center justify-between">
            <button type="button" onClick={cancelHike} aria-label="Cancel" className="grid h-9 w-9 place-items-center rounded-xl bg-white/15">
              <X className="h-4 w-4" />
            </button>
            <div className="flex-1 truncate px-3 text-center text-xs font-semibold text-emerald-100">{trailName(selected, lang)}</div>
            <button type="button" onClick={stopToSummary} className="rounded-xl bg-white/15 px-3 py-1.5 text-xs font-black">{lang === 'BM' ? 'Henti' : 'Stop'}</button>
          </div>

          <div className="mt-4 text-center">
            <div className="font-mono text-5xl font-black tabular-nums tracking-wide">{formatClock(live.elapsed)}</div>
            <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-100/80">{paused ? (lang === 'BM' ? 'Dijeda' : 'Paused') : lang === 'BM' ? 'Masa mendaki' : 'Time hiking'}</div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2.5">
            {[
              { value: live.distanceKm.toFixed(1), label: 'km' },
              { value: formatPace(paceSecPerKm), label: lang === 'BM' ? 'min/km' : 'min/km' },
              { value: String(Math.round(live.elevationM)), label: lang === 'BM' ? 'm tinggi' : 'm elev' },
              { value: live.steps.toLocaleString(), label: lang === 'BM' ? 'langkah' : 'steps' }
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-white/10 p-3 text-center">
                <div className="font-mono text-xl font-black tabular-nums">{stat.value}</div>
                <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-100/80">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl bg-white/10 p-4">
            <div className="mb-2 flex justify-between text-xs font-bold">
              <span>{lang === 'BM' ? 'Kemajuan ke puncak' : 'Progress to summit'}</span>
              <span>{Math.round(progressPct)}%</span>
            </div>
            <div className="relative h-3.5 overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-gradient-to-r from-lime-300 to-lime-500 transition-all duration-700" style={{ width: `${progressPct}%` }} />
              <span className="absolute top-1/2 -translate-y-1/2 text-xs transition-all duration-700" style={{ left: `calc(${progressPct}% - 8px)` }}>🥾</span>
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] font-semibold text-emerald-100/70">
              <span>{lang === 'BM' ? 'Mula' : 'Start'}</span>
              <span>{selected.distanceKm} km · {live.source === 'gps' ? 'GPS' : lang === 'BM' ? 'Anggaran luar talian' : 'Offline estimate'}</span>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button type="button" onClick={togglePause} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-sm font-black text-forest-800">
              {paused ? <Play className="h-4 w-4 fill-current" /> : <Pause className="h-4 w-4 fill-current" />} {paused ? (lang === 'BM' ? 'Sambung' : 'Resume') : (lang === 'BM' ? 'Jeda' : 'Pause')}
            </button>
            <button type="button" onClick={stopToSummary} className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/10 py-3.5 text-sm font-black">
              <Square className="h-4 w-4" /> {lang === 'BM' ? 'Henti & simpan' : 'Stop & save'}
            </button>
          </div>

          <button type="button" onClick={onSos} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-300/40 bg-red-600/20 py-2.5 text-xs font-black text-red-100">
            <ShieldAlert className="h-4 w-4" /> {lang === 'BM' ? 'Kecemasan SOS' : 'Emergency SOS'}
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'summary' && summary) {
    const summaryStats = [
      { value: formatClock(summary.durationSec), label: lang === 'BM' ? 'Masa' : 'Time' },
      { value: `${summary.distanceKm} km`, label: lang === 'BM' ? 'Jarak' : 'Distance' },
      { value: formatPace(summary.paceSecPerKm), label: lang === 'BM' ? 'Purin purata' : 'Avg pace' },
      { value: `${summary.elevationM} m`, label: lang === 'BM' ? 'Ketinggian' : 'Elevation' },
      { value: summary.steps.toLocaleString(), label: lang === 'BM' ? 'Langkah' : 'Steps' },
      { value: `${summary.caloriesKcal}`, label: lang === 'BM' ? 'Kalori' : 'Calories' }
    ];
    return (
      <div className="mx-auto max-w-md">
        <div className="card p-6 text-center">
          <div className="text-4xl">🎉</div>
          <h2 className="mt-2 text-xl font-black">{lang === 'BM' ? 'Bagus sekali, pendaki!' : 'Great work, hiker!'}</h2>
          <p className="mt-1 text-xs font-bold text-slate-500">{trailName(selected, lang)} · {selected.distanceKm} km · {summary.source === 'gps' ? 'GPS' : (lang === 'BM' ? 'anggaran' : 'estimate')}</p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            {summaryStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-slate-50 p-3 dark:bg-forest-900">
                <div className="text-base font-black text-brand-600 dark:text-teal-300">{stat.value}</div>
                <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-emerald-100/70">{stat.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-3">
            <button type="button" onClick={saveHike} className="flex-1 rounded-2xl bg-gradient-to-r from-lime-400 to-lime-500 py-3.5 text-sm font-black text-forest-900">
              {lang === 'BM' ? 'Simpan ke log ✅' : 'Save to log ✅'}
            </button>
            <button type="button" onClick={() => setPhase('idle')} className="rounded-2xl px-3 py-3.5 text-xs font-bold text-slate-500">{lang === 'BM' ? 'Buang' : 'Discard'}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="card flex flex-col items-center px-6 py-8 text-center">
        <div className="text-5xl">🥾</div>
        <h2 className="mt-3 text-xl font-black leading-tight">
          {lang === 'BM' ? 'Bersedia untuk pengembaraan seterusnya?' : 'Ready for your next adventure?'}
        </h2>
        <p className="mt-2 max-w-xs text-[13px] font-medium leading-relaxed text-slate-500">
          {lang === 'BM' ? 'Pilih denai, tekan mula, dan aplikasi menjejak setiap langkah anda — walaupun luar talian.' : 'Pick a trail, hit start, and Smart Lambak tracks your journey every step — even offline.'}
        </p>
      </div>

      <label className="relative block">
        <select
          value={pickedId}
          onChange={(event) => setPickedId(event.target.value)}
          className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-black dark:border-forest-500 dark:bg-forest-800"
        >
          {TRAILS.map((item) => (
            <option key={item.id} value={item.id}>{trailName(item, lang)} · {item.distanceKm} km</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </label>

      <div className="card flex items-center justify-between p-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{lang === 'BM' ? 'Jarak denai' : 'Trail distance'}</div>
          <div className="mt-1 text-2xl font-black text-brand-600 dark:text-teal-300">{selected.distanceKm} km</div>
          <div className="mt-0.5 text-[11px] font-bold text-slate-500">+{selected.elevationM} m · {lang === 'BM' ? selected.estTimeBm : selected.estTimeEn}</div>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-forest-900 dark:text-lime-300">
          <Play className="h-6 w-6 fill-current" />
        </div>
      </div>

      <div className="flex flex-col items-center">
        <button type="button" onClick={() => start(selected)} aria-label="Start hike" className="relative grid h-40 w-40 place-items-center rounded-full">
          <span className="absolute inset-0 animate-ping rounded-full border-4 border-lime-400/60" />
          <span className="absolute -inset-1.5 rounded-full border-4 border-lime-500" />
          <span className="grid h-full w-full place-items-center rounded-full bg-gradient-to-br from-lime-400 to-lime-500 text-forest-900 shadow-[0_14px_30px_rgba(132,204,22,0.45)]">
            <Play className="ml-1.5 h-12 w-12 fill-current" />
          </span>
        </button>
        <div className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-brand-600 dark:text-lime-300">{lang === 'BM' ? 'Mula mendaki' : 'Start hike'}</div>
      </div>

      <button type="button" onClick={onExplore} className="btn btn-soft w-full text-sm">{lang === 'BM' ? 'Lihat semua denai' : 'Browse all trails'}</button>
    </div>
  );
}
