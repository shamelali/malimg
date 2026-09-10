export type Language = 'EN' | 'BM';
export type ViewKey = 'visitor' | 'trails' | 'hike' | 'mytrails' | 'ranger' | 'command' | 'admin' | 'api' | 'sla' | 'budget';

export type FacilityType = 'car_park' | 'chalet' | 'pool' | 'bbq' | 'camping' | 'toilet' | 'waste_bin';
export type FacilityStatus = 'open' | 'cleaning' | 'full' | 'maintenance';

export interface Facility {
  id: string;
  type: FacilityType;
  nameEn: string;
  nameBm: string;
  code: string;
  capacity: number;
  occupied: number;
  priceMyr: number;
  status: FacilityStatus;
  smartLock?: boolean;
  iot?: boolean;
}

export interface RangerTask {
  id: string;
  titleEn: string;
  titleBm: string;
  category: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  status: 'open' | 'in_progress' | 'completed';
  assignee: string;
  dueAt: string;
}

export interface IotDevice {
  id: string;
  type: 'camera_ai' | 'waste_bin' | 'toilet' | 'smart_lock' | 'pool_sensor' | 'gateway';
  name: string;
  status: 'live' | 'warning' | 'offline';
  metric: string;
  value: string;
  battery?: number;
  quality?: number;
}

export interface Incident {
  id: string;
  type: 'wildlife' | 'safety' | 'facility' | 'weather';
  severity: 'P0' | 'P1' | 'P2';
  status: 'open' | 'acknowledged' | 'monitoring' | 'resolved';
  titleEn: string;
  titleBm: string;
  zone: string;
  latitude?: number;
  longitude?: number;
}

export interface Booking {
  id: string;
  facilityId: string;
  guestName: string;
  partySize: number;
  checkInDate: string;
  amountMyr: number;
  qrRef: string;
  smartLockPin?: string;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface SosAlert {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  familyCount: number;
  battery: number;
  etaMinutes: number;
  status: 'dispatched' | 'acknowledged' | 'resolved';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  ip: string;
  result: 'success' | 'warning' | 'blocked';
}

export interface DashboardSnapshot {
  generatedAt: string;
  offlineQueue: number;
  points: number;
  visitorsToday: number;
  visitorsOnTrail: number;
  carPark: { total: number; occupied: number; free: number; accuracy: number };
  healthIndex: number;
  revenueTodayMyr: number;
  forecastMonthMyr: number;
  roiPct: number;
  uptimePct: number;
  facilities: Facility[];
  tasks: RangerTask[];
  iot: IotDevice[];
  incidents: Incident[];
  bookings: Booking[];
  auditLogs: AuditLog[];
  visitorTrend: { time: string; visitors: number; capacity: number }[];
  revenueMix: { name: string; value: number }[];
  esg: { label: string; value: string; target: string }[];
  sla: { metric: string; value: string; target: string; pass: boolean }[];
  healthScores: { key: string; label: string; score: number; weight: number }[];
  checkpoints: { code: string; name: string; altitude?: number; stamped: boolean }[];
}
