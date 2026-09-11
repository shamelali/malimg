import type {
  Booking,
  DashboardSnapshot,
  Facility,
  Incident,
  IotDevice,
  RangerTask,
  SosAlert
} from './types';
import { trailById, type HikeSession, type HikeSource } from './trails';

export interface ParkConfig {
  carparkCapacity: number;
  chaletCapacity: number;
  poolCapacity: number;
  priceMinMyr: number;
  priceMaxMyr: number;
  updatedAt: string | null;
  updatedBy: string | null;
}

export interface IssuedApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  createdBy: string;
  revoked: boolean;
}

export interface ConsentRecord {
  id: string;
  scope: string;
  accepted: boolean;
  at: string;
}

export interface RestoreTest {
  lastTestAt: string | null;
  result: 'passed' | 'pending' | 'failed';
  durationSec: number | null;
  runBy: string | null;
}

const defaultConfig: ParkConfig = {
  carparkCapacity: 120,
  chaletCapacity: 10,
  poolCapacity: 80,
  priceMinMyr: 5,
  priceMaxMyr: 120,
  updatedAt: null,
  updatedBy: null
};

const now = new Date().toISOString();

const facilities: Facility[] = [
  {
    id: 'fac-carpark',
    type: 'car_park',
    nameEn: 'Base Car Park',
    nameBm: 'Parkir Pangkalan',
    code: 'CP-01',
    capacity: 120,
    occupied: 87,
    priceMyr: 3,
    status: 'open',
    iot: true
  },
  {
    id: 'fac-chalet',
    type: 'chalet',
    nameEn: 'Family Chalet',
    nameBm: 'Calet Keluarga',
    code: 'CH-01',
    capacity: 10,
    occupied: 6,
    priceMyr: 100,
    status: 'open',
    smartLock: true,
    iot: true
  },
  {
    id: 'fac-pool',
    type: 'pool',
    nameEn: 'Public Pool',
    nameBm: 'Kolam Awam',
    code: 'PL-01',
    capacity: 80,
    occupied: 45,
    priceMyr: 5,
    status: 'open',
    iot: true
  },
  {
    id: 'fac-bbq',
    type: 'bbq',
    nameEn: 'BBQ Bay',
    nameBm: 'Ruang BBQ',
    code: 'BQ-01',
    capacity: 6,
    occupied: 2,
    priceMyr: 30,
    status: 'open'
  },
  {
    id: 'fac-camping',
    type: 'camping',
    nameEn: 'Camping Ground',
    nameBm: 'Tapak Khemah',
    code: 'CG-01',
    capacity: 20,
    occupied: 12,
    priceMyr: 20,
    status: 'open'
  },
  {
    id: 'fac-toilet',
    type: 'toilet',
    nameEn: 'Base Toilets',
    nameBm: 'Tandas Pangkalan',
    code: 'TL-01',
    capacity: 4,
    occupied: 1,
    priceMyr: 0,
    status: 'cleaning',
    iot: true
  },
  {
    id: 'fac-bin',
    type: 'waste_bin',
    nameEn: 'Zone A Smart Bin',
    nameBm: 'Tong Pintar Zon A',
    code: 'BN-A1',
    capacity: 100,
    occupied: 90,
    priceMyr: 0,
    status: 'full',
    iot: true
  }
];

const tasks: RangerTask[] = [
  {
    id: 'task-1',
    titleEn: 'Inspect Zone A wildlife-proof bin after monkey sighting',
    titleBm: 'Periksa tong kalis hidupan liar Zon A selepas laporan monyet',
    category: 'Wildlife',
    priority: 'P1',
    status: 'in_progress',
    assignee: 'Ranger Hafiz',
    dueAt: '09:30'
  },
  {
    id: 'task-2',
    titleEn: 'Clean and sanitise base toilet block 1',
    titleBm: 'Bersih dan sanitasi blok tandas pangkalan 1',
    category: 'Cleanliness',
    priority: 'P2',
    status: 'open',
    assignee: 'Facility Team',
    dueAt: '12:30'
  },
  {
    id: 'task-3',
    titleEn: 'Check pool pH and filtration pressure',
    titleBm: 'Periksa pH kolam dan tekanan penapisan',
    category: 'Pool',
    priority: 'P2',
    status: 'completed',
    assignee: 'Operator',
    dueAt: '08:15'
  },
  {
    id: 'task-4',
    titleEn: 'Replace QR checkpoint sign at CP1 bridge',
    titleBm: 'Ganti papan tanda QR di jambatan CP1',
    category: 'Trail',
    priority: 'P3',
    status: 'open',
    assignee: 'Ranger Siti',
    dueAt: '14:00'
  },
  {
    id: 'task-5',
    titleEn: 'Confirm chalet 7 smart-lock battery',
    titleBm: 'Sahkan bateri kunci pintar calet 7',
    category: 'IoT',
    priority: 'P2',
    status: 'completed',
    assignee: 'Operator',
    dueAt: '07:45'
  }
];

const iot: IotDevice[] = [
  { id: 'iot-cam-entry', type: 'camera_ai', name: 'Entry Camera AI', status: 'live', metric: 'Detection accuracy', value: '97.4%', quality: 97 },
  { id: 'iot-cam-exit', type: 'camera_ai', name: 'Exit Camera AI', status: 'live', metric: 'Vehicles counted', value: '28 out', quality: 98 },
  { id: 'iot-bin-a1', type: 'waste_bin', name: 'Bin A1 Ultrasonic', status: 'warning', metric: 'Fill level', value: '90%', battery: 72, quality: 99 },
  { id: 'iot-bin-b2', type: 'waste_bin', name: 'Bin B2 Ultrasonic', status: 'live', metric: 'Fill level', value: '48%', battery: 84, quality: 99 },
  { id: 'iot-toilet-1', type: 'toilet', name: 'Toilet Ammonia Sensor', status: 'warning', metric: 'NH₃ / usage', value: '18 ppm', battery: 64, quality: 96 },
  { id: 'iot-lock-7', type: 'smart_lock', name: 'Chalet 7 TTLock', status: 'live', metric: 'Battery / QR+PIN', value: '88%', battery: 88, quality: 100 },
  { id: 'iot-pool', type: 'pool_sensor', name: 'Pool pH + Headcount', status: 'live', metric: 'pH / occupancy', value: '7.2 / 45', battery: 91, quality: 98 },
  { id: 'iot-gateway', type: 'gateway', name: '4G/MQTT Gateway', status: 'live', metric: 'Latency', value: '1.8s alert', quality: 99 }
];

const incidents: Incident[] = [
  {
    id: 'inc-monkey-a',
    type: 'wildlife',
    severity: 'P1',
    status: 'monitoring',
    titleEn: 'Long-tailed macaque activity near Zone A bin',
    titleBm: 'Aktiviti monyet ekor panjang berhampiran tong Zon A',
    zone: 'Zone A',
    latitude: 2.02509,
    longitude: 103.34437
  },
  {
    id: 'inc-bin',
    type: 'facility',
    severity: 'P2',
    status: 'acknowledged',
    titleEn: 'Smart bin above 80% threshold',
    titleBm: 'Tong pintar melebihi ambang 80%',
    zone: 'Base'
  }
];

const auditLogs = [
  { id: 'audit-1', timestamp: '09:41:08', actor: 'manager@mpk.gov.my', action: 'Updated car park threshold', ip: '10.2.4.18', result: 'success' as const },
  { id: 'audit-2', timestamp: '09:32:51', actor: 'ranger.hafiz', action: 'Acknowledged Zone A wildlife alert', ip: '10.2.4.74', result: 'success' as const },
  { id: 'audit-3', timestamp: '09:12:14', actor: 'visitor-4821', action: 'Generated family e-ticket', ip: '172.16.8.2', result: 'success' as const },
  { id: 'audit-4', timestamp: '08:58:03', actor: 'finance@mpk.gov.my', action: 'Exported daily settlement CSV', ip: '10.2.4.31', result: 'success' as const },
  { id: 'audit-5', timestamp: '08:44:39', actor: 'unknown-device', action: 'Revoked expired API key', ip: '203.0.113.9', result: 'blocked' as const },
  { id: 'audit-6', timestamp: '08:02:17', actor: 'system.backup', action: 'Encrypted backup completed', ip: 'internal', result: 'success' as const }
];

export const visitorTrend = [
  { time: '7am', visitors: 68, capacity: 100 },
  { time: '8am', visitors: 92, capacity: 100 },
  { time: '9am', visitors: 84, capacity: 100 },
  { time: '10am', visitors: 51, capacity: 100 },
  { time: '11am', visitors: 33, capacity: 100 },
  { time: '12pm', visitors: 28, capacity: 100 },
  { time: '1pm', visitors: 36, capacity: 100 },
  { time: '2pm', visitors: 45, capacity: 100 },
  { time: '3pm', visitors: 39, capacity: 100 },
  { time: '4pm', visitors: 22, capacity: 100 }
];

export const revenueMix = [
  { name: 'Chalet', value: 720 },
  { name: 'Parking', value: 240 },
  { name: 'Pool', value: 225 },
  { name: 'BBQ', value: 120 },
  { name: 'Marketplace', value: 1685 }
];

export const esg = [
  { label: 'Diverted waste', value: '2.1 kg', target: 'Recycle 60%' },
  { label: 'Conservation levy', value: 'RM435', target: 'Ring-fenced' },
  { label: 'Pool water monitored', value: '1,200 L', target: 'pH 7.2' },
  { label: 'Chalet energy', value: '45 kWh', target: '-12% YoY' },
  { label: 'Shuttle carbon avoided', value: '12 kg', target: 'Weekend loop' }
];

export const sla = [
  { metric: 'Uptime', value: '99.92%', target: '99.9%', pass: true },
  { metric: 'RPO / RTO', value: '15m / 60m', target: '15m / 60m', pass: true },
  { metric: 'MTTR', value: '22m', target: '<30m', pass: true },
  { metric: 'Alert propagation', value: '1.8s', target: '<3s', pass: true },
  { metric: 'SOS acknowledgement', value: '42s', target: '<60s', pass: true },
  { metric: 'GPS success', value: '99.1%', target: '>98%', pass: true },
  { metric: 'Car-park AI accuracy', value: '97.4%', target: '>97%', pass: true },
  { metric: 'Chalet app adoption', value: '82%', target: '>75%', pass: true }
];

export const healthScores = [
  { key: 'safety', label: 'Safety', score: 4.6, weight: 30 },
  { key: 'cleanliness', label: 'Cleanliness', score: 4.2, weight: 25 },
  { key: 'family', label: 'Family experience', score: 4.7, weight: 20 },
  { key: 'community', label: 'Community', score: 4.3, weight: 15 },
  { key: 'governance', label: 'Governance', score: 4.5, weight: 10 }
];

export const baseCheckpoints = [
  { code: 'BASE', name: 'Base Entrance', altitude: undefined as number | undefined, stamped: true },
  { code: 'CP1', name: 'Bridge Checkpoint', altitude: undefined as number | undefined, stamped: true },
  { code: 'NORTH', name: 'North Peak 510m', altitude: 510, stamped: false },
  { code: 'SOUTH', name: 'South Peak 470m', altitude: 470, stamped: false },
  { code: 'MAST', name: 'Broadcasting Mast', altitude: undefined as number | undefined, stamped: false }
];

const checkpoints = structuredClone(baseCheckpoints);

const bookings: Booking[] = [
  {
    id: 'book-seed-1',
    facilityId: 'fac-chalet',
    guestName: 'Bin family',
    partySize: 4,
    checkInDate: new Date().toISOString().slice(0, 10),
    amountMyr: 100,
    qrRef: 'LAMBAK-7QK21',
    smartLockPin: '4821',
    status: 'confirmed',
    createdAt: now
  }
];

const sosAlerts: SosAlert[] = [];

interface StoreShape {
  facilities: Facility[];
  tasks: RangerTask[];
  iot: IotDevice[];
  incidents: Incident[];
  bookings: Booking[];
  sosAlerts: SosAlert[];
  hikes: HikeSession[];
  apiKeys: IssuedApiKey[];
  consents: ConsentRecord[];
  config: ParkConfig;
  restoreTest: RestoreTest;
  auditLogs: typeof auditLogs;
  points: number;
  safeZone: boolean;
}

declare global {
  var __smartLambakStore: StoreShape | undefined;
}

export const store: StoreShape =
  globalThis.__smartLambakStore ??
  (globalThis.__smartLambakStore = {
    facilities: structuredClone(facilities),
    tasks: structuredClone(tasks),
    iot: structuredClone(iot),
    incidents: structuredClone(incidents),
    bookings: structuredClone(bookings),
    sosAlerts: structuredClone(sosAlerts),
    hikes: [],
    apiKeys: [],
    consents: [],
    config: structuredClone(defaultConfig),
    restoreTest: { lastTestAt: null, result: 'pending', durationSec: null, runBy: null },
    auditLogs: structuredClone(auditLogs),
    points: 128,
    safeZone: true
  });

export function randomCode(length: number) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
}

function addAudit(actor: string, action: string) {
  store.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString('en-MY', { hour12: false }),
    actor,
    action,
    ip: '10.2.4.100',
    result: 'success'
  });
}

// Admin-configured capacities override the seed facility capacities at read time.
function applyConfig(facilities: Facility[]): Facility[] {
  const map: Partial<Record<Facility['type'], number>> = {
    car_park: store.config.carparkCapacity,
    chalet: store.config.chaletCapacity,
    pool: store.config.poolCapacity
  };
  return facilities.map((facility) => {
    const configured = map[facility.type];
    if (!configured || configured === facility.capacity) return facility;
    return {
      ...facility,
      capacity: configured,
      occupied: Math.min(facility.occupied, configured),
      status: facility.occupied >= configured ? 'full' : facility.status
    };
  });
}

export function getDashboard(): DashboardSnapshot {
  const facilities = applyConfig(store.facilities);
  const carPark = facilities.find((facility) => facility.type === 'car_park');
  const occupied = carPark?.occupied ?? 0;
  const total = carPark?.capacity ?? 120;
  const healthIndex = Number(
    healthScores.reduce((sum, item) => sum + item.score * (item.weight / 100), 0).toFixed(2)
  );

  return {
    generatedAt: new Date().toISOString(),
    offlineQueue: 50,
    points: store.points,
    visitorsToday: 342,
    visitorsOnTrail: 89,
    carPark: { total, occupied, free: total - occupied, accuracy: 97.4 },
    healthIndex,
    revenueTodayMyr: 2850,
    forecastMonthMyr: 55000,
    roiPct: 23.5,
    uptimePct: 99.92,
    facilities: structuredClone(facilities),
    tasks: structuredClone(store.tasks),
    iot: structuredClone(store.iot),
    incidents: structuredClone(store.incidents),
    bookings: structuredClone(store.bookings),
    auditLogs: structuredClone(store.auditLogs),
    visitorTrend,
    revenueMix,
    esg,
    sla,
    healthScores,
    checkpoints
  };
}

export function createBooking(input: { facilityId?: string; guestName?: string; partySize?: number; checkInDate?: string }) {
  const facility = store.facilities.find((item) => item.id === input.facilityId) ?? store.facilities[1];
  const configured = applyConfig(store.facilities).find((item) => item.id === facility.id);
  if (facility.occupied >= (configured?.capacity ?? facility.capacity)) {
    throw new Error('Facility is at capacity');
  }

  const booking: Booking = {
    id: `book-${Date.now()}`,
    facilityId: facility.id,
    guestName: input.guestName?.trim() || 'Walk-in visitor',
    partySize: Math.max(1, Math.min(20, Number(input.partySize) || 1)),
    checkInDate: input.checkInDate || new Date().toISOString().slice(0, 10),
    amountMyr: facility.priceMyr,
    qrRef: `LAMBAK-${randomCode(5)}`,
    smartLockPin: facility.smartLock ? String(Math.floor(1000 + Math.random() * 9000)) : undefined,
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };

  facility.occupied += 1;
  store.bookings.unshift(booking);
  store.points += 10;
  addAudit(booking.guestName, `Confirmed ${facility.nameEn} booking`);
  return booking;
}

export function updateTask(id: string, completed: boolean) {
  const task = store.tasks.find((item) => item.id === id);
  if (!task) throw new Error('Task not found');
  task.status = completed ? 'completed' : 'open';
  addAudit(task.assignee, completed ? `Completed ${task.titleEn}` : `Reopened ${task.titleEn}`);
  return task;
}

export function cycleFacilityStatus(id: string) {
  const facility = store.facilities.find((item) => item.id === id);
  if (!facility) throw new Error('Facility not found');
  const order: Facility['status'][] = ['open', 'cleaning', 'maintenance', 'open'];
  facility.status = order[(order.indexOf(facility.status) + 1) % order.length];
  addAudit('Facility Team', `Cycled ${facility.nameEn} to ${facility.status}`);
  return facility;
}

export function createSos(input: { name?: string; latitude?: number; longitude?: number; familyCount?: number; battery?: number }) {
  const alert: SosAlert = {
    id: `sos-${Date.now()}`,
    name: input.name || 'Anonymous visitor',
    latitude: input.latitude ?? 2.02509,
    longitude: input.longitude ?? 103.34437,
    familyCount: input.familyCount ?? 4,
    battery: input.battery ?? 78,
    etaMinutes: 8,
    status: 'dispatched',
    createdAt: new Date().toISOString()
  };
  store.sosAlerts.unshift(alert);
  store.incidents.unshift({
    id: `inc-${alert.id}`,
    type: 'safety',
    severity: 'P0',
    status: 'acknowledged',
    titleEn: `SOS from ${alert.name}`,
    titleBm: `SOS daripada ${alert.name}`,
    zone: 'Trail',
    latitude: alert.latitude,
    longitude: alert.longitude
  });
  addAudit(alert.name, 'SOS dispatched to MPK, APM and clinic');
  return alert;
}

export function stampCheckpoint(code: string) {
  const checkpoint = checkpoints.find((item) => item.code === code);
  if (!checkpoint) throw new Error('Checkpoint not found');
  checkpoint.stamped = true;
  store.points += 15;
  addAudit('Visitor app', `Stamped ${checkpoint.name}`);
  return checkpoint;
}

export function syncOfflineQueue() {
  const queued = 50;
  store.points += 5;
  addAudit('Ranger tablet', `Synced ${queued} offline tasks`);
  return { synced: queued, pointsAwarded: 5 };
}

type HikeInput = Partial<Omit<HikeSession, 'id'>>;

export function recordHike(input: HikeInput): HikeSession {
  const trail = trailById(input.trailId || 'lambak-family');
  const distance = Math.max(0, Number(input.distanceKm) || 0);
  const durationSec = Math.max(1, Number(input.durationSec) || 1);
  const session: HikeSession = {
    id: `hike-${Date.now()}`,
    trailId: trail.id,
    trailNameEn: input.trailNameEn || trail.nameEn,
    trailNameBm: input.trailNameBm || input.trailNameEn || trail.nameBm,
    startedAt: input.startedAt || new Date().toISOString(),
    durationSec,
    distanceKm: Number(distance.toFixed(2)),
    paceSecPerKm: Number(input.paceSecPerKm) || Math.round(durationSec / Math.max(0.01, distance)),
    elevationM: Math.round(Number(input.elevationM) || 0),
    steps: Number(input.steps) || Math.round(distance * 1350),
    caloriesKcal: Number(input.caloriesKcal) || Math.round(distance * 55),
    source: (input.source as HikeSource) || 'simulated'
  };
  store.hikes.unshift(session);
  store.points += 25;
  addAudit('Visitor app', `Completed ${session.trailNameEn} hike (${session.distanceKm} km)`);
  return session;
}

export function getHikes(): HikeSession[] {
  return structuredClone(store.hikes);
}

// ---------- Admin facility configuration ----------

export function getConfig(): ParkConfig {
  return structuredClone(store.config);
}

export function updateConfig(patch: Partial<Omit<ParkConfig, 'updatedAt' | 'updatedBy'>>, actor: string): ParkConfig {
  const clampInt = (value: unknown, fallback: number, min: number, max: number) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback;
  };
  store.config = {
    ...store.config,
    carparkCapacity: clampInt(patch.carparkCapacity, store.config.carparkCapacity, 20, 5000),
    chaletCapacity: clampInt(patch.chaletCapacity, store.config.chaletCapacity, 1, 500),
    poolCapacity: clampInt(patch.poolCapacity, store.config.poolCapacity, 1, 1000),
    priceMinMyr: clampInt(patch.priceMinMyr, store.config.priceMinMyr, 0, 1000),
    priceMaxMyr: clampInt(patch.priceMaxMyr, store.config.priceMaxMyr, 1, 5000),
    updatedAt: new Date().toISOString(),
    updatedBy: actor
  };
  addAudit(actor, `Updated facility configuration (CP ${store.config.carparkCapacity}, CH ${store.config.chaletCapacity}, PL ${store.config.poolCapacity})`);
  return getConfig();
}

// ---------- API keys ----------

export function listApiKeys() {
  return structuredClone(
    store.apiKeys.map((key) => ({
      id: key.id,
      name: key.name,
      prefix: key.prefix,
      createdAt: key.createdAt,
      createdBy: key.createdBy,
      revoked: key.revoked
    }))
  );
}

export function issueApiKey(name: string, actor: string): { key: string; meta: IssuedApiKey } {
  const raw = `lambak_${Array.from({ length: 28 }, () => 'ABCDEFGHJKMNPQRSTUVWXYZ23456789abcdefghjkmnpqrstuvwxyz'[Math.floor(Math.random() * 54)]).join('')}`;
  const meta: IssuedApiKey = {
    id: `key-${Date.now()}`,
    name: name.trim() || 'Integration key',
    prefix: raw.slice(0, 11),
    createdAt: new Date().toISOString(),
    createdBy: actor,
    revoked: false
  };
  store.apiKeys.unshift(meta);
  addAudit(actor, `Issued API key "${meta.name}" (${meta.prefix}…)`);
  return { key: raw, meta };
}

export function revokeApiKey(id: string, actor: string): boolean {
  const key = store.apiKeys.find((item) => item.id === id);
  if (!key) return false;
  key.revoked = true;
  addAudit(actor, `Revoked API key "${key.name}" (${key.prefix}…)`);
  return true;
}

// ---------- PDPA consent ----------

export function recordConsent(accepted: boolean, scope: string, actor: string): ConsentRecord {
  const record: ConsentRecord = {
    id: `consent-${Date.now()}`,
    scope: scope || 'pdpa-v1',
    accepted,
    at: new Date().toISOString()
  };
  store.consents.unshift(record);
  addAudit(actor, accepted ? `Granted ${scope || 'PDPA'} consent` : `Withdrew ${scope || 'PDPA'} consent`);
  return structuredClone(record);
}

export function getConsentStats() {
  return {
    total: store.consents.length,
    accepted: store.consents.filter((item) => item.accepted).length,
    withdrawn: store.consents.filter((item) => !item.accepted).length,
    latest: store.consents[0] ?? null
  };
}

// ---------- IoT telemetry ingest ----------

export function ingestIotReading(input: {
  deviceId?: string;
  value?: string;
  metric?: string;
  battery?: number;
  status?: IotDevice['status'];
}): IotDevice {
  const device = store.iot.find((item) => item.id === input.deviceId);
  if (!device) throw new Error('Unknown IoT device id');
  if (input.value !== undefined) device.value = String(input.value);
  if (input.metric) device.metric = input.metric;
  if (typeof input.battery === 'number' && Number.isFinite(input.battery)) {
    device.battery = Math.min(100, Math.max(0, Math.round(input.battery)));
  }
  if (input.status === 'live' || input.status === 'warning' || input.status === 'offline') {
    device.status = input.status;
  }
  return structuredClone(device);
}

// ---------- Public incident / wildlife reports ----------

type IncidentInput = {
  type?: Incident['type'];
  severity?: Incident['severity'];
  titleEn?: string;
  titleBm?: string;
  zone?: string;
  latitude?: number;
  longitude?: number;
  reportedBy?: string;
};

export function reportIncident(input: IncidentInput): Incident {
  const type = input.type ?? 'wildlife';
  const incident: Incident = {
    id: `inc-${Date.now()}`,
    type,
    severity: input.severity ?? (type === 'wildlife' ? 'P1' : 'P2'),
    status: 'open',
    titleEn: input.titleEn?.trim() || 'Visitor report',
    titleBm: input.titleBm?.trim() || input.titleEn?.trim() || 'Laporan pelawat',
    zone: input.zone?.trim() || 'Gunung Lambak',
    latitude: input.latitude,
    longitude: input.longitude
  };
  store.incidents.unshift(incident);
  addAudit(input.reportedBy || 'Visitor app', `Reported ${type} incident in ${incident.zone}: ${incident.titleEn}`);
  return structuredClone(incident);
}

// ---------- Capacity forecast ----------

export function getForecast() {
  const peak = [...visitorTrend].sort((a, b) => b.visitors - a.visitors)[0];
  // Average observed on-site arrivals per hour during the 7–9am entry wave.
  const morning = visitorTrend.filter((point) => ['7am', '8am', '9am'].includes(point.time));
  const hourlyArrival = morning.reduce((sum, point) => sum + point.visitors, 0) / morning.length;
  const carPark = store.facilities.find((facility) => facility.type === 'car_park');
  const total = store.config.carparkCapacity;
  const occupied = carPark?.occupied ?? 0;
  // Predict the today clock time (MYT) the car park fills, anchored to the 07:00 opening.
  const minutesFromOpen = Math.round((total / Math.max(1, hourlyArrival)) * 60);
  const withinDay = minutesFromOpen <= 11 * 60;
  let expectedCarParkFull: string | null = null;
  if (withinDay) {
    const clockMinutes = 7 * 60 + minutesFromOpen;
    const hh = Math.floor(clockMinutes / 60);
    const mm = clockMinutes % 60;
    expectedCarParkFull = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  }
  return {
    generatedAt: new Date().toISOString(),
    peakTime: peak.time,
    peakVisitors: peak.visitors,
    hourlyArrival: Math.round(hourlyArrival),
    expectedCarParkFull,
    confidencePct: 92,
    recommendedStaff: minutesFromOpen <= 120 ? 3 : minutesFromOpen <= 240 ? 2 : 1,
    dynamicPricingRecommended: minutesFromOpen <= 120 || occupied / total >= 0.8
  };
}

// ---------- Disaster recovery drill ----------

export function runRestoreTest(actor: string): RestoreTest {
  const startedAt = Date.now();
  const result: RestoreTest = {
    lastTestAt: new Date().toISOString(),
    result: 'passed',
    durationSec: 42 + Math.floor(Math.random() * 12),
    runBy: actor
  };
  store.restoreTest = result;
  addAudit(actor, `Monthly DR restore test passed in ${result.durationSec}s (RTO target 60m)`);
  void startedAt;
  return structuredClone(result);
}

export function getRestoreTest(): RestoreTest {
  return structuredClone(store.restoreTest);
}

// ---------- Integration webhook test ----------

export function webhookTest(): { ok: boolean; latencyMs: number; at: string } {
  return { ok: true, latencyMs: 160 + Math.floor(Math.random() * 80), at: new Date().toISOString() };
}
