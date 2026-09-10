'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Award,
  Baby,
  BarChart3,
  Bird,
  CalendarCheck,
  CloudOff,
  Code2,
  Compass,
  Download,
  FileText,
  Footprints,
  Gauge,
  Languages,
  Moon,
  Mountain,
  Shield,
  Sparkles,
  Sun,
  Wallet,
  Wrench,
  X
} from 'lucide-react';
import type { Booking, DashboardSnapshot, Facility, Language, SosAlert, ViewKey } from '@/lib/types';
import type { HikeSession, Trail } from '@/lib/trails';
import { VisitorPanel } from './VisitorPanel';
import { TrailsPanel } from './TrailsPanel';
import { HikeTrackerPanel } from './HikeTrackerPanel';
import { HikeStatsPanel } from './HikeStatsPanel';
import { RangerPanel } from './RangerPanel';
import { CommandPanel } from './CommandPanel';
import { AdminPanel } from './AdminPanel';
import { ApiPanel } from './ApiPanel';
import { SlaPanel } from './SlaPanel';
import { BudgetPanel } from './BudgetPanel';
import { Pill } from './ui';
import { roleLabels, useAuth, type AppRole } from './auth';
import { useHikeLog } from '@/lib/hikeLog';
import { useFamily, type FamilyRelation } from '@/lib/family';
import { useConsent } from '@/lib/consent';
import { getUserPosition } from '@/lib/geolocation';
import {
  cacheDashboard,
  enqueueMutation,
  flushMutationQueue,
  getCachedDashboard,
  getQueuedMutations,
  type QueuedMutation
} from '@/lib/offlineQueue';

type WildlifeZone = { code: 'A' | 'B' | 'C'; en: string; bm: string; risk: 'high' | 'medium' | 'low' };

type ModalState =
  | { type: 'detail'; message: string }
  | { type: 'booking'; facility: Facility }
  | { type: 'ticket' }
  | { type: 'sos-confirm' }
  | { type: 'sos-result'; alert: SosAlert }
  | { type: 'booking-result'; booking: Booking }
  | { type: 'login' }
  | { type: 'queued'; message: string }
  | { type: 'family'; relation: FamilyRelation }
  | { type: 'wildlife'; zone: WildlifeZone }
  | { type: 'points' }
  | { type: 'consent' }
  | null;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

type Toast = { id: number; en: string; bm: string };

const nav: { key: ViewKey; en: string; bm: string; icon: React.ElementType }[] = [
  { key: 'visitor', en: 'Visitor', bm: 'Pelawat', icon: Mountain },
  { key: 'trails', en: 'Trails', bm: 'Denai', icon: Compass },
  { key: 'hike', en: 'Record', bm: 'Rekod', icon: Footprints },
  { key: 'mytrails', en: 'My Hikes', bm: 'Denai Saya', icon: Award },
  { key: 'ranger', en: 'Ranger', bm: 'Renjer', icon: Wrench },
  { key: 'command', en: 'Command', bm: 'Perintah', icon: BarChart3 },
  { key: 'admin', en: 'Admin', bm: 'Admin', icon: Shield },
  { key: 'api', en: 'API', bm: 'API', icon: Code2 },
  { key: 'sla', en: 'SLA', bm: 'SLA', icon: Gauge },
  { key: 'budget', en: 'Budget', bm: 'Belanjawan', icon: Wallet }
];

function getInitialView(): ViewKey {
  if (typeof window === 'undefined') return 'visitor';
  const requested = new URLSearchParams(window.location.search).get('view') as ViewKey | null;
  return requested && nav.some((item) => item.key === requested) ? requested : 'visitor';
}

export function AppShell() {
  const [view, setView] = useState<ViewKey>(getInitialView);
  const [lang, setLang] = useState<Language>('EN');
  const auth = useAuth();
  const [dark, setDark] = useState(false);
  const [data, setData] = useState<DashboardSnapshot | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [bookingName, setBookingName] = useState('Demo family');
  const [partySize, setPartySize] = useState(4);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().slice(0, 10));
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  const [pendingMutations, setPendingMutations] = useState<QueuedMutation[]>([]);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [selectedTrail, setSelectedTrail] = useState<Trail | null>(null);
  const hikeLog = useHikeLog();
  const family = useFamily();
  const consent = useConsent();
  const [familyName, setFamilyName] = useState('');
  const [familyAge, setFamilyAge] = useState<number | ''>('');
  const [wildlifeNote, setWildlifeNote] = useState('');

  const label = useCallback((en: string, bm: string) => (lang === 'BM' ? bm : en), [lang]);

  const toast = useCallback((en: string, bm: string) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, en, bm }]);
    window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), 3600);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/dashboard', { cache: 'no-store' });
      const snapshot = (await response.json()) as DashboardSnapshot;
      setData(snapshot);
      await cacheDashboard(snapshot);
      setOnline(true);
    } catch {
      const cached = await getCachedDashboard();
      if (cached) setData(cached);
      setOnline(false);
    }
  }, []);

  const replayQueue = useCallback(async () => {
    const result = await flushMutationQueue();
    const remaining = await getQueuedMutations();
    setPendingMutations(remaining);
    await refresh();
    if (result.flushed > 0) {
      toast(`${result.flushed} offline changes synced`, `${result.flushed} perubahan luar talian disegerakkan`);
    }
  }, [refresh, toast]);

  useEffect(() => {
    let active = true;

    fetch('/api/v1/dashboard', { cache: 'no-store' })
      .then((response) => response.json())
      .then(async (snapshot: DashboardSnapshot) => {
        if (!active) return;
        setData(snapshot);
        await cacheDashboard(snapshot);
        setOnline(true);
      })
      .catch(async () => {
        if (!active) return;
        const cached = await getCachedDashboard();
        if (cached) setData(cached);
        setOnline(false);
      });

    getQueuedMutations().then((queue) => {
      if (active) setPendingMutations(queue);
    });

    const handleOnline = () => {
      setOnline(true);
      replayQueue();
    };
    const handleOffline = () => setOnline(false);
    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      active = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, [refresh, replayQueue]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const visibleNav = nav.filter((item) => auth.canAccess(item.key));
  const activeView: ViewKey = auth.canAccess(view) ? view : 'visitor';

  async function api(path: string, options?: RequestInit) {
    try {
      const response = await fetch(path, {
        cache: 'no-store',
        headers: options?.body ? { 'Content-Type': 'application/json' } : undefined,
        ...options
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? 'Request failed');
      await refresh();
      await replayQueue();
      return payload;
    } catch (error) {
      const method = String(options?.method ?? 'GET');
      if (method !== 'GET') {
        const queued = await enqueueMutation({
          method: method as QueuedMutation['method'],
          path,
          body: options?.body ? JSON.parse(options.body as string) : undefined
        });
        setPendingMutations((current) => [...current, queued]);
        return { queued: true };
      }
      throw error;
    }
  }

  async function installApp() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') toast('Install prompt accepted', 'Pemasangan diterima');
    setInstallPrompt(null);
  }

  async function submitBooking() {
    if (modal?.type !== 'booking') return;
    try {
      const payload = await api('/api/v1/bookings', {
        method: 'POST',
        body: JSON.stringify({ facilityId: modal.facility.id, guestName: bookingName, partySize, checkInDate: bookingDate })
      });
      if (payload.queued) {
        setModal({ type: 'queued', message: 'Booking saved on this device and will sync when connectivity returns.' });
      } else {
        setModal({ type: 'booking-result', booking: payload.booking });
        toast('Booking confirmed • QR + PIN ready', 'Tempahan disahkan • QR + PIN siap');
      }
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Booking failed', 'Tempahan gagal');
    }
  }

  async function toggleTask(id: string, completed: boolean) {
    const result = await api('/api/v1/tasks', { method: 'PATCH', body: JSON.stringify({ id, completed }) });
    toast(
      result.queued ? 'Task change queued offline' : completed ? 'Task completed' : 'Task reopened',
      result.queued ? 'Perubahan tugasan disimpan luar talian' : completed ? 'Tugasan selesai' : 'Tugasan dibuka semula'
    );
  }

  async function cycleFacility(id: string) {
    const result = await api('/api/v1/facilities', { method: 'PATCH', body: JSON.stringify({ id }) });
    toast(result.queued ? 'Facility change queued offline' : 'Facility status updated', result.queued ? 'Perubahan fasiliti disimpan luar talian' : 'Status fasiliti dikemas kini');
  }

  async function syncQueue() {
    await replayQueue();
    await api('/api/v1/sync', { method: 'POST' });
    toast('Offline tasks synced', 'Tugasan luar talian disegerakkan');
  }

  async function stampCheckpoint(code: string) {
    const result = await api(`/api/v1/checkpoints/${code}`, { method: 'POST' });
    toast(result.queued ? 'Stamp queued offline' : 'Passport stamped • +15 points', result.queued ? 'Cop disimpan luar talian' : 'Passport dicop • +15 mata');
  }

  async function saveHike(session: HikeSession) {
    hikeLog.addHike(session);
    const result = await api('/api/v1/hikes', {
      method: 'POST',
      body: JSON.stringify({
        trailId: session.trailId,
        trailNameEn: session.trailNameEn,
        trailNameBm: session.trailNameBm,
        startedAt: session.startedAt,
        durationSec: session.durationSec,
        distanceKm: session.distanceKm,
        paceSecPerKm: session.paceSecPerKm,
        elevationM: session.elevationM,
        steps: session.steps,
        caloriesKcal: session.caloriesKcal,
        source: session.source
      })
    });
    setView('mytrails');
    toast(
      result.queued ? 'Hike saved on device • will sync' : 'Hike saved • +25 points • badge check',
      result.queued ? 'Pendakian disimpan pada peranti • akan disegerak' : 'Pendakian disimpan • +25 mata • semak lencana'
    );
  }

  function startTrail(trail: Trail) {
    setSelectedTrail(trail);
    setView('hike');
  }

  function openFamily(relation: FamilyRelation) {
    setFamilyName('');
    setFamilyAge(relation === 'elderly' ? 68 : '');
    setModal({ type: 'family', relation });
  }

  function confirmAddFamily() {
    if (modal?.type !== 'family') return;
    family.addMember({ name: familyName, relation: modal.relation, age: familyAge === '' ? null : Number(familyAge) });
    toast('Family member linked to safe zone', 'Ahli keluarga dipaut ke zon selamat');
    setModal(null);
  }

  async function checkSafeZone() {
    const updated = family.runSafetyCheck();
    const outside = updated.filter((member) => member.status === 'outside').length;
    toast(
      outside ? `Safe-zone check: ${outside} outside 50 m!` : `Safe-zone check: all ${updated.length} within 50 m`,
      outside ? `Semakan zon: ${outside} di luar 50 m!` : `Semakan zon: semua ${updated.length} dalam 50 m`
    );
  }

  async function submitWildlifeReport() {
    if (modal?.type !== 'wildlife') return;
    const { zone } = modal;
    const position = await getUserPosition().catch(() => null);
    const severity = zone.risk === 'low' ? 'P2' : 'P1';
    const suffix = wildlifeNote.trim() ? ` — ${wildlifeNote.trim()}` : '';
    const result = await api('/api/v1/incidents', {
      method: 'POST',
      body: JSON.stringify({
        type: 'wildlife',
        severity,
        zone: `Zone ${zone.code}`,
        titleEn: `Macaque sighting reported in Zone ${zone.code}${suffix}`,
        titleBm: `Nampak kera dilaporkan di Zon ${zone.code}${suffix}`,
        latitude: position?.latitude,
        longitude: position?.longitude,
        reportedBy: auth.user.name
      })
    });
    if (!result.queued) {
      toast('Sighting reported to rangers • command centre updated', 'Nampak hidupan dilapor kepada renjer • pusat kawalan dikemas kini');
    }
    setWildlifeNote('');
    setModal(null);
  }

  async function sendSos() {
    try {
      const position = await getUserPosition();
      const payload = await api('/api/v1/sos', {
        method: 'POST',
        body: JSON.stringify({
          name: bookingName || 'Visitor',
          familyCount: partySize,
          battery: 78,
          latitude: position.latitude,
          longitude: position.longitude,
          locationSource: position.source
        })
      });
      if (payload.queued) {
        setModal({ type: 'queued', message: 'SOS is saved with GPS data and will dispatch automatically when connectivity returns. In a real emergency, also call local emergency services immediately.' });
      } else {
        setModal({ type: 'sos-result', alert: payload.alert });
        toast('SOS dispatched • ETA 8 min', 'SOS dihantar • ETA 8 minit');
      }
    } catch {
      toast('SOS dispatch failed', 'Penghantaran SOS gagal');
    }
  }

  const currentNav = useMemo(() => nav.find((item) => item.key === activeView), [activeView]);

  return (
    <div className="min-h-screen bg-slate-100 pb-24 dark:bg-forest-900 lg:pb-10">
      {(!online || pendingMutations.length > 0) && (
        <div className="bg-amber-100 px-4 py-2 text-center text-xs font-black text-amber-950">
          <CloudOff className="mr-1 inline h-4 w-4" />
          {!online ? label('Offline • changes saved on this device', 'Luar talian • perubahan disimpan pada peranti ini') : label('Reconnected • syncing', 'Sambung semula • menyegerak')}
          {pendingMutations.length > 0 ? ` • ${pendingMutations.length} queued` : ''}
        </div>
      )}

      <header className="sticky top-0 z-40 border-b-2 border-brand-600 bg-white/95 backdrop-blur-xl dark:border-teal-400 dark:bg-forest-800/95">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-600 text-white shadow-lg">
              <Mountain className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-black leading-tight tracking-tight md:text-base">SMART GUNUNG LAMBAK PILOT</h1>
              <p className="truncate text-[10px] font-bold text-slate-500 dark:text-emerald-100/70">Duta Integra Solutions for MPK Kluang • MYR 2.8M optimum • 12 months</p>
              <div className="mt-1 hidden gap-1 md:flex">
                <Pill tone="yellow">MYR 2.8M</Pill>
                <Pill tone="green">ENTERPRISE</Pill>
                <Pill tone="blue">UPTIME {data?.uptimePct ?? '99.92'}%</Pill>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Pill tone="green">{label('Visitors today', 'Pelawat hari ini')} {data?.visitorsToday ?? 342}</Pill>
            <Pill tone="amber">{label('Car park', 'Parkir')} {data?.carPark.occupied ?? 87}/{data?.carPark.total ?? 120}</Pill>
            <button type="button" onClick={() => setModal({ type: 'login' })} className="rounded-full border border-slate-200 px-3 py-1.5 text-left text-[10px] font-black leading-tight dark:border-forest-500">
              <span className="block">{auth.user.name}</span>
              <span className="text-brand-600 dark:text-teal-300">{roleLabels[auth.user.role]}{auth.user.mfa ? ' • MFA' : ''}</span>
            </button>
            {installPrompt && (
              <button type="button" onClick={installApp} className="btn btn-teal px-3 py-1.5 text-xs">
                <Download className="h-3.5 w-3.5" /> {label('Install', 'Pasang')}
              </button>
            )}
            <button type="button" onClick={() => setLang((value) => (value === 'EN' ? 'BM' : 'EN'))} className="rounded-full border border-brand-600 px-3 py-1.5 text-xs font-black text-brand-600 dark:border-teal-400 dark:text-teal-300">
              <Languages className="mr-1 inline h-3.5 w-3.5" />{lang}
            </button>
            <button type="button" onClick={() => setDark((value) => !value)} aria-label="Toggle theme" className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 dark:border-forest-500">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button type="button" onClick={() => setModal({ type: 'points' })} className="btn btn-primary px-3 py-1.5 text-xs">
              <Sparkles className="h-3.5 w-3.5" />{data?.points ?? 0} pts
            </button>
          </div>
        </div>

        <nav className="mx-auto max-w-7xl px-2 pb-3 md:px-6">
          <div className="scrollbar-none flex gap-2 overflow-x-auto">
            {visibleNav.map((item) => {
              const Icon = item.icon;
              const active = activeView === item.key;
              return (
                <button key={item.key} type="button" onClick={() => setView(item.key)} className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-[11px] font-black transition md:text-xs ${active ? 'border-brand-600 bg-brand-600 text-white shadow-lg dark:border-teal-400 dark:bg-teal-400 dark:text-black' : 'border-slate-200 bg-white text-slate-600 hover:border-brand-600 dark:border-forest-500 dark:bg-forest-900 dark:text-emerald-50'}`}>
                  <Icon className="h-3.5 w-3.5" /> {label(item.en, item.bm)}
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-3 py-5 md:px-6 md:py-7">
        {!data ? (
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => <div key={index} className="card h-44 animate-pulse bg-slate-200 dark:bg-forest-800" />)}
          </div>
        ) : (
          <>
            {activeView === 'visitor' && (
              <VisitorPanel
                data={data}
                lang={lang}
                onBook={(facility) => setModal({ type: 'booking', facility })}
                onSos={() => setModal({ type: 'sos-confirm' })}
                onStamp={stampCheckpoint}
                onTicket={() => setModal({ type: 'ticket' })}
                onExplore={() => setView('trails')}
                onLinkFamily={openFamily}
                onReportWildlife={(zone) => {
                  setWildlifeNote('');
                  setModal({ type: 'wildlife', zone });
                }}
                familyCount={family.members.length}
              />
            )}
            {activeView === 'trails' && (
              <TrailsPanel
                lang={lang}
                bookmarks={hikeLog.bookmarks}
                onToggleBookmark={hikeLog.toggleBookmark}
                onStart={startTrail}
                notify={(en, bm) => toast(en, bm)}
              />
            )}
            {activeView === 'hike' && (
              <HikeTrackerPanel
                lang={lang}
                trail={selectedTrail}
                onSaved={saveHike}
                onExplore={() => setView('trails')}
                onSos={() => setModal({ type: 'sos-confirm' })}
              />
            )}
            {activeView === 'mytrails' && <HikeStatsPanel lang={lang} hikes={hikeLog.hikes} onRecord={() => setView('hike')} />}
            {activeView === 'ranger' && <RangerPanel data={data} lang={lang} onToggleTask={toggleTask} onCycleFacility={cycleFacility} onSync={syncQueue} />}
            {activeView === 'command' && <CommandPanel data={data} lang={lang} onDetail={(message) => setModal({ type: 'detail', message })} />}
            {activeView === 'admin' && <AdminPanel data={data} lang={lang} request={api} notify={toast} onDetail={(message) => setModal({ type: 'detail', message })} />}
            {activeView === 'api' && <ApiPanel lang={lang} onDetail={(message) => setModal({ type: 'detail', message })} />}
            {activeView === 'sla' && <SlaPanel data={data} lang={lang} request={api} notify={toast} onDetail={(message) => setModal({ type: 'detail', message })} />}
            {activeView === 'budget' && <BudgetPanel lang={lang} />}
          </>
        )}
      </main>

      <footer className="mx-auto max-w-7xl border-t border-slate-200 px-6 py-8 text-[10px] font-bold leading-relaxed text-slate-500 dark:border-forest-500 dark:text-emerald-100/60">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span>SMART GUNUNG LAMBAK PILOT • Responsive web + installable mobile PWA • Next.js route handlers • PostgreSQL/Drizzle schema • IoT, QR/NFC, AI forecasting, PDPA-ready audit logs • Family loop 4.2km • North 510m • South 470m</span>
          <button type="button" onClick={() => setModal({ type: 'consent' })} className="inline-flex items-center gap-1 font-black text-brand-600 hover:underline dark:text-teal-300">
            <FileText className="h-3 w-3" /> {label('Privacy / PDPA', 'Privasi / PDPA')}
          </button>
        </div>
      </footer>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-2 py-2 shadow-2xl backdrop-blur dark:border-forest-500 dark:bg-forest-800/95 lg:hidden">
        <div className="scrollbar-none flex gap-1 overflow-x-auto">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.key;
            return (
              <button key={item.key} type="button" onClick={() => setView(item.key)} className={`flex min-w-16 shrink-0 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[9px] font-black ${active ? 'bg-brand-600 text-white' : 'text-slate-600 dark:text-emerald-50'}`}>
                <Icon className="h-4 w-4" />{label(item.en, item.bm)}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="fixed right-3 top-24 z-[60] w-[calc(100%-1.5rem)] max-w-sm space-y-2">
        {toasts.map((item) => (
          <div key={item.id} className="toast card flex items-start gap-2 p-3 shadow-2xl">
            <span className="mt-1 h-2 w-2 shrink-0 animate-pulse rounded-full bg-brand-600" />
            <div className="flex-1 text-xs font-black">{label(item.en, item.bm)}</div>
            <button type="button" onClick={() => setToasts((current) => current.filter((toastItem) => toastItem.id !== item.id))}><X className="h-4 w-4" /></button>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 z-[70] grid place-items-center p-4">
          <button type="button" aria-label="Close modal" className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="card relative max-h-[86vh] w-full max-w-lg overflow-auto bg-white p-5 dark:bg-forest-700">
            <button type="button" onClick={() => setModal(null)} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-slate-100 dark:bg-forest-900"><X className="h-4 w-4" /></button>

            {modal.type === 'detail' && (
              <>
                <h3 className="pr-8 text-sm font-black">{currentNav?.en} details</h3>
                <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm font-bold dark:bg-forest-900">{modal.message}</div>
                <div className="mt-3 rounded-xl bg-blue-50 p-3 text-[11px] font-bold text-blue-900 dark:bg-blue-950/30 dark:text-teal-200">Trend, confidence interval, SLA history and CSV export are available through the enterprise reporting API.</div>
              </>
            )}

            {modal.type === 'queued' && (
              <div className="text-center">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-amber-100 text-3xl"><CloudOff className="h-9 w-9 text-amber-700" /></div>
                <h3 className="mt-3 text-sm font-black">Saved offline</h3>
                <p className="mt-2 text-xs font-bold text-slate-500">{modal.message}</p>
                <button type="button" onClick={() => setModal(null)} className="btn btn-primary mt-4 w-full">OK</button>
              </div>
            )}

            {modal.type === 'family' && (
              <>
                <h3 className="pr-8 text-sm font-black">
                  {modal.relation === 'child' ? label('Link a child (50 m safe zone)', 'Paut kanak-kanak (zon selamat 50 m)') : modal.relation === 'elderly' ? label('Link an elderly family member', 'Paut ahli warga emas') : label('Link a family member', 'Paut ahli keluarga')}
                </h3>
                <div className="mt-4 space-y-3">
                  <label className="block text-xs font-black">{label('Name', 'Nama')}
                    <input value={familyName} onChange={(event) => setFamilyName(event.target.value)} placeholder={label('e.g. Aisyah', 'cth. Aisyah')} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-forest-500 dark:bg-forest-900" />
                  </label>
                  <label className="block text-xs font-black">{label('Age (optional)', 'Umur (pilihan)')}
                    <input type="number" min="0" max="120" value={familyAge} onChange={(event) => setFamilyAge(event.target.value === '' ? '' : Number(event.target.value))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-forest-500 dark:bg-forest-900" />
                  </label>
                  <button type="button" onClick={confirmAddFamily} className="btn btn-primary w-full"><Baby className="h-4 w-4" />{label('Enable 50 m safe-zone alert', 'Aktif amaran zon selamat 50 m')}</button>

                  {family.members.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black">{label('Linked devices', 'Peranti dipaut')} ({family.members.length})</span>
                        <button type="button" onClick={checkSafeZone} className="btn btn-soft px-2 py-1 text-[11px]">{label('Run safety check', 'Buat semakan keselamatan')}</button>
                      </div>
                      {family.members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-[11px] font-bold dark:bg-forest-900">
                          <span>{member.name} • {member.age ?? '—'}y • {member.battery}%</span>
                          <span className="flex items-center gap-2">
                            <Pill tone={member.status === 'in_zone' ? 'green' : member.status === 'near' ? 'amber' : 'red'}>{member.distanceM} m</Pill>
                            <button type="button" onClick={() => family.removeMember(member.id)} aria-label="Unlink"><X className="h-3.5 w-3.5" /></button>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] font-bold text-slate-400">{label('Distance is simulated in the pilot; production reads paired device GPS with permission.', 'Jarak adalah simulasi dalam perintis; pengeluaran membaca GPS peranti dipaut dengan kebenaran.')}</p>
                </div>
              </>
            )}

            {modal.type === 'wildlife' && (
              <>
                <div className="flex items-center gap-2 pr-8">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-100 text-amber-700"><Bird className="h-5 w-5" /></div>
                  <h3 className="text-sm font-black">{label(modal.zone.en, modal.zone.bm)}</h3>
                </div>
                <p className="mt-3 text-xs font-bold text-slate-500">{label('Report a macaque/monkey sighting to rangers. Your GPS location is attached and the command centre is updated.', 'Laporkan nampak kera/monyet kepada renjer. Lokasi GPS anda dilampirkan dan pusat kawalan dikemas kini.')}</p>
                <label className="mt-3 block text-xs font-black">{label('Note (optional)', 'Nota (pilihan)')}
                  <textarea value={wildlifeNote} onChange={(event) => setWildlifeNote(event.target.value)} rows={3} placeholder={label('e.g. group near bin, with food', 'cth. kumpulan berhampiran tong, dengan makanan')} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-forest-500 dark:bg-forest-900" />
                </label>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setModal(null)} className="btn btn-soft">{label('Cancel', 'Batal')}</button>
                  <button type="button" onClick={submitWildlifeReport} className="btn bg-amber-600 text-white">{label('Report to rangers', 'Lapor kepada renjer')}</button>
                </div>
              </>
            )}

            {modal.type === 'points' && (
              <>
                <h3 className="pr-8 text-sm font-black">{label('Lambak reward points', 'Mata ganjaran Lambak')}</h3>
                <div className="mt-3 rounded-2xl bg-brand-600 p-4 text-center text-white">
                  <div className="text-3xl font-black">{data?.points ?? 0}</div>
                  <div className="text-[11px] font-bold text-blue-100">{label('points earned this visit cycle', 'mata diperoleh kitaran lawatan ini')}</div>
                </div>
                <div className="mt-3 space-y-2 text-xs font-bold">
                  {[
                    ['+10', label('Confirmed facility booking', 'Tempahan fasiliti disahkan')],
                    ['+15', label('Trail passport checkpoint stamp', 'Cop checkpoint passport denai')],
                    ['+25', label('Recorded & saved a hike', 'Mendaki & simpan pendakian')],
                    ['+5', label('Ranger offline sync', 'Segerak luar talian renjer')]
                  ].map(([points, text]) => (
                    <div key={text} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 dark:bg-forest-900">
                      <span>{text}</span><Pill tone="green">{points}</Pill>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[10px] font-bold text-slate-400">{label('Points unlock badges and partner rewards; hike badges live in the My Hikes tab.', 'Mata membuka lencana dan ganjaran rakan kongsi; lencana pendakian ada di tab Denai Saya.')}</p>
              </>
            )}

            {modal.type === 'consent' && (
              <>
                <h3 className="pr-8 text-sm font-black">{label('Privacy & PDPA consent', 'Privasi & kebenaran PDPA')}</h3>
                <div className="mt-3 rounded-2xl bg-slate-50 p-4 text-xs font-bold leading-relaxed text-slate-600 dark:bg-forest-900 dark:text-emerald-50/80">
                  {label(
    'Smart Gunung Lambak collects only the data needed for safety and your visit: booking name/party size/date, optional GPS for safe-zone and SOS response, and device telemetry. Data is encrypted, retained per policy (90-day operational logs), and never sold. You may withdraw consent or request deletion via MPK.',
    'Smart Gunung Lambak hanya mengumpul data yang diperlukan untuk keselamatan dan lawatan anda: nama/ saiz kumpulan/ tarikh tempahan, GPS pilihan untuk zon selamat dan respons SOS, dan telemetri peranti. Data disulitkan, disimpan mengikut polisi (log operasi 90 hari), dan tidak dijual. Anda boleh tarik balik kebenaran atau minta penghapusan melalui MPK.'
  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={async () => { await consent.decide(true); setModal(null); toast('Consent recorded', 'Kebenaran direkodkan'); }} className="btn btn-primary flex-1">{label('I agree', 'Saya setuju')}</button>
                  {consent.decision && <button type="button" onClick={async () => { await consent.decide(false); setModal(null); }} className="btn btn-soft">{label('Withdraw', 'Tarik balik')}</button>}
                </div>
              </>
            )}

            {modal.type === 'login' && (
              <>
                <h3 className="text-sm font-black">Demo role switcher • RBAC + MFA</h3>
                <p className="mt-1 text-xs font-bold text-slate-500">No password is required in this pilot. Production should use MPK SSO with MFA and short-lived JWTs.</p>
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {(Object.keys(roleLabels) as AppRole[]).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={async () => {
                        await auth.login(role);
                        setView('visitor');
                        setModal(null);
                        toast('Role switched', 'Peranan ditukar');
                      }}
                      className={`rounded-2xl border p-3 text-left text-xs font-black transition ${auth.user.role === role ? 'border-brand-600 bg-blue-50 dark:bg-forest-800' : 'border-slate-200 hover:border-brand-600 dark:border-forest-500'}`}
                    >
                      {roleLabels[role]}
                      <span className="mt-1 block text-[10px] font-bold text-slate-500">{role === 'visitor' ? 'Visitor mobile experience' : role === 'auditor' ? 'Read-only reporting' : 'Role-based workspace'}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {modal.type === 'booking' && (
              <>
                <h3 className="text-sm font-black">{label('Book', 'Tempah')} {label(modal.facility.nameEn, modal.facility.nameBm)}</h3>
                <div className="mt-4 space-y-3">
                  <label className="block text-xs font-black">Full name / Nama penuh<input value={bookingName} onChange={(event) => setBookingName(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-forest-500 dark:bg-forest-900" /></label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block text-xs font-black">Party / Pax<input type="number" min="1" max="20" value={partySize} onChange={(event) => setPartySize(Number(event.target.value))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-forest-500 dark:bg-forest-900" /></label>
                    <label className="block text-xs font-black">Date / Tarikh<input type="date" value={bookingDate} onChange={(event) => setBookingDate(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-forest-500 dark:bg-forest-900" /></label>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 text-xs font-bold dark:bg-forest-900">RM{modal.facility.priceMyr} • QR+NFC • {modal.facility.smartLock ? 'Smart lock PIN generated' : 'Instant confirmation'}</div>
                  <button type="button" onClick={submitBooking} className="btn btn-primary w-full"><CalendarCheck className="h-4 w-4" />{label('Confirm booking', 'Sahkan tempahan')}</button>
                </div>
              </>
            )}

            {modal.type === 'booking-result' && (
              <div className="text-center">
                <QrVisual code={modal.booking.qrRef} />
                <h3 className="mt-3 text-sm font-black">Booking confirmed</h3>
                <p className="mt-1 text-xs font-bold text-slate-500">{modal.booking.guestName} • {modal.booking.partySize} pax • {modal.booking.checkInDate}</p>
                {modal.booking.smartLockPin && <Pill tone="green">Smart lock PIN: {modal.booking.smartLockPin}</Pill>}
              </div>
            )}

            {modal.type === 'ticket' && (
              <div className="text-center">
                <QrVisual code="LAMBAK-ENTRY" />
                <h3 className="mt-3 text-sm font-black">Family e-ticket</h3>
                <p className="mt-1 text-xs font-bold text-slate-500">Entry 07:12 • Car park bay 23 • Family 4 • Safe zone 50m ON • QR + NFC</p>
              </div>
            )}

            {modal.type === 'sos-confirm' && (
              <div className="text-center">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-red-100 text-3xl">🚨</div>
                <h3 className="mt-3 text-base font-black">Send emergency SOS?</h3>
                <p className="mt-2 text-xs font-bold text-slate-500">Photo, GPS, timestamp, family links, altitude and battery level will be sent to MPK Kluang, APM and Klinik Kesihatan.</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setModal(null)} className="btn btn-soft">Cancel</button>
                  <button type="button" onClick={sendSos} className="btn bg-red-600 text-white">Send SOS</button>
                </div>
              </div>
            )}

            {modal.type === 'sos-result' && (
              <div className="text-center">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-red-100 text-3xl">🚑</div>
                <h3 className="mt-3 text-base font-black">SOS dispatched • ETA {modal.alert.etaMinutes} min</h3>
                <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-left text-[11px] font-bold dark:bg-forest-900">
                  Location: {modal.alert.latitude}, {modal.alert.longitude}<br />
                  Family linked: {modal.alert.familyCount} • Battery: {modal.alert.battery}%<br />
                  Sent to MPK + APM + clinic • acknowledgement target under 60 seconds
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {consent.ready && !consent.decision && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="card w-full max-w-md bg-white p-6 dark:bg-forest-700">
            <div className="flex items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-600 text-white"><FileText className="h-5 w-5" /></div>
              <h3 className="text-base font-black">{label('Privacy notice — PDPA', 'Notis privasi — PDPA')}</h3>
            </div>
            <p className="mt-3 text-xs font-bold leading-relaxed text-slate-600 dark:text-emerald-50/80">
              {label(
                'To keep you safe, Smart Gunung Lambak uses your booking details and, only with permission, your GPS location for the 50 m family safe-zone and SOS dispatch. Readings and actions are encrypted, logged for 90 days for safety and audit, and never sold. You can withdraw at any time from the Privacy / PDPA link in the footer.',
                'Untuk keselamatan anda, Smart Gunung Lambak menggunakan butiran tempahan dan, dengan kebenaran, lokasi GPS anda untuk zon selamat keluarga 50 m dan penghantaran SOS. Bacaan dan tindakan disulitkan, direkodkan selama 90 hari untuk keselamatan dan audit, dan tidak dijual. Anda boleh tarik balik bila-bila masa melalui pautan Privasi / PDPA di kaki halaman.'
              )}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button type="button" onClick={async () => { await consent.decide(false); toast('Consent declined — safety GPS features limited', 'Kebenaran ditolak — ciri GPS terhad'); }} className="btn btn-soft">{label('Decline', 'Tolak')}</button>
              <button type="button" onClick={async () => { await consent.decide(true); toast('Consent recorded', 'Kebenaran direkodkan'); }} className="btn btn-primary">{label('I agree', 'Saya setuju')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QrVisual({ code }: { code: string }) {
  return (
    <div className="mx-auto grid h-40 w-40 place-items-center rounded-2xl border-2 border-brand-600 bg-white p-3 text-center font-mono text-xs font-black text-slate-950">
      <div>
        <div className="mx-auto mb-2 grid h-20 w-20 grid-cols-5 gap-0.5">
          {Array.from({ length: 25 }, (_, index) => <span key={index} className={[0, 1, 2, 5, 7, 10, 12, 14, 17, 19, 22, 23, 24, 6, 16, 18].includes(index) ? 'bg-slate-950' : 'bg-white'} />)}
        </div>
        {code}
      </div>
    </div>
  );
}
