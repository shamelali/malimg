'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Banknote, BrainCircuit, Car, Gauge, Leaf, ShieldCheck, Toilet, Users } from 'lucide-react';
import type { DashboardSnapshot, Language } from '@/lib/types';
import { DashboardCharts } from './DashboardCharts';
import { TwinMap, type MapLayers } from './TwinMap';
import { Pill, ProgressBar, SectionTitle, StatCard } from './ui';

const t = (lang: Language, en: string, bm: string) => (lang === 'BM' ? bm : en);

interface Forecast {
  expectedCarParkFull: string | null;
  confidencePct: number;
  recommendedStaff: number;
  dynamicPricingRecommended: boolean;
  hourlyArrival: number;
}

export function CommandPanel({ data, lang, onDetail }: { data: DashboardSnapshot; lang: Language; onDetail: (message: string) => void }) {
  const [layers, setLayers] = useState<MapLayers>({ safety: true, facilities: true, iot: true, wildlife: true, trails: true });
  const [forecast, setForecast] = useState<Forecast>({ expectedCarParkFull: '08:30', confidencePct: 92, recommendedStaff: 3, dynamicPricingRecommended: true, hourlyArrival: 81 });

  useEffect(() => {
    let active = true;
    fetch('/api/v1/forecast')
      .then((response) => response.json())
      .then((payload: Forecast) => {
        if (active && payload) setForecast(payload);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const carPct = Math.round((data.carPark.occupied / data.carPark.total) * 100);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label={t(lang, 'Visitors today', 'Pelawat hari ini')} value={data.visitorsToday} sub="Peak 7–9am • 68%" tone="blue" onClick={() => onDetail('Visitor breakdown and hourly flow chart')} />
        <StatCard label={t(lang, 'On trail', 'Di denai')} value={data.visitorsOnTrail} sub="78 family groups" tone="green" />
        <StatCard label={t(lang, 'Car park', 'Parkir')} value={`${data.carPark.occupied}/${data.carPark.total}`} sub={`${carPct}% full • AI ${data.carPark.accuracy}%`} tone={carPct > 80 ? 'amber' : 'teal'} />
        <StatCard label={t(lang, 'Health index', 'Indeks kesihatan')} value={data.healthIndex} sub="Weighted destination score" tone="teal" />
      </div>

      <TwinMap
        lang={lang}
        layers={layers}
        onToggleLayer={(key) => setLayers((current) => ({ ...current, [key]: !current[key] }))}
        onPin={onDetail}
      />

      <section className="card p-5">
        <SectionTitle
          title={t(lang, 'Live operations', 'Operasi langsung')}
          subtitle={t(lang, 'Safety, facility and environmental telemetry', 'Telemetri keselamatan, fasiliti dan alam sekitar')}
          action={<Pill tone="green"><span className="h-2 w-2 animate-pulse rounded-full bg-green-500" /> LIVE</Pill>}
        />
        <div className="grid gap-3 lg:grid-cols-3">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-300/20 dark:bg-red-950/20">
            <div className="flex items-center gap-2 text-xs font-black text-red-900 dark:text-red-200"><AlertTriangle className="h-4 w-4" /> {t(lang, 'Active incidents', 'Insiden aktif')}</div>
            <div className="mt-3 space-y-2">
              {data.incidents.map((incident) => (
                <button key={incident.id} type="button" onClick={() => onDetail(`${incident.titleEn} • ${incident.status}`)} className="w-full rounded-xl bg-white/75 p-2 text-left text-[11px] font-bold dark:bg-forest-900/70">
                  <div className="flex items-center justify-between">
                    <span>{lang === 'BM' ? incident.titleBm : incident.titleEn}</span>
                    <Pill tone={incident.severity === 'P0' ? 'red' : incident.severity === 'P1' ? 'amber' : 'blue'}>{incident.severity}</Pill>
                  </div>
                  <span className="text-slate-500 dark:text-emerald-100/70">{incident.zone} • {incident.status}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-teal-400/20 dark:bg-emerald-950/20">
            <div className="flex items-center gap-2 text-xs font-black text-emerald-900 dark:text-emerald-200"><Leaf className="h-4 w-4" /> ESG</div>
            <div className="mt-3 space-y-2">
              {data.esg.map((item) => (
                <button key={item.label} type="button" onClick={() => onDetail(`${item.label}: ${item.value} • ${item.target}`)} className="flex w-full items-center justify-between rounded-xl bg-white/75 px-3 py-2 text-[11px] font-bold dark:bg-forest-900/70">
                  <span>{item.label}</span><span>{item.value}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-teal-400/20 dark:bg-blue-950/20">
            <div className="flex items-center gap-2 text-xs font-black text-blue-900 dark:text-teal-200"><BrainCircuit className="h-4 w-4" /> {t(lang, 'AI forecast & revenue', 'Ramalan AI & hasil')}</div>
            <div className="mt-3 rounded-xl bg-white/80 p-3 text-[11px] font-bold dark:bg-forest-900/70">
              {t(
                lang,
                `Parking full by ${forecast.expectedCarParkFull ?? '—'} with ${forecast.confidencePct}% confidence. Recommend ${forecast.recommendedStaff} staff${forecast.dynamicPricingRecommended ? ' and dynamic pricing' : ''}.`,
                `Parkir penuh menjelang ${forecast.expectedCarParkFull ?? '—'} dengan keyakinan ${forecast.confidencePct}%. Cadangkan ${forecast.recommendedStaff} kakitangan${forecast.dynamicPricingRecommended ? ' dan harga dinamik' : ''}.`
              )}
              <div className="mt-2"><ProgressBar value={forecast.confidencePct} /></div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl bg-white/80 p-3 dark:bg-forest-900/70">
                <Banknote className="mx-auto h-4 w-4 text-brand-600" />
                <div className="mt-1 text-lg font-black">RM{data.revenueTodayMyr.toLocaleString()}</div>
                <div className="text-[9px] font-bold text-slate-500">today</div>
              </div>
              <div className="rounded-xl bg-white/80 p-3 dark:bg-forest-900/70">
                <Gauge className="mx-auto h-4 w-4 text-teal-500" />
                <div className="mt-1 text-lg font-black">{data.roiPct}%</div>
                <div className="text-[9px] font-bold text-slate-500">Year 1 ROI</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <DashboardCharts data={data} />

      <section className="grid gap-3 md:grid-cols-4">
        {[
          { icon: Users, label: 'Families on trail', value: '78 groups', detail: 'Safe zone radius 50m' },
          { icon: Car, label: 'Overflow forecast', value: forecast.expectedCarParkFull ?? '—', detail: 'ECONSAVE junction route ready' },
          { icon: Toilet, label: 'Toilet status', value: '1 cleaning', detail: 'Ammonia threshold 20ppm' },
          { icon: ShieldCheck, label: 'SOS SLA', value: '42s', detail: 'Target acknowledgement under 60s' }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.label} type="button" onClick={() => onDetail(`${item.label}: ${item.value} • ${item.detail}`)} className="card p-4 text-left transition hover:-translate-y-0.5">
              <Icon className="h-5 w-5 text-brand-600 dark:text-teal-300" />
              <div className="mt-2 text-[11px] font-bold text-slate-500">{item.label}</div>
              <div className="text-xl font-black">{item.value}</div>
              <div className="text-[10px] font-bold text-slate-500">{item.detail}</div>
            </button>
          );
        })}
      </section>
    </div>
  );
}
