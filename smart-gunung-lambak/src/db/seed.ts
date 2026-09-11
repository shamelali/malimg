import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import {
  auditLogs,
  bookings,
  facilities,
  incidents,
  iotReadings,
  parks,
  tasks,
  trailCheckIns,
  users
} from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is required to seed PostgreSQL.');
  process.exit(1);
}

const pool = new Pool({ connectionString });
const db = drizzle(pool);

const parkId = '0192aaaf-0000-4000-8000-000000000001';
const managerId = '0192aaaf-0000-4000-8000-000000000101';
const rangerId = '0192aaaf-0000-4000-8000-000000000102';
const visitorId = '0192aaaf-0000-4000-8000-000000000103';
const carParkId = '0192aaaf-0000-4000-8000-000000000201';
const chaletId = '0192aaaf-0000-4000-8000-000000000202';
const poolId = '0192aaaf-0000-4000-8000-000000000203';
const bbqId = '0192aaaf-0000-4000-8000-000000000204';
const campingId = '0192aaaf-0000-4000-8000-000000000205';
const binId = '0192aaaf-0000-4000-8000-000000000206';
const toiletId = '0192aaaf-0000-4000-8000-000000000207';

async function main() {
  await db.insert(parks).values({
    id: parkId,
    slug: 'gunung-lambak',
    nameEn: 'Gunung Lambak Pilot',
    nameBm: 'Perintis Gunung Lambak',
    municipality: 'MPK Kluang',
    status: 'active',
    latitude: '2.025090',
    longitude: '103.344370',
    budgetMyr: 2_800_000,
    config: { carPark: 120, chalets: 10, pool: 80, bbq: 6, safeZoneRadiusM: 50 }
  }).onConflictDoNothing();

  await db.insert(users).values([
    { id: managerId, parkId, name: 'Park Manager', email: 'manager@mpk.gov.my', role: 'park_manager' },
    { id: rangerId, parkId, name: 'Ranger Hafiz', email: 'ranger.hafiz@mpk.gov.my', role: 'ranger' },
    { id: visitorId, parkId, name: 'Demo Visitor', email: 'visitor@example.com', role: 'visitor', consentedAt: new Date() }
  ]).onConflictDoNothing();

  await db.insert(facilities).values([
    { id: carParkId, parkId, type: 'car_park', name: 'Base Car Park', code: 'CP-01', capacity: 120, occupied: 87, priceCents: 300, metadata: { iot: true, cameraAiAccuracyPct: 97.4 } },
    { id: chaletId, parkId, type: 'chalet', name: 'Family Chalet', code: 'CH-01', capacity: 10, occupied: 6, priceCents: 10_000, metadata: { iot: true, smartLock: true, smartLockType: 'TTLock QR+PIN' } },
    { id: poolId, parkId, type: 'pool', name: 'Public Pool', code: 'PL-01', capacity: 80, occupied: 45, priceCents: 500, metadata: { iot: true, ph: 7.2 } },
    { id: bbqId, parkId, type: 'bbq', name: 'BBQ Bay', code: 'BQ-01', capacity: 6, occupied: 2, priceCents: 3_000 },
    { id: campingId, parkId, type: 'camping', name: 'Camping Ground', code: 'CG-01', capacity: 20, occupied: 12, priceCents: 2_000 },
    { id: binId, parkId, type: 'waste_bin', name: 'Zone A Smart Bin', code: 'BN-A1', capacity: 100, occupied: 90, status: 'full', metadata: { iot: true, ultrasonic: true } },
    { id: toiletId, parkId, type: 'toilet', name: 'Base Toilets', code: 'TL-01', capacity: 4, occupied: 1, status: 'cleaning', metadata: { iot: true, ammoniaPpm: 18 } }
  ]).onConflictDoNothing();

  await db.insert(tasks).values([
    { id: '0192aaaf-0000-4000-8000-000000000301', parkId, titleEn: 'Inspect Zone A wildlife-proof bin', titleBm: 'Periksa tong kalis hidupan liar Zon A', category: 'Wildlife', priority: 'P1', status: 'in_progress', assignee: 'Ranger Hafiz', dueAt: new Date(Date.now() + 3600_000) },
    { id: '0192aaaf-0000-4000-8000-000000000302', parkId, titleEn: 'Clean and sanitise toilet block 1', titleBm: 'Bersih dan sanitasi blok tandas 1', category: 'Cleanliness', priority: 'P2', status: 'open', assignee: 'Facility Team', dueAt: new Date(Date.now() + 7200_000) },
    { id: '0192aaaf-0000-4000-8000-000000000303', parkId, titleEn: 'Check pool pH and filtration pressure', titleBm: 'Periksa pH kolam dan tekanan penapisan', category: 'Pool', priority: 'P2', status: 'completed', assignee: 'Operator', completedAt: new Date() }
  ]).onConflictDoNothing();

  await db.insert(incidents).values([
    {
      id: '0192aaaf-0000-4000-8000-000000000401',
      parkId,
      type: 'wildlife',
      severity: 'P1',
      status: 'monitoring',
      titleEn: 'Long-tailed macaque activity near Zone A bin',
      titleBm: 'Aktiviti monyet ekor panjang berhampiran tong Zon A',
      latitude: '2.025090',
      longitude: '103.344370',
      reportedBy: 'Ranger Hafiz',
      metadata: { zone: 'Zone A' }
    },
    {
      id: '0192aaaf-0000-4000-8000-000000000402',
      parkId,
      type: 'facility',
      severity: 'P2',
      status: 'acknowledged',
      titleEn: 'Smart bin above 80% threshold',
      titleBm: 'Tong pintar melebihi ambang 80%',
      metadata: { zone: 'Base' }
    }
  ]).onConflictDoNothing();

  await db.insert(bookings).values({
    id: '0192aaaf-0000-4000-8000-000000000501',
    parkId,
    facilityId: chaletId,
    guestName: 'Bin family',
    contact: 'visitor@example.com',
    partySize: 4,
    checkInDate: new Date().toISOString().slice(0, 10),
    amountCents: 10_000,
    qrRef: 'LAMBAK-7QK21',
    smartLockPin: '4821'
  }).onConflictDoNothing();

  await db.insert(iotReadings).values([
    { id: '0192aaaf-0000-4000-8000-000000000701', parkId, deviceType: 'camera_ai', deviceCode: 'iot-cam-entry', metric: 'Detection accuracy', valueText: '97.4%', qualityPct: 97 },
    { id: '0192aaaf-0000-4000-8000-000000000702', parkId, deviceType: 'camera_ai', deviceCode: 'iot-cam-exit', metric: 'Vehicles counted', valueText: '28 out', qualityPct: 98 },
    { id: '0192aaaf-0000-4000-8000-000000000703', parkId, deviceType: 'waste_bin', deviceCode: 'iot-bin-a1', metric: 'Fill level', valueNumeric: '90', battery: 72, qualityPct: 99 },
    { id: '0192aaaf-0000-4000-8000-000000000704', parkId, deviceType: 'waste_bin', deviceCode: 'iot-bin-b2', metric: 'Fill level', valueNumeric: '48', battery: 84, qualityPct: 99 },
    { id: '0192aaaf-0000-4000-8000-000000000705', parkId, deviceType: 'toilet', deviceCode: 'iot-toilet-1', metric: 'Ammonia ppm', valueNumeric: '18', battery: 64, qualityPct: 96 },
    { id: '0192aaaf-0000-4000-8000-000000000706', parkId, deviceType: 'smart_lock', deviceCode: 'iot-lock-7', metric: 'Battery', valueNumeric: '88', battery: 88, qualityPct: 100 },
    { id: '0192aaaf-0000-4000-8000-000000000707', parkId, deviceType: 'pool_sensor', deviceCode: 'iot-pool', metric: 'pH and headcount', valueText: '7.2 / 45', battery: 91, qualityPct: 98 },
    { id: '0192aaaf-0000-4000-8000-000000000708', parkId, deviceType: 'gateway', deviceCode: 'iot-gateway', metric: 'Alert propagation seconds', valueNumeric: '1.8', qualityPct: 99 }
  ]).onConflictDoNothing();

  await db.insert(trailCheckIns).values([
    { id: '0192aaaf-0000-4000-8000-000000000601', parkId, userId: visitorId, checkpointCode: 'BASE', checkpointName: 'Base Entrance' },
    { id: '0192aaaf-0000-4000-8000-000000000602', parkId, userId: visitorId, checkpointCode: 'CP1', checkpointName: 'Bridge Checkpoint' }
  ]).onConflictDoNothing();

  await db.insert(auditLogs).values([
    { id: '0192aaaf-0000-4000-8000-000000000801', parkId, actor: 'manager@mpk.gov.my', action: 'Updated car park threshold', entity: 'facility', entityId: carParkId, ipAddress: '10.2.4.18' },
    { id: '0192aaaf-0000-4000-8000-000000000802', parkId, actor: 'ranger.hafiz', action: 'Acknowledged Zone A wildlife alert', entity: 'incident', entityId: '0192aaaf-0000-4000-8000-000000000401', ipAddress: '10.2.4.74' },
    { id: '0192aaaf-0000-4000-8000-000000000803', parkId, actor: 'visitor-4821', action: 'Generated family e-ticket', entity: 'ticket', ipAddress: '172.16.8.2' },
    { id: '0192aaaf-0000-4000-8000-000000000804', parkId, actor: 'finance@mpk.gov.my', action: 'Exported daily settlement CSV', entity: 'report', ipAddress: '10.2.4.31' },
    { id: '0192aaaf-0000-4000-8000-000000000805', parkId, actor: 'system.backup', action: 'Encrypted backup completed', entity: 'backup', result: 'success', ipAddress: 'internal' }
  ]).onConflictDoNothing();

  console.log('Seed completed: Gunung Lambak pilot');
  await pool.end();
}

main().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
