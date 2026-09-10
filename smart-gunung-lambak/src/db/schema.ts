import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar
} from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', [
  'super_admin',
  'park_manager',
  'ranger',
  'operator',
  'finance',
  'auditor',
  'visitor'
]);

export const parkStatusEnum = pgEnum('park_status', ['active', 'coming_soon', 'phase_2', 'maintenance']);
export const facilityTypeEnum = pgEnum('facility_type', [
  'car_park',
  'chalet',
  'pool',
  'bbq',
  'camping',
  'toilet',
  'waste_bin',
  'trail',
  'marketplace'
]);
export const facilityStatusEnum = pgEnum('facility_status', ['open', 'cleaning', 'full', 'maintenance', 'closed']);
export const bookingStatusEnum = pgEnum('booking_status', ['pending', 'confirmed', 'checked_in', 'cancelled']);
export const taskStatusEnum = pgEnum('task_status', ['open', 'in_progress', 'completed', 'blocked']);
export const priorityEnum = pgEnum('priority', ['P0', 'P1', 'P2', 'P3']);
export const incidentStatusEnum = pgEnum('incident_status', ['open', 'acknowledged', 'monitoring', 'resolved']);
export const deviceTypeEnum = pgEnum('device_type', ['camera_ai', 'waste_bin', 'toilet', 'smart_lock', 'pool_sensor', 'gateway', 'wearable']);

export const parks = pgTable('parks', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 64 }).notNull().unique(),
  nameEn: varchar('name_en', { length: 160 }).notNull(),
  nameBm: varchar('name_bm', { length: 160 }).notNull(),
  municipality: varchar('municipality', { length: 120 }).notNull().default('MPK Kluang'),
  status: parkStatusEnum('status').notNull().default('active'),
  latitude: numeric('latitude', { precision: 9, scale: 6 }),
  longitude: numeric('longitude', { precision: 10, scale: 6 }),
  budgetMyr: integer('budget_myr'),
  config: jsonb('config').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    parkId: uuid('park_id').references(() => parks.id),
    name: varchar('name', { length: 160 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    role: roleEnum('role').notNull().default('visitor'),
    preferredLanguage: varchar('preferred_language', { length: 2 }).notNull().default('en'),
    mfaEnabled: boolean('mfa_enabled').notNull().default(true),
    consentedAt: timestamp('consented_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [index('users_park_idx').on(table.parkId)]
);

export const facilities = pgTable(
  'facilities',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    parkId: uuid('park_id')
      .notNull()
      .references(() => parks.id),
    type: facilityTypeEnum('type').notNull(),
    name: varchar('name', { length: 160 }).notNull(),
    code: varchar('code', { length: 40 }).notNull(),
    capacity: integer('capacity').notNull().default(0),
    occupied: integer('occupied').notNull().default(0),
    priceCents: integer('price_cents').notNull().default(0),
    status: facilityStatusEnum('status').notNull().default('open'),
    metadata: jsonb('metadata').notNull().default({}),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [index('facilities_park_idx').on(table.parkId), index('facilities_type_idx').on(table.type)]
);

export const bookings = pgTable(
  'bookings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    parkId: uuid('park_id')
      .notNull()
      .references(() => parks.id),
    facilityId: uuid('facility_id')
      .notNull()
      .references(() => facilities.id),
    guestName: varchar('guest_name', { length: 160 }).notNull(),
    contact: varchar('contact', { length: 80 }),
    partySize: integer('party_size').notNull().default(1),
    status: bookingStatusEnum('status').notNull().default('confirmed'),
    checkInDate: date('check_in_date').notNull(),
    amountCents: integer('amount_cents').notNull().default(0),
    qrRef: varchar('qr_ref', { length: 32 }).notNull().unique(),
    smartLockPin: varchar('smart_lock_pin', { length: 8 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [index('bookings_park_idx').on(table.parkId), index('bookings_facility_idx').on(table.facilityId)]
);

export const tasks = pgTable(
  'tasks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    parkId: uuid('park_id')
      .notNull()
      .references(() => parks.id),
    titleEn: varchar('title_en', { length: 220 }).notNull(),
    titleBm: varchar('title_bm', { length: 220 }).notNull(),
    category: varchar('category', { length: 80 }).notNull(),
    priority: priorityEnum('priority').notNull().default('P2'),
    status: taskStatusEnum('status').notNull().default('open'),
    assignee: varchar('assignee', { length: 120 }),
    dueAt: timestamp('due_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true })
  },
  (table) => [index('tasks_park_status_idx').on(table.parkId, table.status)]
);

export const incidents = pgTable(
  'incidents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    parkId: uuid('park_id')
      .notNull()
      .references(() => parks.id),
    type: varchar('type', { length: 100 }).notNull(),
    severity: priorityEnum('severity').notNull().default('P2'),
    status: incidentStatusEnum('status').notNull().default('open'),
    titleEn: text('title_en').notNull(),
    titleBm: text('title_bm').notNull(),
    latitude: numeric('latitude', { precision: 9, scale: 6 }),
    longitude: numeric('longitude', { precision: 10, scale: 6 }),
    reportedBy: varchar('reported_by', { length: 120 }),
    acknowledgedBy: varchar('acknowledged_by', { length: 120 }),
    metadata: jsonb('metadata').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    acknowledgedAt: timestamp('acknowledged_at', { withTimezone: true }),
    resolvedAt: timestamp('resolved_at', { withTimezone: true })
  },
  (table) => [index('incidents_park_idx').on(table.parkId), index('incidents_status_idx').on(table.status)]
);

export const iotReadings = pgTable(
  'iot_readings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    parkId: uuid('park_id')
      .notNull()
      .references(() => parks.id),
    deviceType: deviceTypeEnum('device_type').notNull(),
    deviceCode: varchar('device_code', { length: 64 }).notNull(),
    metric: varchar('metric', { length: 80 }).notNull(),
    valueNumeric: numeric('value_numeric', { precision: 10, scale: 2 }),
    valueText: varchar('value_text', { length: 160 }),
    battery: integer('battery'),
    qualityPct: integer('quality_pct').notNull().default(98),
    observedAt: timestamp('observed_at', { withTimezone: true }).notNull().defaultNow(),
    metadata: jsonb('metadata').notNull().default({})
  },
  (table) => [index('iot_device_time_idx').on(table.deviceCode, table.observedAt)]
);

export const trailCheckIns = pgTable(
  'trail_check_ins',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    parkId: uuid('park_id')
      .notNull()
      .references(() => parks.id),
    userId: uuid('user_id').references(() => users.id),
    checkpointCode: varchar('checkpoint_code', { length: 64 }).notNull(),
    checkpointName: varchar('checkpoint_name', { length: 120 }).notNull(),
    altitudeM: integer('altitude_m'),
    checkedInAt: timestamp('checked_in_at', { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [index('checkin_park_user_idx').on(table.parkId, table.userId)]
);

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    parkId: uuid('park_id').references(() => parks.id),
    actor: varchar('actor', { length: 160 }).notNull(),
    action: varchar('action', { length: 160 }).notNull(),
    entity: varchar('entity', { length: 120 }),
    entityId: varchar('entity_id', { length: 160 }),
    result: varchar('result', { length: 80 }).notNull().default('success'),
    ipAddress: varchar('ip_address', { length: 64 }),
    metadata: jsonb('metadata').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [index('audit_park_time_idx').on(table.parkId, table.createdAt)]
);

export const familyLinks = pgTable(
  'family_links',
  {
    guardianId: uuid('guardian_id')
      .notNull()
      .references(() => users.id),
    dependentId: uuid('dependent_id')
      .notNull()
      .references(() => users.id),
    relationship: varchar('relationship', { length: 40 }).notNull(),
    consentGiven: boolean('consent_given').notNull().default(false),
    safeZoneRadiusM: integer('safe_zone_radius_m').notNull().default(50),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [primaryKey({ columns: [table.guardianId, table.dependentId] })]
);

export type Park = typeof parks.$inferSelect;
export type Facility = typeof facilities.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Incident = typeof incidents.$inferSelect;
export type IotReading = typeof iotReadings.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
