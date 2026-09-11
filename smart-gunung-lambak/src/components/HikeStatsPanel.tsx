'use client';

import { useMemo } from 'react';
import { Award, Clock, Footprints, Mountain, Play, Route as RouteIcon, TrendingUp } from 'lucide-react';
import type { Language } from '@/lib/types';
import { formatClock, trailById } from '@/lib/trails';
import { getBadges, relativeWhen, weeklyKilometres } from '@/lib/hikeLog';
import type { HikeSession } from '@/lib/trails';

export function HikeStatsPanel({
  lang,
  hikes,
  onRecord
}: {
  lang: Language;
  hikes: HikeSession[];
  onRecord: () => void;
}) {
  const totals = useMemo(() => {
    const distance = hikes.reduce((sum, hike) => sum + hike.distanceKm, 0);
    const elevation = hikes.reduce((sum, hike) => sum + hike.elevationM, 0);
    const seconds = hikes.reduce((sum, hike) => sum + hike.durationSec, 0);
    return { count: hikes.length, distance, elevation, hours: seconds / 3600, seconds };
  }, [hikes]);

  const badges = useMemo(() => getBadges(hikes), [hikes]);
  const week = useMemo(() => weeklyKilometres(hikes), [hikes]);
  const maxKm = Math.max(2, ...week.map((day) => day.km));
  const recent = [...hikes].sort((a, b) => +new Date(b.startedAt) - +new Date(a.startedAt)).slice(0, 8);

  const cards = [
    { icon: Footprints, label: lang === 'BM' ? 'Jumlah pendakian' : 'Total hikes', value: String(totals.count) },
    { icon: RouteIcon, label: lang === 'BM' ? 'Jarak' : 'Distance', value: totals.distance.toFixed(1), suffix: ' km' },
    { icon: Mountain, label: lang === 'BM' ? 'Ketinggian' : 'Elevation', value: Math.round(totals.elevation).toLocaleString(), suffix: ' m' },
    { icon: Clock, label: lang === 'BM' ? 'Masa mendaki' : 'Time hiking', value: totals.hours.toFixed(1), suffix: ' h' }
  ];

  return (
    <div className="space-y-5">
      <section className="card flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-black"><Award className="h-5 w-5 text-brand-600 dark:text-teal-300" />{lang === 'BM' ? 'Statistik saya' : 'Your stats'}</h2>
          <p className="mt-0.5 text-xs font-bold text-slate-500">{lang === 'BM' ? 'Tersimpan pada peranti ini dan disegerak apabila dalam talian' : 'Stored on this device and synced when online'}</p>
        </div>
        <button type="button" onClick={onRecord} className="btn btn-primary text-sm"><Play className="h-4 w-4 fill-current" />{lang === 'BM' ? 'Rekod pendakian' : 'Record hike'}</button>
      </section>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="card relative overflow-hidden p-4">
              <div className="absolute -right-3 -top-3 h-14 w-14 rounded-full bg-lime-400/20" />
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-forest-900 dark:text-lime-300">
                <Icon className="h-4 w-4" />
              </div>
              <div className="mt-2 text-2xl font-black tabular-nums text-brand-600 dark:text-teal-300">
                {card.value}
                {card.suffix ? <span className="ml-0.5 text-sm">{card.suffix}</span> : null}
              </div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-emerald-100/70">{card.label}</div>
            </div>
          );
        })}
      </div>

      <section className="card p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-black"><TrendingUp className="h-4 w-4 text-brand-600 dark:text-teal-300" />{lang === 'BM' ? 'Minggu ini (km)' : 'This week (km)'}</h3>
        <div className="flex h-32 items-stretch justify-between gap-2">
          {week.map((day) => (
            <div key={day.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <span className="text-[10px] font-black text-brand-600 dark:text-teal-300">{day.km > 0 ? day.km.toFixed(1) : ''}</span>
              <div
                className={`w-7 rounded-t-md transition-all sm:w-9 ${day.today ? 'bg-gradient-to-t from-lime-500 to-lime-300' : 'bg-emerald-200 dark:bg-forest-500'}`}
                style={{ height: `${Math.max(4, (day.km / maxKm) * 100)}%` }}
                title={`${day.km.toFixed(1)} km`}
              />
              <span className={`text-[10px] font-bold ${day.today ? 'text-emerald-700 dark:text-lime-300' : 'text-slate-400'}`}>{day.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-5">
        <h3 className="mb-3 text-sm font-black">{lang === 'BM' ? 'Lencana diperoleh' : 'Badges earned'}</h3>
        <div className="scrollbar-none flex gap-3 overflow-x-auto pb-1">
          {badges.map((badge) => (
            <div key={badge.key} className={`w-24 shrink-0 rounded-2xl border border-slate-200 p-3 text-center dark:border-forest-500 ${badge.earned ? 'bg-white dark:bg-forest-800' : 'opacity-45 grayscale'}`}>
              <div className="text-3xl">{badge.earned ? badge.emoji : '🔒'}</div>
              <div className="mt-1 text-[10px] font-black leading-tight">{lang === 'BM' ? badge.nameBm : badge.nameEn}</div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[10px] font-bold text-slate-400">{badges.filter((badge) => badge.earned).length}/{badges.length} earned</p>
      </section>

      <section className="card p-5">
        <h3 className="mb-2 text-sm font-black">
          {lang === 'BM' ? 'Pendakian terkini' : 'Recent hikes'}
          <span className="ml-1 text-[11px] font-bold text-slate-400">· {recent.length}</span>
        </h3>
        {recent.length === 0 ? (
          <div className="py-8 text-center">
            <div className="text-3xl">🥾</div>
            <p className="mt-2 text-sm font-bold text-slate-500">{lang === 'BM' ? 'Belum ada pendakian lagi' : 'No hikes recorded yet'}</p>
            <button type="button" onClick={onRecord} className="btn btn-primary mt-3 text-sm">{lang === 'BM' ? 'Mula yang pertama' : 'Start your first'}</button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-forest-500">
            {recent.map((hike) => {
              const trail = trailById(hike.trailId);
              const name = lang === 'BM' ? (hike.trailNameBm || trail?.nameBm) : (hike.trailNameEn || trail?.nameEn);
              return (
                <div key={hike.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg" style={{ background: trail?.gradient ?? '#14532d' }}>
                      {trail?.emoji ?? '🥾'}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-black">{name}</div>
                      <div className="mt-0.5 text-[11px] font-semibold text-slate-500 dark:text-emerald-100/70">
                        {hike.distanceKm} km · {formatClock(hike.durationSec)} · +{hike.elevationM} m
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 text-right text-[11px] font-black text-emerald-700 dark:text-lime-300">
                    {relativeWhen(hike.startedAt, lang)}
                    <span className="mt-0.5 block text-[10px] font-semibold text-slate-400">{hike.source === 'gps' ? 'GPS' : (lang === 'BM' ? 'anggaran' : 'estimate')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
