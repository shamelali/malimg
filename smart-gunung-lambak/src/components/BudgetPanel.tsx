'use client';

import type { Language } from '@/lib/types';
import { ProgressBar, SectionTitle } from './ui';

const t = (lang: Language, en: string, bm: string) => (lang === 'BM' ? bm : en);

const budget = [
  { en: 'Product UX', bm: 'Produk UX', pct: 8, amount: 'RM224k' },
  { en: 'Mobile iOS/Android + Web PWA', bm: 'Mudah alih iOS/Android + Web PWA', pct: 15, amount: 'RM420k' },
  { en: 'Backend PostGIS / TimescaleDB', bm: 'Backend PostGIS / TimescaleDB', pct: 14, amount: 'RM392k' },
  { en: 'GIS digital twin lite', bm: 'Kembar digital GIS ringan', pct: 10, amount: 'RM280k' },
  { en: 'Safety and facility IoT', bm: 'IoT keselamatan & fasiliti', pct: 15, amount: 'RM420k' },
  { en: 'AI / ML', bm: 'AI / ML', pct: 10, amount: 'RM280k' },
  { en: 'Cloud and security', bm: 'Awan & keselamatan', pct: 10, amount: 'RM280k' },
  { en: 'Integrations', bm: 'Integrasi', pct: 7, amount: 'RM196k' },
  { en: 'QR/NFC/IoT hardware', bm: 'Perkakasan QR/NFC/IoT', pct: 6, amount: 'RM168k' },
  { en: 'QA, UAT, pentest, PDPA', bm: 'QA, UAT, ujian penembusan, PDPA', pct: 4, amount: 'RM112k' },
  { en: 'Training', bm: 'Latihan', pct: 3, amount: 'RM84k' },
  { en: 'Contingency', bm: 'Kontingensi', pct: 8, amount: 'RM224k' }
];

const phases = [
  { phase: 'Month 1', title: 'Mobilisation and discovery', pct: 10 },
  { phase: 'Month 2–3', title: 'Architecture, UX and data model', pct: 15 },
  { phase: 'Month 4–6', title: 'Enterprise MVP and integrations', pct: 30 },
  { phase: 'Month 7–9', title: 'Safety IoT, AI and ranger workflows', pct: 20 },
  { phase: 'Month 10–11', title: 'Community marketplace and SaaS multi-park', pct: 15 },
  { phase: 'Month 12', title: 'Go-live, training and hypercare', pct: 10 }
];

export function BudgetPanel({ lang }: { lang: Language }) {
  return (
    <div className="space-y-5">
      <section className="card p-5">
        <SectionTitle title={t(lang, 'MYR 2.8M optimum pilot budget', 'Belanjawan perintis optimum MYR 2.8J')} subtitle="Family-grade 510 m twin peak • full 4G • existing facilities • no LoRa required" />
        <div className="grid gap-2 md:grid-cols-2">
          {budget.map((item) => (
            <div key={item.en} className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-forest-500 dark:bg-forest-800">
              <div className="flex items-center justify-between gap-3 text-[11px] font-black">
                <span>{t(lang, item.en, item.bm)}</span>
                <span className="shrink-0">{item.amount} • {item.pct}%</span>
              </div>
              <div className="mt-2"><ProgressBar value={item.pct * 4} /></div>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-5">
        <SectionTitle title="12-month delivery plan" subtitle="Pilot to enterprise go-live with multi-park SaaS expansion path" />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {phases.map((phase) => (
            <div key={phase.phase} className="rounded-2xl bg-slate-50 p-4 dark:bg-forest-800">
              <div className="text-[10px] font-black uppercase tracking-widest text-brand-600 dark:text-teal-300">{phase.phase}</div>
              <div className="mt-1 text-sm font-black">{phase.title}</div>
              <div className="mt-3"><ProgressBar value={phase.pct * 3} /></div>
              <div className="mt-1 text-[10px] font-bold text-slate-500">{phase.pct}% of delivery</div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-yellow-300 bg-yellow-50 p-5 text-sm dark:border-yellow-300/20 dark:bg-yellow-950/20">
        <b>Why MYR 2.8M fits Lambak: </b>
        the 4.2 km family loop is Grade 3/10 with full 4G, existing 120-bay parking, 10 chalets, 80-capacity pool, BBQ and toilets. It avoids the LoRa coverage and remote infrastructure needed at taller, harder Mount Ledang deployments (MYR 3.2–4.0M), while still delivering safety, IoT, AI, payments, GIS and PDPA-grade enterprise controls.
      </section>
    </div>
  );
}
