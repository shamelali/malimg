const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:3000';

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
    ...options
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(`${options.method ?? 'GET'} ${path} -> ${response.status}: ${text}`);
  }
  return body;
}

const checks = [];
function check(name, condition, detail = '') {
  checks.push({ name, ok: Boolean(condition), detail });
  if (!condition) throw new Error(`${name} failed ${detail}`);
}

const health = await request('/api/v1/health');
check('health endpoint', health.status === 'ok' && health.service === 'smart-gunung-lambak');

const dashboard = await request('/api/v1/dashboard');
check('dashboard aggregates', dashboard.visitorsToday > 0 && Array.isArray(dashboard.facilities) && dashboard.facilities.length >= 7);

const booking = await request('/api/v1/bookings', {
  method: 'POST',
  body: JSON.stringify({ facilityId: 'fac-bbq', guestName: 'Smoke test family', partySize: 3 })
});
check('booking creates QR reference', booking.booking?.qrRef?.startsWith('LAMBAK-'));

const forbiddenTask = await fetch(`${baseUrl}/api/v1/tasks`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ id: 'task-2', completed: true })
});
check('ranger mutations require a role session', forbiddenTask.status === 403);

const sessionResponse = await fetch(`${baseUrl}/api/v1/session`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ role: 'park_manager' })
});
const sessionCookie = sessionResponse.headers.get('set-cookie')?.split(';')[0];
check('role session is issued', sessionResponse.ok && Boolean(sessionCookie));

const task = await request('/api/v1/tasks', {
  method: 'PATCH',
  headers: { Cookie: sessionCookie },
  body: JSON.stringify({ id: 'task-2', completed: true })
});
check('ranger task updates', task.task?.status === 'completed');

const checkpoint = await request('/api/v1/checkpoints/NORTH', { method: 'POST' });
check('trail checkpoint stamps', checkpoint.checkpoint?.code === 'NORTH' && checkpoint.pointsAwarded === 15);

const trails = await request('/api/v1/trails');
check('trail catalog published', Array.isArray(trails.trails) && trails.trails.length >= 8 && trails.trails.some((trail) => trail.id === 'lambak-family') && Array.isArray(trails.weather?.hourly));

const hike = await request('/api/v1/hikes', {
  method: 'POST',
  body: JSON.stringify({ trailId: 'lambak-family', trailNameEn: 'Gunung Lambak Family Loop', durationSec: 8280, distanceKm: 4.2, elevationM: 405, steps: 5670, caloriesKcal: 231, source: 'simulated' })
});
check('recorded hike saves and awards points', hike.hike?.trailId === 'lambak-family' && hike.pointsAwarded === 25 && hike.hike?.caloriesKcal === 231);

const sos = await request('/api/v1/sos', {
  method: 'POST',
  body: JSON.stringify({ name: 'Smoke tester', familyCount: 2, battery: 86 })
});
check('SOS dispatch returns ETA', sos.etaMinutes === 8 && Array.isArray(sos.dispatchedTo));

const sync = await request('/api/v1/sync', { method: 'POST', headers: { Cookie: sessionCookie } });
check('offline queue syncs', sync.synced === 50);

const openapi = await request('/api/v1/openapi');
check('OpenAPI contract published', openapi.openapi === '3.1.0' && Boolean(openapi.paths['/sos']));

const manifest = await request('/manifest.webmanifest');
check('PWA manifest installable', manifest.display === 'standalone' && manifest.icons.length >= 4);

const csvResponse = await fetch(`${baseUrl}/api/v1/reports/audit?format=csv`, {
  headers: { Cookie: sessionCookie }
});
const csv = await csvResponse.text();
check('audit CSV export', csvResponse.ok && csv.startsWith('timestamp,actor,action,ip,result') && csv.includes('\n'));

const parks = await request('/api/v1/parks');
check('multi-park catalog published', Array.isArray(parks.parks) && parks.parks.length === 4);

const forecast = await request('/api/v1/forecast');
check('capacity forecast computes staffing', typeof forecast.confidencePct === 'number' && typeof forecast.recommendedStaff === 'number');

const consent = await request('/api/v1/consent', {
  method: 'POST',
  body: JSON.stringify({ accepted: true, scope: 'pdpa-v1' })
});
check('PDPA consent recorded', consent.consent?.accepted === true);

const incident = await request('/api/v1/incidents', {
  method: 'POST',
  body: JSON.stringify({ type: 'wildlife', severity: 'P1', zone: 'Zone A', titleEn: 'Smoke macaque sighting' })
});
check('wildlife report creates incident', incident.incident?.zone === 'Zone A' && incident.incident?.status === 'open');

const iotIngest = await request('/api/v1/iot', {
  method: 'POST',
  headers: { Cookie: sessionCookie },
  body: JSON.stringify({ deviceId: 'iot-bin-a1', value: '62%', battery: 70, status: 'live' })
});
check('IoT telemetry ingest updates device', iotIngest.device?.id === 'iot-bin-a1' && iotIngest.device?.value === '62%');

const configBefore = await request('/api/v1/admin/config', { headers: { Cookie: sessionCookie } });
const configUpdate = await request('/api/v1/admin/config', {
  method: 'POST',
  headers: { Cookie: sessionCookie },
  body: JSON.stringify({ carparkCapacity: 130, chaletCapacity: 10, poolCapacity: 80, priceMinMyr: 5, priceMaxMyr: 120 })
});
check('admin config persists capacities', configUpdate.config?.carparkCapacity === 130 && configBefore.config?.carparkCapacity !== undefined);
// Restore original capacity so other assertions stay stable.
await request('/api/v1/admin/config', {
  method: 'POST',
  headers: { Cookie: sessionCookie },
  body: JSON.stringify({ carparkCapacity: 120, chaletCapacity: 10, poolCapacity: 80, priceMinMyr: 5, priceMaxMyr: 120 })
});

const unauthConfig = await fetch(`${baseUrl}/api/v1/admin/config`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ carparkCapacity: 999 }) });
check('admin config requires elevated role', unauthConfig.status === 403);

const apiKey = await request('/api/v1/admin/api-keys', {
  method: 'POST',
  headers: { Cookie: sessionCookie },
  body: JSON.stringify({ name: 'Smoke key' })
});
check('API key issued once with masked listing', typeof apiKey.key === 'string' && apiKey.key.startsWith('lambak_') && Array.isArray(apiKey.keys));

const restore = await request('/api/v1/ops/restore-test', { method: 'POST', headers: { Cookie: sessionCookie } });
check('DR restore drill passes and logs', restore.restoreTest?.result === 'passed' && typeof restore.restoreTest?.durationSec === 'number');

const webhook = await request('/api/v1/integrations/webhook-test', { method: 'POST', headers: { Cookie: sessionCookie } });
check('webhook latency test responds', webhook.ok === true && typeof webhook.latencyMs === 'number');

const homeResponse = await fetch(`${baseUrl}/`);
check(
  'security headers present',
  homeResponse.headers.get('x-content-type-options') === 'nosniff' &&
    homeResponse.headers.get('referrer-policy') === 'strict-origin-when-cross-origin' &&
    (homeResponse.headers.get('strict-transport-security') ?? '').includes('max-age')
);

console.log(`Smoke tests passed against ${baseUrl}`);
for (const item of checks) console.log(`✓ ${item.name}`);
