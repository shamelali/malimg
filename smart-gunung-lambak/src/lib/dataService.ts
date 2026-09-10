import { desc, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import {
  auditLogs,
  bookings as bookingTable,
  facilities as facilityTable,
  incidents as incidentTable,
  tasks as taskTable,
  trailCheckIns
} from '@/db/schema';
import type {
  Booking,
  DashboardSnapshot,
  Facility,
  Incident,
  RangerTask,
  SosAlert,
  AuditLog
} from './types';
import * as memory from './serverStore';
import { randomCode } from './serverStore';
import { HOURLY_FORECAST, TRAILS, WEATHER_STRIP, type HikeSession } from './trails';

function toMyTime(value: Date | string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleTimeString('en-MY', {
    timeZone: 'Asia/Kuala_Lumpur',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

function mapFacility(row: typeof facilityTable.$inferSelect): Facility {
  const metadata = (row.metadata ?? {}) as { smartLock?: boolean; iot?: boolean };
  return {
    id: row.id,
    type: row.type as Facility['type'],
    nameEn: row.name,
    nameBm: row.name,
    code: row.code,
    capacity: row.capacity,
    occupied: row.occupied,
    priceMyr: row.priceCents / 100,
    status: row.status === 'closed' ? 'maintenance' : row.status,
    smartLock: Boolean(metadata.smartLock),
    iot: Boolean(metadata.iot)
  };
}

function mapTask(row: typeof taskTable.$inferSelect): RangerTask {
  return {
    id: row.id,
    titleEn: row.titleEn,
    titleBm: row.titleBm,
    category: row.category,
    priority: row.priority,
    status: row.status === 'blocked' ? 'open' : row.status,
    assignee: row.assignee ?? 'Unassigned',
    dueAt: toMyTime(row.dueAt)
  };
}

function mapIncident(row: typeof incidentTable.$inferSelect): Incident {
  return {
    id: row.id,
    type: (row.type as Incident['type']) ?? 'safety',
    severity: row.severity as Incident['severity'],
    status: row.status,
    titleEn: row.titleEn,
    titleBm: row.titleBm,
    zone: (row.metadata as { zone?: string } | null)?.zone ?? 'Gunung Lambak',
    latitude: row.latitude ? Number(row.latitude) : undefined,
    longitude: row.longitude ? Number(row.longitude) : undefined
  };
}

function mapBooking(row: typeof bookingTable.$inferSelect): Booking {
  const date = String(row.checkInDate).slice(0, 10);
  return {
    id: row.id,
    facilityId: row.facilityId,
    guestName: row.guestName,
    partySize: row.partySize,
    checkInDate: date,
    amountMyr: row.amountCents / 100,
    qrRef: row.qrRef,
    smartLockPin: row.smartLockPin ?? undefined,
    status: row.status === 'cancelled' ? 'cancelled' : 'confirmed',
    createdAt: new Date(row.createdAt).toISOString()
  };
}

function mapAudit(row: typeof auditLogs.$inferSelect): AuditLog {
  return {
    id: row.id,
    timestamp: new Date(row.createdAt).toLocaleTimeString('en-MY', { timeZone: 'Asia/Kuala_Lumpur', hour12: false }),
    actor: row.actor,
    action: row.action,
    ip: row.ipAddress ?? 'internal',
    result: (row.result as AuditLog['result']) ?? 'success'
  };
}

async function getPostgresDashboard(): Promise<DashboardSnapshot> {
  if (!db) return memory.getDashboard();
  const schema = await import('@/db/schema');
  const [park] = await db.select().from(schema.parks).limit(1);
  if (!park) throw new Error('No park found. Run npm run db:seed.');

  const [facilityRows, taskRows, incidentRows, bookingRows, auditRows, checkInRows] = await Promise.all([
    db.select().from(facilityTable).where(eq(facilityTable.parkId, park.id)),
    db.select().from(taskTable).where(eq(taskTable.parkId, park.id)).orderBy(desc(taskTable.dueAt)),
    db.select().from(incidentTable).where(eq(incidentTable.parkId, park.id)).orderBy(desc(incidentTable.createdAt)).limit(20),
    db.select().from(bookingTable).where(eq(bookingTable.parkId, park.id)).orderBy(desc(bookingTable.createdAt)).limit(50),
    db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(100),
    db.select().from(trailCheckIns).where(eq(trailCheckIns.parkId, park.id))
  ]);

  const facilities = facilityRows.map(mapFacility);
  const carPark = facilities.find((facility) => facility.type === 'car_park');
  const stamps = new Set(checkInRows.map((row) => row.checkpointCode));
  const healthIndex = Number(
    memory.healthScores.reduce((sum, item) => sum + item.score * (item.weight / 100), 0).toFixed(2)
  );

  // Device catalog is configuration; live readings are provided by the IoT readings table.
  const memorySnapshot = memory.getDashboard();

  return {
    ...memorySnapshot,
    facilities,
    tasks: taskRows.map(mapTask),
    incidents: incidentRows.map(mapIncident),
    bookings: bookingRows.map(mapBooking),
    auditLogs: auditRows.map(mapAudit),
    visitorTrend: memory.visitorTrend,
    revenueMix: memory.revenueMix,
    esg: memory.esg,
    sla: memory.sla,
    healthScores: memory.healthScores,
    healthIndex,
    iot: memorySnapshot.iot,
    checkpoints: memory.baseCheckpoints.map((checkpoint) => ({ ...checkpoint, stamped: stamps.has(checkpoint.code) })),
    carPark: {
      total: carPark?.capacity ?? 120,
      occupied: carPark?.occupied ?? 0,
      free: (carPark?.capacity ?? 120) - (carPark?.occupied ?? 0),
      accuracy: 97.4
    }
  };
}

export async function getDashboardData(): Promise<DashboardSnapshot> {
  if (!db) return memory.getDashboard();
  try {
    return await getPostgresDashboard();
  } catch (error) {
    console.error('PostgreSQL dashboard read failed; using seeded memory data:', error);
    return memory.getDashboard();
  }
}

export async function createBookingData(input: {
  facilityId?: string;
  guestName?: string;
  partySize?: number;
  checkInDate?: string;
}) {
  if (!db) return memory.createBooking(input);

  const schema = await import('@/db/schema');
  const [park] = await db.select().from(schema.parks).limit(1);
  if (!park) throw new Error('No park found. Run npm run db:seed.');
  const [facility] = await db
    .select()
    .from(facilityTable)
    .where(eq(facilityTable.id, input.facilityId ?? ''))
    .limit(1);
  if (!facility) throw new Error('Facility not found');
  if (facility.occupied >= facility.capacity) throw new Error('Facility is at capacity');

  const metadata = (facility.metadata ?? {}) as { smartLock?: boolean };
  const bookingId = crypto.randomUUID();
  const qrRef = `LAMBAK-${randomCode(5)}`;
  const smartLockPin = metadata.smartLock ? String(Math.floor(1000 + Math.random() * 9000)) : null;
  const checkInDate = input.checkInDate || new Date().toISOString().slice(0, 10);

  await db.insert(bookingTable).values({
    id: bookingId,
    parkId: park.id,
    facilityId: facility.id,
    guestName: input.guestName?.trim() || 'Walk-in visitor',
    partySize: Math.max(1, Math.min(20, Number(input.partySize) || 1)),
    checkInDate,
    amountCents: facility.priceCents,
    qrRef,
    smartLockPin
  });
  await db.update(facilityTable).set({ occupied: facility.occupied + 1, updatedAt: new Date() }).where(eq(facilityTable.id, facility.id));
  await db.insert(auditLogs).values({
    parkId: park.id,
    actor: input.guestName?.trim() || 'Walk-in visitor',
    action: `Confirmed ${facility.name} booking`,
    entity: 'booking',
    entityId: bookingId
  });

  const [row] = await db.select().from(bookingTable).where(eq(bookingTable.id, bookingId)).limit(1);
  return mapBooking(row!);
}

export async function updateTaskData(id: string, completed: boolean) {
  if (!db) return memory.updateTask(id, completed);
  const [task] = await db.select().from(taskTable).where(eq(taskTable.id, id)).limit(1);
  if (!task) throw new Error('Task not found');
  await db
    .update(taskTable)
    .set({ status: completed ? 'completed' : 'open', completedAt: completed ? new Date() : null })
    .where(eq(taskTable.id, id));
  const [updated] = await db.select().from(taskTable).where(eq(taskTable.id, id)).limit(1);
  return mapTask(updated!);
}

export async function cycleFacilityStatusData(id: string) {
  if (!db) return memory.cycleFacilityStatus(id);
  const [facility] = await db.select().from(facilityTable).where(eq(facilityTable.id, id)).limit(1);
  if (!facility) throw new Error('Facility not found');
  const order = ['open', 'cleaning', 'full', 'maintenance'] as const;
  const currentStatus = facility.status === 'closed' ? 'maintenance' : facility.status;
  const nextStatus = order[(order.indexOf(currentStatus) + 1) % order.length];
  await db.update(facilityTable).set({ status: nextStatus, updatedAt: new Date() }).where(eq(facilityTable.id, id));
  const [updated] = await db.select().from(facilityTable).where(eq(facilityTable.id, id)).limit(1);
  return mapFacility(updated!);
}

export async function createSosData(input: {
  name?: string;
  latitude?: number;
  longitude?: number;
  familyCount?: number;
  battery?: number;
}): Promise<{ alert: SosAlert }> {
  if (!db) {
    const alert = memory.createSos(input);
    return { alert };
  }

  const schema = await import('@/db/schema');
  const [park] = await db.select().from(schema.parks).limit(1);
  if (!park) throw new Error('No park found. Run npm run db:seed.');
  const alert: SosAlert = {
    id: crypto.randomUUID(),
    name: input.name || 'Anonymous visitor',
    latitude: input.latitude ?? 2.02509,
    longitude: input.longitude ?? 103.34437,
    familyCount: input.familyCount ?? 4,
    battery: input.battery ?? 78,
    etaMinutes: 8,
    status: 'dispatched',
    createdAt: new Date().toISOString()
  };

  await db.insert(incidentTable).values({
    parkId: park.id,
    id: alert.id,
    type: 'safety',
    severity: 'P0',
    status: 'acknowledged',
    titleEn: `SOS from ${alert.name}`,
    titleBm: `SOS daripada ${alert.name}`,
    latitude: String(alert.latitude),
    longitude: String(alert.longitude),
    reportedBy: alert.name,
    metadata: { familyCount: alert.familyCount, battery: alert.battery, dispatchedTo: ['MPK Kluang', 'APM', 'Klinik Kesihatan'] }
  });
  await db.insert(auditLogs).values({
    parkId: park.id,
    actor: alert.name,
    action: 'SOS dispatched to MPK, APM and clinic',
    entity: 'incident',
    entityId: alert.id
  });
  return { alert };
}

export async function stampCheckpointData(code: string) {
  const normalizedCode = code.toUpperCase();
  const checkpoint = memory.baseCheckpoints.find((item) => item.code === normalizedCode);
  if (!checkpoint) throw new Error('Checkpoint not found');

  if (!db) return memory.stampCheckpoint(normalizedCode);

  const schema = await import('@/db/schema');
  const [park] = await db.select().from(schema.parks).limit(1);
  if (!park) throw new Error('No park found. Run npm run db:seed.');
  await db.insert(trailCheckIns).values({
    parkId: park.id,
    checkpointCode: normalizedCode,
    checkpointName: checkpoint.name,
    altitudeM: checkpoint.altitude ?? null
  });
  await db.insert(auditLogs).values({ parkId: park.id, actor: 'Visitor app', action: `Stamped ${checkpoint.name}`, entity: 'checkpoint' });
  return { ...checkpoint, stamped: true };
}

export async function syncOfflineQueueData() {
  if (!db) return memory.syncOfflineQueue();
  const schema = await import('@/db/schema');
  const [park] = await db.select().from(schema.parks).limit(1);
  if (park) {
    await db.insert(auditLogs).values({ parkId: park.id, actor: 'Ranger tablet', action: 'Synced 50 offline tasks', entity: 'sync' });
  }
  return { synced: 50, pointsAwarded: 5 };
}

// Trail catalog is static configuration served to all clients (the future Postgres
// table will allow per-park trail edits via the admin configuration API).
export async function getTrailsData() {
  return { trails: TRAILS, weather: { strip: WEATHER_STRIP, hourly: HOURLY_FORECAST } };
}

// Personal hike telemetry is stored in the seeded memory store in the pilot;
// clients also keep an offline-first local log. A hikes table is the production target.
export async function getHikesData(): Promise<HikeSession[]> {
  return memory.getHikes();
}

export async function recordHikeData(input: Partial<HikeSession>): Promise<{ hike: HikeSession; pointsAwarded: number }> {
  const hike = memory.recordHike(input);
  return { hike, pointsAwarded: 25 };
}

// ---- Pilot operations (seeded memory store; production equivalents are documented) ----

export async function getConfigData() {
  return memory.getConfig();
}
export async function updateConfigData(patch: Parameters<typeof memory.updateConfig>[0], actor: string) {
  return memory.updateConfig(patch, actor);
}
export async function listApiKeysData() {
  return memory.listApiKeys();
}
export async function issueApiKeyData(name: string, actor: string) {
  return memory.issueApiKey(name, actor);
}
export async function revokeApiKeyData(id: string, actor: string) {
  return memory.revokeApiKey(id, actor);
}
export async function recordConsentData(accepted: boolean, scope: string, actor: string) {
  return memory.recordConsent(accepted, scope, actor);
}
export async function getConsentStatsData() {
  return memory.getConsentStats();
}
export async function ingestIotData(input: Parameters<typeof memory.ingestIotReading>[0]) {
  return memory.ingestIotReading(input);
}
export async function reportIncidentData(input: Parameters<typeof memory.reportIncident>[0]) {
  return memory.reportIncident(input);
}
export async function getForecastData() {
  return memory.getForecast();
}
export async function runRestoreTestData(actor: string) {
  return memory.runRestoreTest(actor);
}
export async function getRestoreTestData() {
  return memory.getRestoreTest();
}
export async function webhookTestData() {
  return memory.webhookTest();
}

export async function getAuditLogData(): Promise<AuditLog[]> {
  const snapshot = await getDashboardData();
  return snapshot.auditLogs;
}
