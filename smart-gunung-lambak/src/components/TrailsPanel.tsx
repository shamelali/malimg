'use client';

import { useMemo, useState } from 'react';
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cloud,
  CloudRain,
  MapPin,
  Mountain,
  Play,
  Route as RouteIcon,
  Search,
  Star,
  StarHalf,
  Sun,
  TrendingUp,
  X
} from 'lucide-react';
import type { Language } from '@/lib/types';
import {
  difficultyLabel,
  HOURLY_FORECAST,
  trailLocation,
  trailName,
  TRAILS,
  WEATHER_STRIP,
  type Difficulty,
  type Trail,
  type WeatherCond
} from '@/lib/trails';
import { Pill } from './ui';

type SortKey = 'recommended' | 'distance' | 'difficulty';

const difficultyTone: Record<Difficulty, 'green' | 'amber' | 'red'> = {
  Easy: 'green',
  Moderate: 'amber',
  Hard: 'red'
};

function WeatherIcon({ cond, className }: { cond: WeatherCond; className?: string }) {
  if (cond === 'sun') return <Sun className={className} />;
  if (cond === 'cloud') return <Cloud className={className} />;
  return <CloudRain className={className} />;
}

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.4;
  return (
    <span className="inline-flex items-center gap-0.5 font-black text-amber-500">
      {Array.from({ length: 5 }, (_, index) => {
        if (index < full) return <Star key={index} className="h-3.5 w-3.5 fill-current" />;
        if (index === full && half) return <StarHalf key={index} className="h-3.5 w-3.5 fill-current" />;
        return <Star key={index} className="h-3.5 w-3.5" />;
      })}
      <span className="ml-1 text-xs text-slate-700 dark:text-emerald-50">{rating.toFixed(1)}</span>
    </span>
  );
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { en: 'Good morning, hiker 👋', bm: 'Selamat pagi, pendaki 👋' };
  if (hour < 18) return { en: 'Good afternoon, hiker 👋', bm: 'Selamat tengah hari, pendaki 👋' };
  return { en: 'Good evening, hiker 👋', bm: 'Selamat petang, pendaki 👋' };
}

export function TrailsPanel({
  lang,
  bookmarks,
  onToggleBookmark,
  onStart,
  notify
}: {
  lang: Language;
  bookmarks: string[];
  onToggleBookmark: (trailId: string) => void;
  onStart: (trail: Trail) => void;
  notify: (en: string, bm: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState<'All' | Difficulty>('All');
  const [sort, setSort] = useState<SortKey>('recommended');
  const [selected, setSelected] = useState<Trail | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = TRAILS.filter((trail) => {
      const matchesDifficulty = difficulty === 'All' || trail.difficulty === difficulty;
      const haystack = `${trail.nameEn} ${trail.nameBm} ${trail.locEn} ${trail.locBm}`.toLowerCase();
      return matchesDifficulty && (!q || haystack.includes(q));
    });
    if (sort === 'distance') list = [...list].sort((a, b) => a.distanceKm - b.distanceKm);
    else if (sort === 'difficulty') {
      const order: Record<Difficulty, number> = { Easy: 0, Moderate: 1, Hard: 2 };
      list = [...list].sort((a, b) => order[a.difficulty] - order[b.difficulty]);
    } else {
      list = [...list].sort((a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating);
    }
    return list;
  }, [query, difficulty, sort]);

  const featured = filtered.filter((trail) => trail.featured);
  const chips: ('All' | Difficulty)[] = ['All', 'Easy', 'Moderate', 'Hard'];

  return (
    <div className="space-y-5">
      <section className="card overflow-hidden">
        <div className="bg-gradient-to-br from-forest-700 via-forest-800 to-brand-600 p-5 text-white">
          <p className="text-xs font-bold text-emerald-100/90">{lang === 'BM' ? greeting().bm : greeting().en}</p>
          <h2 className="mt-1 flex items-center gap-2 text-2xl font-black">
            <Mountain className="h-6 w-6 text-lime-300" /> {lang === 'BM' ? 'Cari Denai Anda' : 'Find Your Trail'}
          </h2>
          <p className="mt-1 text-sm text-emerald-100/90">{lang === 'BM' ? 'Gunung Lambak & denai sekitar Johor' : 'Gunung Lambak & Johor-area trails'}</p>
        </div>
      </section>

      <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
        {WEATHER_STRIP.map((point) => (
          <div key={point.day} className="card flex w-16 shrink-0 flex-col items-center gap-1 px-2 py-2.5">
            <span className="text-[10px] font-bold text-slate-500 dark:text-emerald-100/70">{point.day}</span>
            <WeatherIcon cond={point.cond} className={`h-5 w-5 ${point.cond === 'sun' ? 'text-amber-500' : point.cond === 'cloud' ? 'text-slate-400' : 'text-sky-500'}`} />
            <span className="text-sm font-black">{point.tempC}°</span>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={lang === 'BM' ? 'Cari denai, lokasi...' : 'Search trails, locations...'}
          className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-9 text-sm font-bold outline-none focus:border-brand-600 dark:border-forest-500 dark:bg-forest-800"
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} aria-label="Clear" className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full bg-slate-100 text-slate-500 dark:bg-forest-900">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setDifficulty(chip)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-black transition ${difficulty === chip ? 'border-brand-600 bg-brand-600 text-white dark:border-teal-400 dark:bg-teal-400 dark:text-black' : 'border-slate-200 bg-white text-slate-600 dark:border-forest-500 dark:bg-forest-800 dark:text-emerald-50'}`}
            >
              {chip === 'All' ? (lang === 'BM' ? 'Semua' : 'All') : difficultyLabel(chip, lang)}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value as SortKey)}
          className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold dark:border-forest-500 dark:bg-forest-800"
        >
          <option value="recommended">{lang === 'BM' ? 'Disyorkan' : 'Recommended'}</option>
          <option value="distance">{lang === 'BM' ? 'Jarak' : 'Distance'}</option>
          <option value="difficulty">{lang === 'BM' ? 'Kesukaran' : 'Difficulty'}</option>
        </select>
      </div>

      {featured.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-black">
            {lang === 'BM' ? 'Denai pilihan' : 'Featured trails'} <span className="ml-1 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] text-white">{featured.length}</span>
          </h3>
          <div className="scrollbar-none -mx-1 flex gap-3 overflow-x-auto p-1 pb-2">
            {featured.map((trail) => (
              <button
                key={trail.id}
                type="button"
                onClick={() => setSelected(trail)}
                className="relative h-44 w-60 shrink-0 overflow-hidden rounded-3xl text-left shadow-lg"
                style={{ background: trail.gradient }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute left-3 top-3"><Pill tone={difficultyTone[trail.difficulty]}>{difficultyLabel(trail.difficulty, lang)}</Pill></div>
                <div className="absolute right-3 top-3 text-3xl drop-shadow">{trail.emoji}</div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="text-base font-black drop-shadow">{trailName(trail, lang)}</div>
                  <div className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-white/85">
                    <RouteIcon className="h-3 w-3" /> {trail.distanceKm} km · +{trail.elevationM} m
                  </div>
                  <div className="mt-1"><Stars rating={trail.rating} /></div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <section>
        <h3 className="mb-2 text-sm font-black">
          {lang === 'BM' ? 'Semua denai' : 'All trails'} <span className="ml-1 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] text-slate-700 dark:bg-forest-500">{filtered.length}</span>
        </h3>
        {filtered.length === 0 ? (
          <div className="card p-8 text-center text-sm font-bold text-slate-500">{lang === 'BM' ? 'Tiada denai sepadan 🔍' : 'No trails match your filters 🔍'}</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((trail) => (
              <button
                key={trail.id}
                type="button"
                onClick={() => setSelected(trail)}
                className="card flex items-center gap-3 p-3 text-left transition hover:-translate-y-0.5"
              >
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-2xl" style={{ background: trail.gradient }}>
                  <span>{trail.emoji}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-black">{trailName(trail, lang)}</div>
                  <div className="mt-0.5 flex items-center gap-1 truncate text-[11px] font-semibold text-slate-500 dark:text-emerald-100/70">
                    <MapPin className="h-3 w-3 shrink-0" /> <span className="truncate">{trailLocation(trail, lang)}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2 text-[11px] font-bold text-slate-600 dark:text-emerald-50/80">
                    <Pill tone={difficultyTone[trail.difficulty]}>{difficultyLabel(trail.difficulty, lang)}</Pill>
                    <span>{trail.distanceKm} km</span>
                    <span className="hidden sm:inline">+{trail.elevationM} m</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
              </button>
            ))}
          </div>
        )}
      </section>

      {selected && (
        <TrailDetail
          trail={selected}
          lang={lang}
          bookmarked={bookmarks.includes(selected.id)}
          onBookmark={() => {
            onToggleBookmark(selected.id);
            notify(bookmarks.includes(selected.id) ? 'Removed from saved' : 'Saved for later 🔖', bookmarks.includes(selected.id) ? 'Dibuang daripada simpanan' : 'Disimpan untuk kemudian 🔖');
          }}
          onClose={() => setSelected(null)}
          onStart={() => {
            setSelected(null);
            onStart(selected);
          }}
        />
      )}
    </div>
  );
}

function TrailDetail({
  trail,
  lang,
  bookmarked,
  onBookmark,
  onClose,
  onStart
}: {
  trail: Trail;
  lang: Language;
  bookmarked: boolean;
  onBookmark: () => void;
  onClose: () => void;
  onStart: () => void;
}) {
  const stats = [
    { value: `${trail.distanceKm} km`, label: lang === 'BM' ? 'Jarak' : 'Distance' },
    { value: `+${trail.elevationM} m`, label: lang === 'BM' ? 'Ketinggian' : 'Elevation' },
    { value: lang === 'BM' ? trail.estTimeBm : trail.estTimeEn, label: lang === 'BM' ? 'Anggaran masa' : 'Est. time' },
    { value: difficultyLabel(trail.difficulty, lang), label: lang === 'BM' ? 'Kesukaran' : 'Difficulty' }
  ];

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-[#f4f7fb] dark:bg-forest-900">
      <div className="relative h-60" style={{ background: trail.gradient }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/5 to-black/80" />
        <div className="absolute left-3 right-3 top-3 flex items-center justify-between">
          <button type="button" onClick={onClose} aria-label="Back" className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-forest-800 shadow-lg">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" onClick={onBookmark} aria-label="Save for later" className={`grid h-10 w-10 place-items-center rounded-full bg-white/90 shadow-lg ${bookmarked ? 'text-amber-500' : 'text-forest-800'}`}>
            <Bookmark className={`h-5 w-5 ${bookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
        <div className="absolute bottom-4 left-5 right-5 text-white">
          <Pill tone={difficultyTone[trail.difficulty]}>{difficultyLabel(trail.difficulty, lang)}</Pill>
          <h2 className="mt-2 text-2xl font-black drop-shadow-lg">{trailName(trail, lang)}</h2>
          <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-white/90"><MapPin className="h-3.5 w-3.5" />{trailLocation(trail, lang)}</p>
          <div className="mt-1"><Stars rating={trail.rating} /></div>
        </div>
        <div className="absolute -bottom-6 right-5 grid h-16 w-16 place-items-center rounded-3xl bg-white/15 text-4xl backdrop-blur">{trail.emoji}</div>
      </div>

      <div className="space-y-4 p-5 pb-16">
        <div className="grid grid-cols-4 gap-2">
          {stats.map((stat) => (
            <div key={stat.label} className="card p-2.5 text-center">
              <div className="text-sm font-black text-brand-600 dark:text-teal-300">{stat.value}</div>
              <div className="mt-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500 dark:text-emerald-100/70">{stat.label}</div>
            </div>
          ))}
        </div>

        <div>
          <h3 className="mb-1.5 flex items-center gap-2 text-sm font-black"><TrendingUp className="h-4 w-4 text-brand-600 dark:text-teal-300" />{lang === 'BM' ? 'Tentang denai ini' : 'About this trail'}</h3>
          <p className="text-[13px] leading-relaxed text-slate-700 dark:text-emerald-50/85">{lang === 'BM' ? trail.descBm : trail.descEn}</p>
        </div>

        <div>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-black"><Mountain className="h-4 w-4 text-brand-600 dark:text-teal-300" />{lang === 'BM' ? 'Apa yang dijangka' : 'What to expect'}</h3>
          <div className="flex flex-wrap gap-2">
            {(lang === 'BM' ? trail.tagsBm : trail.tagsEn).map((tag) => (
              <span key={tag} className="rounded-full bg-emerald-100 px-3 py-1.5 text-[11px] font-bold text-emerald-900 dark:bg-forest-500 dark:text-emerald-100">{tag}</span>
            ))}
            {trail.checkpoints.map((code) => (
              <span key={code} className="rounded-full bg-blue-100 px-3 py-1.5 text-[11px] font-black text-blue-900 dark:bg-blue-950/40 dark:text-teal-200">📍 {code}</span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-black"><Sun className="h-4 w-4 text-amber-500" />{lang === 'BM' ? 'Cuaca di denai' : 'Weather on trail'}</h3>
          <div className="rounded-2xl bg-gradient-to-br from-forest-800 to-forest-700 p-4 text-white">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <div className="text-xs font-semibold text-emerald-100/90">{trail.locEn.split(',')[0]} · {lang === 'BM' ? 'Sekarang' : 'Now'}</div>
                <div className="text-xs font-semibold text-emerald-100/80">{lang === 'BM' ? 'Sebahagian cerah · bayu ringan' : 'Partly sunny · light breeze'}</div>
              </div>
              <div className="text-3xl font-black">28°</div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {HOURLY_FORECAST.map((point) => (
                <div key={point.label} className="rounded-xl bg-white/10 py-2 text-center">
                  <div className="text-[10px] font-semibold text-emerald-100/80">{point.label}</div>
                  <WeatherIcon cond={point.cond} className={`mx-auto my-1 h-5 w-5 ${point.cond === 'sun' ? 'text-amber-400' : point.cond === 'cloud' ? 'text-slate-300' : 'text-sky-300'}`} />
                  <div className="text-sm font-bold">{point.tempC}°</div>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[9px] font-semibold text-emerald-100/60">{lang === 'BM' ? 'Suapan demo — pengeluaran menggunakan penyesuai MET Malaysia' : 'Demo feed — production uses the MET Malaysia adapter'}</p>
          </div>
        </div>

        <div>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-black"><RouteIcon className="h-4 w-4 text-brand-600 dark:text-teal-300" />{lang === 'BM' ? 'Peta laluan' : 'Route map'}</h3>
          <div className="map-grid relative h-44 overflow-hidden rounded-2xl border border-slate-200 dark:border-forest-500">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
              <path className="route-draw" d="M12 82 C 25 78, 28 64, 40 60 C 52 55, 55 42, 68 38 C 76 35, 80 26, 84 20" fill="none" stroke="#84cc16" strokeWidth={2.5} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            </svg>
            <div className="absolute bottom-3 left-3 flex flex-col items-center text-[10px] font-black text-forest-800 dark:text-emerald-200">
              <MapPin className="h-5 w-5 text-forest-700 dark:text-lime-300" />
              <span className="rounded bg-white px-1.5 py-0.5 shadow dark:bg-forest-800">{lang === 'BM' ? 'Mula' : 'Start'}</span>
            </div>
            <div className="absolute right-3 top-3 flex flex-col items-center text-[10px] font-black text-red-700">
              <MapPin className="h-5 w-5 text-red-600" />
              <span className="rounded bg-white px-1.5 py-0.5 shadow dark:bg-forest-800">{lang === 'BM' ? 'Puncak' : 'Summit'}</span>
            </div>
          </div>
        </div>

        <button type="button" onClick={onStart} className="btn btn-primary w-full py-4 text-base">
          <Play className="h-5 w-5 fill-current" /> {lang === 'BM' ? 'Mula mendaki' : 'Start hike'} — {trail.distanceKm} km
        </button>
        <p className="flex items-center justify-center gap-1 text-center text-[10px] font-bold text-slate-400">
          <Clock className="h-3 w-3" /> {lang === 'BM' ? 'Penjejak berfungsi luar talian; SOS sentiasa tersedia' : 'Tracker works offline; SOS is always available'}
        </p>
      </div>
    </div>
  );
}
