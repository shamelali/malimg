'use client';

import { useState } from 'react';
import { Baby, Bird, CalendarCheck, Castle, Compass, PersonStanding, QrCode, ShieldCheck, ShowerHead, Tent, TriangleAlert, UtensilsCrossed, Waves } from 'lucide-react';
import type { FamilyRelation } from '@/lib/family';
import type { DashboardSnapshot, Facility, Language } from '@/lib/types';
import { Pill, ProgressBar } from './ui';

const t = (lang: Language, en: string, bm: string) => (lang === 'BM' ? bm : en);

const facilityIcon = {
  car_park: Castle,
  chalet: Castle,
  pool: Waves,
  bbq: UtensilsCrossed,
  camping: Tent,
  toilet: ShowerHead,
  waste_bin: TriangleAlert
};

export function VisitorPanel({
  data,
  lang,
  onBook,
  onSos,
  onStamp,
  onTicket,
  onExplore,
  onLinkFamily,
  onReportWildlife,
  familyCount
}: {
  data: DashboardSnapshot;
  lang: Language;
  onBook: (facility: Facility) => void;
  onSos: () => void;
  onStamp: (code: string) => void;
  onTicket: () => void;
  onExplore: () => void;
  onLinkFamily: (relation: FamilyRelation) => void;
  onReportWildlife: (zone: { code: 'A' | 'B' | 'C'; en: string; bm: string; risk: 'high' | 'medium' | 'low' }) => void;
  familyCount: number;
}) {
  const [safeZone, setSafeZone] = useState(true);
  const carPark = data.facilities.find((facility) => facility.type === 'car_park');
  const bookable = data.facilities.filter((facility) => ['chalet', 'pool', 'bbq', 'camping'].includes(facility.type));

  return (
    <div className="space-y-5">
      <section className="card overflow-hidden">
        <div className="bg-gradient-to-br from-brand-600 via-brand-600 to-teal-500 p-5 text-white">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-100">{t(lang, 'Visitor & family app', 'Aplikasi pelawat & keluarga')}</p>
              <h2 className="mt-1 text-2xl font-black">{t(lang, 'Welcome to Gunung Lambak', 'Selamat datang ke Gunung Lambak')}</h2>
              <p className="mt-1 text-sm text-blue-100">{t(lang, '4.2 km family loop • twin peaks • 405 m gain', 'Gelung keluarga 4.2 km • puncak kembar • 405 m kenaikan')}</p>
            </div>
            <Pill tone={safeZone ? 'green' : 'red'}>
              <ShieldCheck className="h-3.5 w-3.5" />
              Safe zone {safeZone ? '50m ON' : 'OFF'}
            </Pill>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
              <div className="text-xl font-black">{data.visitorsToday}</div>
              <div className="text-[10px] font-bold uppercase">{t(lang, 'Visitors', 'Pelawat')}</div>
            </div>
            <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
              <div className="text-xl font-black">{data.visitorsOnTrail}</div>
              <div className="text-[10px] font-bold uppercase">{t(lang, 'On trail', 'Di denai')}</div>
            </div>
            <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
              <div className="text-xl font-black">{data.points}</div>
              <div className="text-[10px] font-bold uppercase">{t(lang, 'Points', 'Mata')}</div>
            </div>
          </div>
        </div>
      </section>

      <button type="button" onClick={onExplore} className="card flex w-full items-center gap-3 bg-gradient-to-r from-forest-700 to-brand-600 p-4 text-left text-white transition hover:-translate-y-0.5">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/15">
          <Compass className="h-6 w-6 text-lime-300" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-black">{t(lang, 'Explore trails & record your hike', 'Terokai denai & rakam pendakian anda')}</div>
          <div className="mt-0.5 text-[11px] font-semibold text-emerald-100/90">{t(lang, '8 Johor trails • live tracker • badges & personal stats', '8 denai Johor • penjejak langsung • lencana & statistik peribadi')}</div>
        </div>
        <CalendarCheck className="h-5 w-5 shrink-0 text-lime-300" />
      </button>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-black">{t(lang, `Car park • ${carPark ? carPark.capacity - carPark.occupied : 0} free of ${carPark?.capacity}`, `Parkir • ${carPark ? carPark.capacity - carPark.occupied : 0} kosong daripada ${carPark?.capacity}`)}</h3>
            <Pill tone={carPark && carPark.occupied / carPark.capacity > 0.8 ? 'amber' : 'green'}>AI 97.4%</Pill>
          </div>
          <div className="grid grid-cols-8 gap-1 rounded-2xl bg-slate-100 p-2 dark:bg-forest-900 sm:grid-cols-10">
            {Array.from({ length: carPark?.capacity ?? 120 }, (_, index) => {
              const occupied = index < (carPark?.occupied ?? 87) && index % 5 !== 0;
              return (
                <button
                  key={index}
                  type="button"
                  aria-label={`Bay ${index + 1} ${occupied ? 'occupied' : 'free'}`}
                  className={`h-6 rounded border text-[8px] font-black ${
                    occupied
                      ? 'border-red-200 bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-100'
                      : 'border-green-200 bg-white text-green-700 hover:bg-green-100 dark:bg-forest-800 dark:text-green-300'
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" onClick={onTicket} className="btn btn-primary text-sm">
              <QrCode className="h-4 w-4" /> e-Ticket QR+NFC
            </button>
            <button type="button" onClick={() => setSafeZone((value) => !value)} className="btn btn-soft text-sm">
              <ShieldCheck className="h-4 w-4" /> {safeZone ? t(lang, 'Safe zone on', 'Zon selamat aktif') : t(lang, 'Safe zone off', 'Zon selamat mati')}
            </button>
          </div>
        </section>

        <section className="card p-5">
          <h3 className="mb-3 text-sm font-black">{t(lang, 'Facility booking', 'Tempahan fasiliti')}</h3>
          <div className="grid grid-cols-2 gap-2">
            {bookable.map((facility) => {
              const Icon = facilityIcon[facility.type];
              const pct = Math.round((facility.occupied / facility.capacity) * 100);
              return (
                <button key={facility.id} type="button" onClick={() => onBook(facility)} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md dark:border-forest-500 dark:bg-forest-800">
                  <div className="flex items-center justify-between gap-2">
                    <Icon className="h-4 w-4 text-brand-600 dark:text-teal-300" />
                    <span className="text-[10px] font-black text-slate-500 dark:text-emerald-100/70">RM{facility.priceMyr}</span>
                  </div>
                  <div className="mt-2 text-xs font-black">{lang === 'BM' ? facility.nameBm : facility.nameEn}</div>
                  <div className="mt-1 text-[10px] font-bold text-slate-500 dark:text-emerald-100/70">
                    {facility.occupied}/{facility.capacity} {t(lang, 'used', 'digunakan')}
                  </div>
                  <div className="mt-2"><ProgressBar value={pct} tone={pct > 80 ? 'amber' : 'brand'} /></div>
                </button>
              );
            })}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => onLinkFamily('child')} className="btn btn-soft text-xs"><Baby className="h-4 w-4" /> {t(lang, `Child link${familyCount ? ` (${familyCount})` : ''}`, `Pautan kanak-kanak${familyCount ? ` (${familyCount})` : ''}`)}</button>
            <button type="button" onClick={() => onLinkFamily('elderly')} className="btn btn-soft text-xs"><PersonStanding className="h-4 w-4" /> {t(lang, 'Elderly link', 'Pautan warga emas')}</button>
          </div>
        </section>
      </div>

      <section className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-black">{t(lang, 'Trail passport stamps', 'Cop passport denai')}</h3>
          <Pill tone="blue">4.2 km</Pill>
        </div>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
          {data.checkpoints.map((checkpoint) => (
            <button
              key={checkpoint.code}
              type="button"
              onClick={() => onStamp(checkpoint.code)}
              className={`min-w-28 shrink-0 rounded-2xl border p-3 text-center transition ${
                checkpoint.stamped
                  ? 'border-green-200 bg-green-50 dark:border-teal-400/30 dark:bg-forest-800'
                  : 'border-dashed border-slate-300 bg-slate-50 hover:border-brand-600 dark:border-forest-500 dark:bg-forest-800'
              }`}
            >
              <div className={`mx-auto grid h-10 w-10 place-items-center rounded-full ${checkpoint.stamped ? 'bg-green-600 text-white' : 'bg-brand-600 text-white'}`}>
                {checkpoint.stamped ? <CalendarCheck className="h-5 w-5" /> : <QrCode className="h-5 w-5" />}
              </div>
              <div className="mt-2 text-[11px] font-black">{checkpoint.name}</div>
              <div className="text-[9px] font-bold text-slate-500 dark:text-emerald-100/70">{checkpoint.altitude ? `${checkpoint.altitude}m` : checkpoint.code}</div>
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-3">
        {[
          { code: 'A' as const, en: 'Long-tailed macaque • Zone A high risk', bm: 'Kera ekor panjang • Zon A risiko tinggi', risk: 'high' as const, tone: 'red' as const, icon: Bird },
          { code: 'B' as const, en: 'Pig-tailed macaque • Zone B medium', bm: 'Beruk • Zon B sederhana', risk: 'medium' as const, tone: 'amber' as const, icon: Bird },
          { code: 'C' as const, en: 'Dusky leaf monkey • Zone C low', bm: 'Lotong cengkung • Zon C rendah', risk: 'low' as const, tone: 'green' as const, icon: Bird }
        ].map((zone) => {
          const Icon = zone.icon;
          return (
            <button
              key={zone.code}
              type="button"
              onClick={() => onReportWildlife({ code: zone.code, en: zone.en, bm: zone.bm, risk: zone.risk })}
              className={`card flex items-start gap-3 p-4 text-left transition hover:-translate-y-0.5 ${zone.tone === 'red' ? 'border-red-200 bg-red-50 dark:bg-red-950/30' : zone.tone === 'amber' ? 'border-amber-200 bg-amber-50 dark:bg-amber-950/20' : 'border-green-200 bg-green-50 dark:bg-emerald-950/20'}`}
              title={t(lang, 'Tap to report a sighting', 'Tekan untuk lapor nampak hidupan')}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <div className="text-xs font-black">{t(lang, zone.en, zone.bm)}</div>
                <div className="mt-1 text-[10px] font-bold opacity-70">{t(lang, 'ML prediction • tap to report sighting', 'Ramalan ML • tekan untuk lapor nampak')}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-center pb-4">
        <button type="button" onClick={onSos} className="sos-button grid h-28 w-28 place-items-center rounded-full border-4 border-white bg-red-600 text-center text-white shadow-2xl">
          <span className="text-xl font-black">SOS</span>
          <span className="text-[10px] font-bold">{t(lang, 'Hold / tap', 'Tekan')}</span>
        </button>
      </div>
    </div>
  );
}
