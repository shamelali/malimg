'use client';

import { useState } from 'react';
import { ArrowRight, KeyRound, PlugZap, Webhook } from 'lucide-react';
import type { Language } from '@/lib/types';
import { Pill, SectionTitle } from './ui';

const t = (lang: Language, en: string, bm: string) => (lang === 'BM' ? bm : en);

type Endpoint = { path: string; method: 'GET' | 'POST'; description: string; body?: unknown };

const endpoints: Endpoint[] = [
  { path: '/api/v1/health', method: 'GET', description: 'Service health and database mode' },
  { path: '/api/v1/openapi', method: 'GET', description: 'OpenAPI 3.1 machine-readable contract' },
  { path: '/api/v1/session', method: 'POST', description: 'Set demo RBAC session cookie', body: { role: 'park_manager' } },
  { path: '/api/v1/dashboard', method: 'GET', description: 'Operational dashboard aggregate' },
  { path: '/api/v1/facilities', method: 'GET', description: 'Car park, chalets, pool, BBQ, toilets and bins' },
  { path: '/api/v1/iot', method: 'GET', description: 'Live IoT devices and telemetry' },
  { path: '/api/v1/parks', method: 'GET', description: 'MPK multi-park catalog and status' },
  { path: '/api/v1/forecast', method: 'GET', description: 'Computed capacity forecast and staffing' },
  { path: '/api/v1/incidents', method: 'GET', description: 'Active incidents incl. public wildlife reports' },
  { path: '/api/v1/incidents', method: 'POST', description: 'Report a safety/wildlife incident with GPS', body: { type: 'wildlife', severity: 'P1', zone: 'Zone A', titleEn: 'Macaque sighting near bin', reportedBy: 'Visitor app' } },
  { path: '/api/v1/iot', method: 'POST', description: 'IoT edge telemetry ingest (ranger/device)', body: { deviceId: 'iot-bin-a1', value: '62%', battery: 70, status: 'live' } },
  { path: '/api/v1/admin/config', method: 'GET', description: 'Current facility configuration' },
  { path: '/api/v1/admin/config', method: 'POST', description: 'Persist capacities/price band (admin, audited)', body: { carparkCapacity: 120, chaletCapacity: 10, poolCapacity: 80, priceMinMyr: 5, priceMaxMyr: 120 } },
  { path: '/api/v1/tasks', method: 'GET', description: 'Ranger task list' },
  { path: '/api/v1/bookings', method: 'POST', description: 'Create QR+NFC booking and smart-lock PIN', body: { facilityId: 'fac-chalet', guestName: 'Demo family', partySize: 4, checkInDate: new Date().toISOString().slice(0, 10) } },
  { path: '/api/v1/sos', method: 'POST', description: 'Dispatch priority SOS to MPK, APM and clinic', body: { name: 'Demo visitor', familyCount: 4, battery: 78 } },
  { path: '/api/v1/sync', method: 'POST', description: 'Flush ranger offline queue' },
  { path: '/api/v1/checkpoints/NORTH', method: 'POST', description: 'Award trail passport QR stamp' },
  { path: '/api/v1/trails', method: 'GET', description: 'Bilingual trail catalog, difficulty and weather' },
  { path: '/api/v1/hikes', method: 'POST', description: 'Save a recorded hike and award points', body: { trailId: 'lambak-family', durationSec: 8280, distanceKm: 4.2, elevationM: 405, steps: 5670, caloriesKcal: 231, source: 'simulated' } },
  { path: '/api/v1/reports/audit?format=csv', method: 'GET', description: 'Export immutable-style audit log as CSV' }
];

const integrations = ['MPK counter adapter', 'FPX / DuitNow / Touch n Go', 'MET Malaysia weather', 'Hikvision camera AI', 'Ultrasonic waste bins', 'Ammonia toilet sensors', 'TTLock QR + PIN', 'Pool pH and headcount', 'WhatsApp gateway', 'Webhook SOS escalation'];

export function ApiPanel({ lang, onDetail }: { lang: Language; onDetail: (message: string) => void }) {
  const [active, setActive] = useState('/api/v1/health');
  const [response, setResponse] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  async function call(path: string, options?: RequestInit) {
    setActive(path);
    setLoading(true);
    try {
      const result = await fetch(path, options);
      const payload = await result.json().catch(() => ({ status: result.status }));
      setResponse(payload);
      return payload;
    } catch (error) {
      setResponse({ error: error instanceof Error ? error.message : 'Request failed' });
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function tryEndpoint(endpoint: Endpoint) {
    const payload = await call(endpoint.path, {
      method: endpoint.method,
      headers: endpoint.body ? { 'Content-Type': 'application/json' } : undefined,
      body: endpoint.body ? JSON.stringify(endpoint.body) : undefined
    });
    return payload;
  }

  async function generateKey() {
    const payload = await call('/api/v1/admin/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'API console key' })
    });
    if (payload?.key) onDetail(`API key generated (shown once): ${String(payload.key).slice(0, 14)}… — manage in Admin`);
    else onDetail('API key generation requires an admin role');
  }

  async function testWebhook() {
    const payload = await call('/api/v1/integrations/webhook-test', { method: 'POST' });
    onDetail(payload?.ok ? `Webhook test succeeded • ${payload.latencyMs} ms` : 'Webhook test requires an admin role');
  }

  return (
    <div className="space-y-5">
      <section className="card p-5">
        <SectionTitle
          title={t(lang, 'REST API • /api/v1', 'REST API • /api/v1')}
          subtitle="OpenAPI-style endpoints with live in-browser try-it"
          action={<div className="flex flex-wrap gap-2"><button type="button" onClick={() => window.open('/api/v1/openapi', '_blank', 'noopener')} className="btn btn-soft text-xs">OpenAPI</button><button type="button" onClick={generateKey} className="btn btn-primary text-xs"><KeyRound className="h-4 w-4" /> Generate key</button><button type="button" onClick={testWebhook} className="btn btn-teal text-xs"><Webhook className="h-4 w-4" /> Test</button></div>}
        />
        <div className="grid gap-2 md:grid-cols-2">
          {endpoints.map((endpoint) => (
            <div key={endpoint.path} className={`rounded-2xl border p-3 transition ${active === endpoint.path ? 'border-brand-600 bg-blue-50 dark:bg-forest-800' : 'border-slate-200 bg-white dark:border-forest-500 dark:bg-forest-800'}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Pill tone={endpoint.method === 'GET' ? 'green' : 'blue'}>{endpoint.method}</Pill>
                    <code className="text-xs font-black">{endpoint.path}</code>
                  </div>
                  <p className="mt-1 text-[11px] font-bold text-slate-500 dark:text-emerald-100/70">{endpoint.description}</p>
                </div>
                <button type="button" onClick={() => tryEndpoint(endpoint)} className="btn btn-soft px-3 py-1.5 text-[11px]">
                  Try <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-5">
        <SectionTitle title="Live response" subtitle="Real response from the Next.js route handlers running in this preview" />
        <div className="max-h-80 overflow-auto rounded-2xl bg-slate-950 p-4 text-[11px] leading-relaxed text-emerald-100">
          {loading ? 'Loading...' : <pre className="whitespace-pre-wrap">{JSON.stringify(response ?? { message: 'Select Try to execute an endpoint' }, null, 2)}</pre>}
        </div>
      </section>

      <section className="card p-5">
        <SectionTitle title={t(lang, 'Integrations', 'Integrasi')} subtitle="Government, payment, IoT and messaging adapters" action={<PlugZap className="h-5 w-5 text-teal-500" />} />
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-5">
          {integrations.map((integration) => (
            <button key={integration} type="button" onClick={() => onDetail(`${integration} • connection test queued`)} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left text-[11px] font-black hover:border-brand-600 dark:border-forest-500 dark:bg-forest-800">
              {integration}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
