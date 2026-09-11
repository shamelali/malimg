// Isomorphic MPK multi-park catalog shared by the admin UI and /api/v1/parks.
import type { Language } from './types';

export type ParkStatus = 'active' | 'coming_soon' | 'phase2' | 'template';

export interface Park {
  id: string;
  nameEn: string;
  nameBm: string;
  status: ParkStatus;
  budgetMyr: string;
  region: string;
}

export const PARKS: Park[] = [
  { id: 'gunung-lambak', nameEn: 'Gunung Lambak PILOT', nameBm: 'Gunung Lambak PERINTIS', status: 'active', budgetMyr: '2.8M', region: 'Kluang' },
  { id: 'gunung-belumut', nameEn: 'Gunung Belumut', nameBm: 'Gunung Belumut', status: 'coming_soon', budgetMyr: 'Planning', region: 'Kluang' },
  { id: 'gunung-ledang', nameEn: 'Gunung Ledang Phase 2', nameBm: 'Gunung Ledang Fasa 2', status: 'phase2', budgetMyr: '3.2–4.0M', region: 'Tangkak' },
  { id: 'hutan-bandar', nameEn: 'Hutan Bandar Kluang', nameBm: 'Hutan Bandar Kluang', status: 'template', budgetMyr: 'Template', region: 'Kluang' }
];

export function parkStatusLabel(status: ParkStatus, lang: Language): string {
  if (lang === 'BM') {
    return status === 'active' ? 'AKTIF' : status === 'coming_soon' ? 'AKAN DATANG' : status === 'phase2' ? 'FASA 2' : 'TEMPLATE';
  }
  return status === 'active' ? 'ACTIVE' : status === 'coming_soon' ? 'COMING SOON' : status === 'phase2' ? 'PHASE 2' : 'TEMPLATE';
}
