// Isomorphic trail catalog + hike types shared by the React client and route handlers.
import type { Language } from './types';

export type Difficulty = 'Easy' | 'Moderate' | 'Hard';
export type WeatherCond = 'sun' | 'cloud' | 'rain';
export type HikeSource = 'gps' | 'simulated';

export interface Trail {
  id: string;
  nameEn: string;
  nameBm: string;
  locEn: string;
  locBm: string;
  difficulty: Difficulty;
  distanceKm: number;
  elevationM: number;
  estMinutes: number;
  estTimeEn: string;
  estTimeBm: string;
  rating: number;
  featured: boolean;
  gradient: string;
  emoji: string;
  tagsEn: string[];
  tagsBm: string[];
  descEn: string;
  descBm: string;
  checkpoints: string[];
}

export interface HikeSession {
  id: string;
  trailId: string;
  trailNameEn: string;
  trailNameBm: string;
  startedAt: string;
  durationSec: number;
  distanceKm: number;
  paceSecPerKm: number;
  elevationM: number;
  steps: number;
  caloriesKcal: number;
  source: HikeSource;
  seeded?: boolean;
}

export const TRAILS: Trail[] = [
  {
    id: 'lambak-family',
    nameEn: 'Gunung Lambak Family Loop',
    nameBm: 'Gelung Keluarga Gunung Lambak',
    locEn: 'Gunung Lambak Recreational Forest, Kluang, Johor',
    locBm: 'Hutan Lipur Gunung Lambak, Kluang, Johor',
    difficulty: 'Easy',
    distanceKm: 4.2,
    elevationM: 405,
    estMinutes: 135,
    estTimeEn: '2–2.5 h',
    estTimeBm: '2–2.5 jam',
    rating: 4.7,
    featured: true,
    gradient: 'linear-gradient(135deg,#14532d,#84cc16)',
    emoji: '🌳',
    tagsEn: ['Family loop', 'Passport checkpoints', 'Safe-zone 50 m'],
    tagsBm: ['Gelung keluarga', 'Cop passport', 'Zon selamat 50 m'],
    descEn:
      'The signature 4.2 km family loop winds gently through shaded rainforest to twin viewpoints and back past the base chalets, pool and BBQ area. Wide steps, handrails and five QR passport checkpoints make it ideal for families and elderly guests using linked 50 m safe-zone monitoring.',
    descBm:
      'Gelung keluarga 4.2 km yang terkenal ini mendaki perlahan melalui hutan hujan yang teduh ke dua puncak pandang dan kembali ke calet, kolam dan kawasan BBQ di pangkalan. Tangga lebar, pemegang tangan dan lima cop QR sesuai untuk keluarga serta warga emas dengan pemantauan zon selamat 50 m.',
    checkpoints: ['BASE', 'CP1', 'NORTH', 'SOUTH', 'MAST']
  },
  {
    id: 'lambak-north',
    nameEn: 'North Peak Trail (510 m)',
    nameBm: 'Denai Puncak Utara (510 m)',
    locEn: 'Gunung Lambak, Kluang, Johor',
    locBm: 'Gunung Lambak, Kluang, Johor',
    difficulty: 'Moderate',
    distanceKm: 3.1,
    elevationM: 510,
    estMinutes: 105,
    estTimeEn: '1.5–2 h',
    estTimeBm: '1.5–2 jam',
    rating: 4.6,
    featured: true,
    gradient: 'linear-gradient(135deg,#0d9488,#14532d)',
    emoji: '⛰️',
    tagsEn: ['Summit 510 m', 'Steps and rope section', 'Broadcasting mast'],
    tagsBm: ['Puncak 510 m', 'Tangga & bahagian tali', 'Tiang pemancar'],
    descEn:
      'The steeper direct line to the 510 m North Peak and the broadcasting mast. Expect concrete steps, a short assisted rope section and a breezy summit panorama over Kluang town. Stamp the NORTH passport checkpoint at the top.',
    descBm:
      'Laluan terus yang lebih curam ke Puncak Utara 510 m dan tiang pemancar. Ada tangga konkrit, bahagian tali pendek dan pemandangan luas ke atas bandar Kluang. Cop passport NORTH di puncak.',
    checkpoints: ['BASE', 'CP1', 'NORTH', 'MAST']
  },
  {
    id: 'lambak-south',
    nameEn: 'South Peak Trail (470 m)',
    nameBm: 'Denai Puncak Selatan (470 m)',
    locEn: 'Gunung Lambak, Kluang, Johor',
    locBm: 'Gunung Lambak, Kluang, Johor',
    difficulty: 'Moderate',
    distanceKm: 2.6,
    elevationM: 470,
    estMinutes: 90,
    estTimeEn: '1.5 h',
    estTimeBm: '1.5 jam',
    rating: 4.5,
    featured: false,
    gradient: 'linear-gradient(135deg,#1e3a5f,#22c0c7)',
    emoji: '🥾',
    tagsEn: ['Summit 470 m', 'Quieter route', 'Viewpoint shelter'],
    tagsBm: ['Puncak 470 m', 'Laluan lebih sunyi', 'Pondok pandang'],
    descEn:
      'A shorter, quieter climb to the 470 m South Peak with a sheltered viewpoint. A good choice when the North Peak is busy or for an afternoon hike before the park closes.',
    descBm:
      'Pendakian lebih pendek dan sunyi ke Puncak Selatan 470 m dengan pondok pandangan. Pilihan yang baik apabila Puncak Utara sibuk atau untuk mendaki sebelah petang.',
    checkpoints: ['BASE', 'CP1', 'SOUTH']
  },
  {
    id: 'belumut',
    nameEn: 'Gunung Belumut Summit',
    nameBm: 'Puncak Gunung Belumut',
    locEn: 'Gunung Belumut Recreational Forest, Kluang, Johor',
    locBm: 'Hutan Lipur Gunung Belumut, Kluang, Johor',
    difficulty: 'Hard',
    distanceKm: 7.0,
    elevationM: 1010,
    estMinutes: 420,
    estTimeEn: '6–8 h',
    estTimeBm: '6–8 jam',
    rating: 4.8,
    featured: true,
    gradient: 'linear-gradient(135deg,#7c2d12,#f59e0b)',
    emoji: '🌫️',
    tagsEn: ['Mossy forest', 'Stream crossings', 'Permit required'],
    tagsBm: ['Hutan berlumut', 'Rentasan sungai', 'Permit diperlukan'],
    descEn:
      'A full-day expedition to the 1,010 m summit through mossy dipterocarp forest with several stream crossings. A park permit, adequate water and an early start are essential; fit and prepared hikers only.',
    descBm:
      'Ekspedisi sehari penuh ke puncak 1,010 m melalui hutan dipterokarpa berlumut dengan beberapa rentasan sungai. Permit taman, air mencukupi dan mula awal adalah wajib; untuk pendaki cergas dan bersedia sahaja.',
    checkpoints: []
  },
  {
    id: 'ledang',
    nameEn: 'Gunung Ledang (Mount Ophir)',
    nameBm: 'Gunung Ledang (Gunung Ophir)',
    locEn: 'Gunung Ledang National Park, Tangkak, Johor',
    locBm: 'Taman Negara Gunung Ledang, Tangkak, Johor',
    difficulty: 'Hard',
    distanceKm: 9.5,
    elevationM: 1276,
    estMinutes: 540,
    estTimeEn: '8–10 h',
    estTimeBm: '8–10 jam',
    rating: 4.9,
    featured: false,
    gradient: 'linear-gradient(135deg,#312e81,#7c3aed)',
    emoji: '🏔️',
    tagsEn: ['Highest peak in Johor', 'Licensed guide required', 'Legendary summit'],
    tagsBm: ['Puncak tertinggi Johor', 'Pemandu berlesen wajib', 'Puncak legenda'],
    descEn:
      'The legendary 1,276 m highest point in Johor — a demanding ascent with ladders and near-vertical sections. A licensed guide and national-park booking are required. Listed as the Phase-2 expansion trail in the MPK smart-park programme.',
    descBm:
      'Puncak legenda 1,276 m yang tertinggi di Johor — pendakian mencabar dengan tangga dan bahagian hampir tegak. Pemandu berlesen dan tempahan taman negara wajib. Disenaraikan sebagai denai pengembangan Fasa 2 dalam program taman pintar MPK.',
    checkpoints: []
  },
  {
    id: 'hutan-bandar',
    nameEn: 'Hutan Bandar Kluang Green Loop',
    nameBm: 'Gelung Hijau Hutan Bandar Kluang',
    locEn: 'Hutan Bandar MPK, Kluang, Johor',
    locBm: 'Hutan Bandar MPK, Kluang, Johor',
    difficulty: 'Easy',
    distanceKm: 1.8,
    elevationM: 35,
    estMinutes: 45,
    estTimeEn: '45 min',
    estTimeBm: '45 minit',
    rating: 4.4,
    featured: false,
    gradient: 'linear-gradient(135deg,#15803d,#a3e635)',
    emoji: '🦆',
    tagsEn: ['Stroller friendly', 'Lake and playground', 'Flat and shaded'],
    tagsBm: ['Sesuai stroller', 'Tasik & taman permainan', 'Rata dan teduh'],
    descEn:
      'An easy, flat 1.8 km urban-park loop around the lake with playgrounds, picnic lawns and shade trees. Perfect for a warm-up walk, small children and visitors recovering after the main peak.',
    descBm:
      'Gelung taman bandar rata 1.8 km yang mudah mengelilingi tasik dengan taman permainan, kawasan berkelah dan pokok teduh. Sesuai untuk memanaskan badan, kanak-kanak kecil dan pelawat yang berehat selepas mendaki puncak.',
    checkpoints: []
  },
  {
    id: 'soga',
    nameEn: 'Bukit Soga Sunrise Steps',
    nameBm: 'Tangga Matahari Terbit Bukit Soga',
    locEn: 'Bukit Soga, Batu Pahat, Johor',
    locBm: 'Bukit Soga, Batu Pahat, Johor',
    difficulty: 'Moderate',
    distanceKm: 3.4,
    elevationM: 280,
    estMinutes: 120,
    estTimeEn: '2 h',
    estTimeBm: '2 jam',
    rating: 4.3,
    featured: false,
    gradient: 'linear-gradient(135deg,#b45309,#fbbf24)',
    emoji: '🌅',
    tagsEn: ['Telecom tower', 'Popular sunrise', 'Fitness steps'],
    tagsBm: ['Menara telekom', 'Popular waktu subuh', 'Tangga kecergasan'],
    descEn:
      'A well-maintained stepped neighbourhood hike popular for sunrise workouts, ending near the telecom tower. Reflective lighting and benches make it a safe early-morning training loop.',
    descBm:
      'Denai tangga kejiranan yang diselenggara baik, popular untuk senaman matahari terbit, berakhir berhampiran menara telekom. Lampu pemantul dan bangku menjadikannya gelung latihan awal pagi yang selamat.',
    checkpoints: []
  },
  {
    id: 'pulai',
    nameEn: 'Gunung Pulai Waterfall Trail',
    nameBm: 'Denai Air Terjun Gunung Pulai',
    locEn: 'Gunung Pulai Recreational Forest, Kulai, Johor',
    locBm: 'Hutan Lipur Gunung Pulai, Kulai, Johor',
    difficulty: 'Moderate',
    distanceKm: 5.0,
    elevationM: 654,
    estMinutes: 210,
    estTimeEn: '3–4 h',
    estTimeBm: '3–4 jam',
    rating: 4.5,
    featured: false,
    gradient: 'linear-gradient(135deg,#0e7490,#38bdf8)',
    emoji: '💦',
    tagsEn: ['Waterfall endpoint', 'Telekom station', 'Natural swimming hole'],
    tagsBm: ['Penghujung air terjun', 'Stesen Telekom', 'Kolam semula jadi'],
    descEn:
      'A rewarding 5 km climb through cool forest to a waterfall and natural swimming hole near the Telekom station. Check water levels before visiting; rain can make the rocks slippery.',
    descBm:
      'Pendakian 5 km yang berbaloi melalui hutan sejuk ke air terjun dan kolam semula jadi berhampiran stesen Telekom. Semak paras air sebelum datang; hujan boleh menyebabkan batu licin.',
    checkpoints: []
  }
];

export interface WeatherPoint {
  day: string;
  tempC: number;
  cond: WeatherCond;
}

// Kluang district forecast (demo feed — production wires the MET Malaysia adapter).
export const WEATHER_STRIP: WeatherPoint[] = [
  { day: 'Today', tempC: 28, cond: 'sun' },
  { day: 'Tue', tempC: 27, cond: 'cloud' },
  { day: 'Wed', tempC: 26, cond: 'rain' },
  { day: 'Thu', tempC: 27, cond: 'sun' },
  { day: 'Fri', tempC: 28, cond: 'cloud' }
];

export const HOURLY_FORECAST: { label: string; tempC: number; cond: WeatherCond }[] = [
  { label: 'Now', tempC: 28, cond: 'sun' },
  { label: '+1h', tempC: 27, cond: 'sun' },
  { label: '+2h', tempC: 26, cond: 'cloud' },
  { label: '+3h', tempC: 25, cond: 'rain' }
];

export const trailById = (id: string): Trail => TRAILS.find((trail) => trail.id === id) ?? TRAILS[0];

export const STEPS_PER_KM = 1350;

// Factory kept out of React render scope (uses wall-clock time / randomness).
export function buildHikeSession(input: {
  trail: Trail;
  durationSec: number;
  distanceKm: number;
  elevationM: number;
  source: HikeSource;
}): HikeSession {
  const distance = Math.max(0, input.distanceKm);
  return {
    id: `hike-${Date.now()}`,
    trailId: input.trail.id,
    trailNameEn: input.trail.nameEn,
    trailNameBm: input.trail.nameBm,
    startedAt: new Date(Date.now() - input.durationSec * 1000).toISOString(),
    durationSec: Math.max(1, Math.round(input.durationSec)),
    distanceKm: Number(distance.toFixed(2)),
    paceSecPerKm: distance > 0 ? Math.round(input.durationSec / distance) : 0,
    elevationM: Math.round(input.elevationM),
    steps: Math.round(distance * STEPS_PER_KM),
    caloriesKcal: Math.round(distance * 55),
    source: input.source
  };
}

export function trailName(trail: Trail, lang: Language) {
  return lang === 'BM' ? trail.nameBm : trail.nameEn;
}

export function trailLocation(trail: Trail, lang: Language) {
  return lang === 'BM' ? trail.locBm : trail.locEn;
}

export function difficultyLabel(difficulty: Difficulty, lang: Language) {
  if (lang === 'BM') return difficulty === 'Easy' ? 'Mudah' : difficulty === 'Moderate' ? 'Sederhana' : 'Sukar';
  return difficulty;
}

export function formatClock(totalSec: number) {
  const sec = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatPace(secPerKm: number) {
  if (!Number.isFinite(secPerKm) || secPerKm <= 0) return '—:—';
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
