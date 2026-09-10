'use client';

import { useEffect, useState } from 'react';
import { Building2, CheckCircle2, Database, KeyRound, Landmark, Search, ShieldCheck, Trash2 } from 'lucide-react';
import type { DashboardSnapshot, Language } from '@/lib/types';
import { PARKS, parkStatusLabel, type ParkStatus } from '@/lib/parks';
import { Pill, SectionTitle } from './ui';

const t = (lang: Language, en: string, bm: string) => (lang === 'BM' ? bm : en);

type RequestFn = (path: string, init?: RequestInit) => Promise<Record<string, unknown>>;

const toneByStatus: Record<ParkStatus, 'green' | 'amber' | 'blue' | 'slate'> = {
  active: 'green',
  coming_soon: 'amber',
  phase2: 'blue',
  template: 'slate'
};

const roles = ['Super Admin MPK', 'Park Manager', 'Ranger', 'Chalet Operator', 'Finance', 'Auditor Read-only', 'Visitor'];

interface ApiKeyRow {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  createdBy: string;
  revoked: boolean;
}

interface ParkConfig {
  carparkCapacity: number;
  chaletCapacity: number;
  poolCapacity: number;
  priceMinMyr: number;
  priceMaxMyr: number;
  updatedAt: string | null;
  updatedBy: string | null;
}

export function AdminPanel({
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
  const [config, setConfig] = useState<ParkConfig>({
    carparkCapacity: 120,
    chaletCapacity: 10,
    poolCapacity: 80,
    priceMinMyr: 5,
    priceMaxMyr: 120,
    updatedAt: null,
    updatedBy: null
  });
  const [configSaving, setConfigSaving] = useState(false);
  const [query, setQuery] = useState('');
  const [keyName, setKeyName] = useState('');
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [consentCount, setConsentCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/v1/admin/config').then((r) => r.json()).then((payload) => {
      if (active && payload.config) setConfig(payload.config);
    }).catch(() => undefined);
    fetch('/api/v1/admin/api-keys').then((r) => r.json()).then((payload) => {
      if (active && Array.isArray(payload.keys)) setKeys(payload.keys);
    }).catch(() => undefined);
    fetch('/api/v1/consent').then((r) => (r.ok ? r.json() : null)).then((payload) => {
      if (active && payload?.consent) setConsentCount(payload.consent.accepted as number);
    }).catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  async function saveConfig() {
    setConfigSaving(true);
    try {
      const result = await request('/api/v1/admin/config', {
        method: 'POST',
        body: JSON.stringify(config)
      });
      if (result.config) setConfig(result.config as unknown as ParkConfig);
      notify('Configuration saved • immutable audit event created', 'Konfigurasi disimpan • acara audit dicipta');
    } catch {
      notify('Configuration save failed (admin role required)', 'Simpanan konfigurasi gagal (peranan admin diperlukan)');
    } finally {
      setConfigSaving(false);
    }
  }

  async function generateKey() {
    try {
      const result = await request('/api/v1/admin/api-keys', {
        method: 'POST',
        body: JSON.stringify({ name: keyName || 'Integration key' })
      });
      setNewKey(String(result.key ?? ''));
      if (Array.isArray(result.keys)) setKeys(result.keys as unknown as ApiKeyRow[]);
      setKeyName('');
      notify('API key generated • store it now', 'Kunci API dijana • simpan sekarang');
    } catch {
      notify('Key generation failed (admin role required)', 'Penjanaan kunci gagal (peranan admin diperlukan)');
    }
  }

  async function revokeKey(id: string) {
    try {
      const result = await request('/api/v1/admin/api-keys', {
        method: 'POST',
        body: JSON.stringify({ revokeId: id })
      });
      if (Array.isArray(result.keys)) setKeys(result.keys as unknown as ApiKeyRow[]);
      notify('API key revoked', 'Kunci API dibatalkan');
    } catch {
      notify('Revoke failed', 'Pembatalan gagal');
    }
  }

  const logs = data.auditLogs.filter((log) => `${log.actor} ${log.action} ${log.ip}`.toLowerCase().includes(query.toLowerCase()));
  const configFields: { key: keyof ParkConfig; label: string }[] = [
    { key: 'carparkCapacity', label: 'Car park bays' },
    { key: 'chaletCapacity', label: 'Chalets' },
    { key: 'poolCapacity', label: 'Pool capacity' },
    { key: 'priceMinMyr', label: 'Price min (RM)' },
    { key: 'priceMaxMyr', label: 'Price max (RM)' }
  ];

  return (
    <div className="space-y-5">
      <section className="card p-5">
        <SectionTitle title={t(lang, 'SaaS multi-park administration', 'Pentadbiran SaaS berbilang taman')} subtitle="MPK Kluang enterprise tenant • editable park configuration" action={<Pill tone="green"><CheckCircle2 className="h-3 w-3" /> Tenant active</Pill>} />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {PARKS.map((park) => (
            <button key={park.id} type="button" onClick={() => onDetail(`${park.nameEn} • ${parkStatusLabel(park.status, 'EN')} • MYR ${park.budgetMyr}`)} className={`rounded-2xl border-2 p-4 text-left transition hover:-translate-y-0.5 ${
              park.status === 'active' ? 'border-green-200 bg-green-50 dark:bg-emerald-950/20' : park.status === 'coming_soon' ? 'border-amber-200 bg-amber-50 dark:bg-amber-950/20' : 'border-blue-200 bg-blue-50 dark:bg-blue-950/20'
            }`}>
              <Building2 className="h-5 w-5 text-brand-600 dark:text-teal-300" />
              <div className="mt-2 text-xs font-black">{lang === 'BM' ? park.nameBm : park.nameEn}</div>
              <div className="mt-2 flex items-center justify-between text-[10px] font-black">
                <Pill tone={toneByStatus[park.status]}>{parkStatusLabel(park.status, lang)}</Pill>
                <span>{park.budgetMyr === 'Planning' || park.budgetMyr === 'Template' ? park.budgetMyr : `MYR ${park.budgetMyr}`}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card p-5">
          <SectionTitle title={t(lang, 'Facility configuration', 'Konfigurasi fasiliti')} subtitle={config.updatedAt ? `${t(lang, 'Last saved by', 'Disimpan oleh')} ${config.updatedBy}` : 'Changes are versioned and written through the admin API'} />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5 lg:grid-cols-2 xl:grid-cols-5">
            {configFields.map((field) => (
              <label key={field.key} className="text-[11px] font-black capitalize text-slate-600 dark:text-emerald-50/80">
                {field.label}
                <input
                  type="number"
                  value={config[field.key] as number}
                  onChange={(event) => setConfig((current) => ({ ...current, [field.key]: Number(event.target.value) }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 dark:border-forest-500 dark:bg-forest-900 dark:text-white"
                />
              </label>
            ))}
          </div>
          <button type="button" onClick={saveConfig} disabled={configSaving} className="btn btn-primary mt-4 w-full text-sm disabled:opacity-60">
            {configSaving ? t(lang, 'Saving…', 'Menyimpan…') : t(lang, 'Save configuration', 'Simpan konfigurasi')}
          </button>
          <div className="mt-4 rounded-2xl bg-blue-50 p-3 text-[11px] font-bold text-blue-900 dark:bg-blue-950/30 dark:text-teal-200">
            <Database className="mr-1 inline h-4 w-4" /> PostgreSQL + PostGIS schema, Drizzle migrations, JSONB tenant config, 30-day daily and 12-month monthly encrypted backups.
          </div>
        </section>

        <section className="card p-5">
          <SectionTitle title={t(lang, 'User management • RBAC • MFA', 'Pengurusan pengguna • RBAC • MFA')} subtitle="Least privilege access by park" action={<KeyRound className="h-4 w-4 text-brand-600" />} />
          <div className="grid grid-cols-2 gap-2">
            {roles.map((role) => (
              <button key={role} type="button" onClick={() => onDetail(`Role: ${role} • permissions preview`)} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left text-[11px] font-black hover:border-brand-600 dark:border-forest-500 dark:bg-forest-800">
                <ShieldCheck className="mb-1 h-4 w-4 text-teal-500" />
                {role}
              </button>
            ))}
          </div>
        </section>
      </div>

      <section className="card p-5">
        <SectionTitle title={t(lang, 'Integration API keys', 'Kunci API integrasi')} subtitle="Issue one key per system; every action is audited" />
        <div className="flex flex-wrap gap-2">
          <input
            value={keyName}
            onChange={(event) => setKeyName(event.target.value)}
            placeholder={t(lang, 'Key name e.g. IoT gateway', 'Nama kunci cth. gerbang IoT')}
            className="min-w-40 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold dark:border-forest-500 dark:bg-forest-900"
          />
          <button type="button" onClick={generateKey} className="btn btn-primary text-sm">{t(lang, 'Generate key', 'Jana kunci')}</button>
        </div>
        {newKey && (
          <div className="mt-3 rounded-2xl border-2 border-amber-300 bg-amber-50 p-3">
            <p className="text-[11px] font-black text-amber-900">⚠️ {t(lang, 'Copy it now — the full key is shown only once:', 'Salin sekarang — kunci penuh ditunjuk sekali sahaja:')}</p>
            <code className="mt-1 block break-all rounded-lg bg-white px-2 py-1.5 font-mono text-[11px] text-slate-900">{newKey}</code>
          </div>
        )}
        <div className="mt-3 space-y-1.5">
          {keys.length === 0 && <p className="text-[11px] font-bold text-slate-400">{t(lang, 'No keys issued in this session.', 'Tiada kunci dijana dalam sesi ini.')}</p>}
          {keys.map((key) => (
            <div key={key.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-[11px] font-bold dark:bg-forest-900">
              <span className={key.revoked ? 'text-slate-400 line-through' : ''}>{key.name} • <code className="font-mono">{key.prefix}…</code> • {key.createdBy}</span>
              {!key.revoked && (
                <button type="button" onClick={() => revokeKey(key.id)} className="inline-flex items-center gap-1 text-red-600 hover:underline"><Trash2 className="h-3.5 w-3.5" /> Revoke</button>
              )}
              {key.revoked && <Pill tone="red">Revoked</Pill>}
            </div>
          ))}
        </div>
      </section>

      <section className="card p-5">
        <SectionTitle title={t(lang, 'Immutable audit log', 'Log audit tidak boleh diubah')} subtitle="Searchable, CSV exportable, PDPA consent in BM/EN" action={
          <div className="flex flex-wrap items-center gap-2">
            <a href="/api/v1/reports/audit?format=csv" className="btn btn-soft px-3 py-2 text-xs">Export CSV</a>
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold">
              <Search className="h-4 w-4" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search logs" className="w-32 bg-transparent outline-none" />
            </label>
          </div>
        } />
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-forest-500">
          {logs.map((log) => (
            <button key={log.id} type="button" onClick={() => onDetail(`${log.actor}: ${log.action}`)} className="grid w-full gap-1 border-b border-slate-100 px-3 py-2 text-left text-[11px] last:border-0 hover:bg-slate-50 dark:border-forest-500 dark:hover:bg-forest-800 md:grid-cols-[110px_180px_1fr_120px_90px]">
              <span className="font-mono font-black">{log.timestamp}</span>
              <span className="font-bold">{log.actor}</span>
              <span>{log.action}</span>
              <span className="font-mono text-slate-500">{log.ip}</span>
              <Pill tone={log.result === 'success' ? 'green' : log.result === 'blocked' ? 'red' : 'amber'}>{log.result}</Pill>
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] font-black">
          <Landmark className="h-4 w-4 text-brand-600" />
          PDPA controls, 90-day operational logs, AES-256 backups and consent expiry workflow enabled
          {consentCount !== null && <Pill tone="green">{consentCount} consent recorded</Pill>}
        </div>
      </section>
    </div>
  );
}
