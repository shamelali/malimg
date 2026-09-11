'use client';

import { Battery, CheckCircle2, Droplets, RefreshCcw, Trash2, WifiOff } from 'lucide-react';
import type { DashboardSnapshot, Language } from '@/lib/types';
import { Pill, ProgressBar, SectionTitle } from './ui';

const t = (lang: Language, en: string, bm: string) => (lang === 'BM' ? bm : en);

export function RangerPanel({
  data,
  lang,
  onToggleTask,
  onCycleFacility,
  onSync
}: {
  data: DashboardSnapshot;
  lang: Language;
  onToggleTask: (id: string, completed: boolean) => void;
  onCycleFacility: (id: string) => void;
  onSync: () => void;
}) {
  const facilities = data.facilities.filter((facility) => ['chalet', 'toilet', 'waste_bin', 'pool'].includes(facility.type));

  return (
    <div className="space-y-5">
      <section className="card p-5">
        <SectionTitle
          title={t(lang, 'Ranger & facility operations', 'Operasi renjer & fasiliti')}
          subtitle={t(lang, 'Tablet-first task board with offline queue', 'Papan tugas mesra tablet dengan barisan luar talian')}
          action={<Pill tone="amber"><WifiOff className="h-3 w-3" /> {data.offlineQueue} queued</Pill>}
        />
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-2">
            {data.tasks.map((task) => (
              <label key={task.id} className={`flex gap-3 rounded-2xl border p-3 transition ${task.status === 'completed' ? 'border-slate-200 bg-slate-50 dark:border-forest-500 dark:bg-forest-800' : 'border-slate-200 bg-white hover:border-brand-600 dark:border-forest-500 dark:bg-forest-800'}`}>
                <input
                  type="checkbox"
                  checked={task.status === 'completed'}
                  onChange={(event) => onToggleTask(task.id, event.target.checked)}
                  className="mt-1 h-4 w-4 accent-brand-600"
                />
                <div className="min-w-0 flex-1">
                  <div className={`text-xs font-bold ${task.status === 'completed' ? 'text-slate-400 line-through' : ''}`}>{lang === 'BM' ? task.titleBm : task.titleEn}</div>
                  <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] font-bold text-slate-500 dark:text-emerald-100/70">
                    <span>{task.assignee}</span>
                    <span>•</span>
                    <span>Due {task.dueAt}</span>
                    <span>•</span>
                    <Pill tone={task.priority === 'P1' ? 'red' : task.priority === 'P2' ? 'amber' : 'blue'}>{task.priority}</Pill>
                  </div>
                </div>
              </label>
            ))}
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {facilities.map((facility) => (
                <button key={facility.id} type="button" onClick={() => onCycleFacility(facility.id)} className="rounded-2xl border-2 p-3 text-left transition hover:-translate-y-0.5"
                  style={{ borderColor: facility.status === 'open' ? '#86efac' : facility.status === 'cleaning' ? '#fde68a' : '#fecaca' }}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black">{facility.code}</span>
                    {facility.status === 'open' ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : facility.status === 'cleaning' ? <Droplets className="h-4 w-4 text-amber-600" /> : <Trash2 className="h-4 w-4 text-red-600" />}
                  </div>
                  <div className="mt-1 text-[11px] font-bold">{lang === 'BM' ? facility.nameBm : facility.nameEn}</div>
                  <div className="mt-1 text-[10px] font-black uppercase tracking-wide text-slate-500 dark:text-emerald-100/70">{facility.status.replace('_', ' ')}</div>
                  {facility.capacity > 0 && facility.type !== 'chalet' ? <div className="mt-2"><ProgressBar value={(facility.occupied / facility.capacity) * 100} tone={facility.occupied / facility.capacity > 0.8 ? 'red' : 'amber'} /></div> : null}
                </button>
              ))}
            </div>
            <button type="button" onClick={onSync} className="btn btn-primary w-full">
              <RefreshCcw className="h-4 w-4" /> {t(lang, `Sync ${data.offlineQueue} offline tasks`, `Segerakkan ${data.offlineQueue} tugasan luar talian`)}
            </button>
          </div>
        </div>
      </section>

      <section className="card p-5">
        <SectionTitle title={t(lang, 'IoT device health', 'Kesihatan peranti IoT')} subtitle="MQTT • 4G • edge alerts" />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {data.iot.map((device) => (
            <div key={device.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-forest-500 dark:bg-forest-800">
              <div className="flex items-start justify-between gap-2">
                <div className="text-xs font-black">{device.name}</div>
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${device.status === 'live' ? 'animate-pulse bg-green-500' : device.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'}`} />
              </div>
              <div className="mt-2 text-lg font-black text-brand-600 dark:text-teal-300">{device.value}</div>
              <div className="text-[10px] font-bold text-slate-500 dark:text-emerald-100/70">{device.metric}</div>
              {typeof device.battery === 'number' && (
                <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-emerald-100/70">
                  <Battery className="h-3.5 w-3.5" /> {device.battery}%
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
