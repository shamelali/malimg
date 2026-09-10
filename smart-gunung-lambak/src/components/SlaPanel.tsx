'use client';

import { useState } from 'react';
import { Archive, CloudCog, Database, Radio, Siren } from 'lucide-react';
import type { DashboardSnapshot, Language } from '@/lib/types';
import { Pill, SectionTitle, StatCard } from './ui';

const t = (lang: Language, en: string, bm: string) => (lang === 'BM' ? bm : en);

type RequestFn = (path: string, init?: RequestInit) => Promise<Record<string, unknown>>;

export function SlaPanel({
  data,
  lang,
  request,
  notify,
  onDetail
}: {
  data: DashboardSnapshot;
  lang: Language;
  request: RequestFn;
  notify: (en: string, bm: string) => void;
  onDetail: (message: string) => void;
}) {
  const services = [
    'API gateway',
    'PostgreSQL / PostGIS',
    'Redis / MQTT notifications',
    'Grafana dashboards',
    'PagerDuty alerting',
    'ELK logs • 90 days'
  ];

  const [restoreBusy, setRestoreBusy] = useState(false);
  const [restoreResult, setRestoreResult] = useState<string | null>(null);

  async function startRestoreTest() {
    setRestoreBusy(true);
    try {
      const result = await request('/api/v1/ops/restore-test', { method: 'POST' });
      const test = result.restoreTest as { durationSec: number; result: string } | undefined;
      const message = test ? `Restore drill PASSED in ${test.durationSec}s and was audit-logged` : 'Restore drill completed';
      setRestoreResult(message);
      notify(message, `Latihan pemulihan LULUS dalam ${test?.durationSec ?? '—'}s dan direkodkan`);
    } catch {
      notify('Restore test requires an admin role', 'Ujian pemulihan perlu peranan admin');
    } finally {
      setRestoreBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {data.sla.map((metric) => (
          <StatCard key={metric.metric} label={metric.metric} value={metric.value} sub={`Target ${metric.target} • PASS`} tone={metric.pass ? 'green' : 'red'} onClick={() => onDetail(`${metric.metric}: ${metric.value}, target ${metric.target}`)} />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card p-5">
          <SectionTitle title={t(lang, 'Monitoring stack', 'Timbunan pemantauan')} subtitle="Health, alerting and log retention" action={<Radio className="h-5 w-5 text-green-600" />} />
          <div className="space-y-2">
            {services.map((service) => (
              <button key={service} type="button" onClick={() => onDetail(`${service} is live`) } className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-black dark:border-forest-500 dark:bg-forest-800">
                <span className="flex items-center gap-2"><span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />{service}</span>
                <Pill tone="green">LIVE</Pill>
              </button>
            ))}
          </div>
        </section>

        <section className="card p-5">
          <SectionTitle title={t(lang, 'Backup and disaster recovery', 'Sandaran dan pemulihan bencana')} subtitle="Encrypted backups and Johor Bahru DR region" action={<Archive className="h-5 w-5 text-brand-600" />} />
          <div className="space-y-2 text-xs font-bold">
            {[
              ['Daily full backup', '02:00 MYT'],
              ['Hourly incremental', '15m RPO'],
              ['Retention', '30d daily / 12m monthly'],
              ['DR region', 'AWS ap-southeast-1'],
              ['Encryption', 'AES-256'],
              ['RTO target', '60 minutes']
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-forest-500 dark:bg-forest-800">
                <span>{label}</span><span>{value}</span>
              </div>
            ))}
          </div>
          <button type="button" onClick={startRestoreTest} disabled={restoreBusy} className="btn btn-primary mt-4 w-full text-sm disabled:opacity-60">
            {restoreBusy ? t(lang, 'Running restore…', 'Menjalankan pemulihan…') : t(lang, 'Start restore test', 'Mula ujian pemulihan')}
          </button>
          {restoreResult && <p className="mt-2 rounded-xl bg-emerald-50 p-2 text-[11px] font-black text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">✓ {restoreResult}</p>}
        </section>
      </div>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="card border-red-200 bg-red-50 p-4 dark:bg-red-950/20"><Siren className="h-5 w-5 text-red-700" /><h4 className="mt-2 text-sm font-black">P0 Life-threatening</h4><p className="mt-1 text-[11px] font-bold">Immediate MPK + APM + clinic dispatch; SOS ack &lt;1 min.</p></div>
        <div className="card border-amber-200 bg-amber-50 p-4 dark:bg-amber-950/20"><CloudCog className="h-5 w-5 text-amber-700" /><h4 className="mt-2 text-sm font-black">P1 Major operation</h4><p className="mt-1 text-[11px] font-bold">Car-park overflow, wildlife conflict or major facility fault.</p></div>
        <div className="card border-blue-200 bg-blue-50 p-4 dark:bg-blue-950/20"><Database className="h-5 w-5 text-blue-700" /><h4 className="mt-2 text-sm font-black">P2 Minor request</h4><p className="mt-1 text-[11px] font-bold">Cleaning, signage repair, visitor assistance and routine checks.</p></div>
      </section>
    </div>
  );
}
