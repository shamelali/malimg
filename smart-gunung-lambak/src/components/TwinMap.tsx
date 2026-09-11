'use client';

import { Camera, Car, Mountain, RadioTower, Recycle, Waves } from 'lucide-react';
import type { Language } from '@/lib/types';

const t = (lang: Language, en: string, bm: string) => (lang === 'BM' ? bm : en);

export type MapLayers = {
  safety: boolean;
  facilities: boolean;
  iot: boolean;
  wildlife: boolean;
  trails: boolean;
};

export function TwinMap({ lang, layers, onToggleLayer, onPin }: { lang: Language; layers: MapLayers; onToggleLayer: (key: keyof MapLayers) => void; onPin: (label: string) => void }) {
  const layerItems: { key: keyof MapLayers; en: string; bm: string }[] = [
    { key: 'safety', en: 'Safety', bm: 'Keselamatan' },
    { key: 'facilities', en: 'Facilities', bm: 'Fasiliti' },
    { key: 'iot', en: 'IoT & cameras', bm: 'IoT & kamera' },
    { key: 'wildlife', en: 'Wildlife zones', bm: 'Zon hidupan liar' },
    { key: 'trails', en: 'Trail network', bm: 'Rangkaian denai' }
  ];

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 p-3 dark:border-forest-500">
        <div>
          <h3 className="text-sm font-black">{t(lang, 'Digital twin lite • Gunung Lambak', 'Kembar digital ringan • Gunung Lambak')}</h3>
          <p className="text-[10px] font-bold text-slate-500 dark:text-emerald-100/70">2.0251°N, 103.3444°E • 4G coverage • Kluang</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {layerItems.map((layer) => (
            <label key={layer.key} className={`flex cursor-pointer items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-black ${layers[layer.key] ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-forest-500 dark:bg-forest-800 dark:text-emerald-50'}`}>
              <input type="checkbox" checked={layers[layer.key]} onChange={() => onToggleLayer(layer.key)} className="h-3 w-3" />
              {t(lang, layer.en, layer.bm)}
            </label>
          ))}
        </div>
      </div>

      <div className="map-grid relative h-[390px] overflow-hidden bg-gradient-to-br from-blue-50 via-emerald-50 to-teal-50 dark:from-forest-900 dark:via-forest-800 dark:to-[#0d2a26]">
        <svg viewBox="0 0 900 420" className="absolute inset-0 h-full w-full" role="img" aria-label="Stylised digital twin map">
          <defs>
            <linearGradient id="hillGrad" x1="0" x2="1">
              <stop offset="0%" stopColor="#028E8A" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#004AAD" stopOpacity="0.18" />
            </linearGradient>
          </defs>
          <path d="M35 330 C130 230 170 230 255 290 C330 345 390 80 520 115 C650 150 625 320 735 290 C800 270 835 230 870 210 L870 420 L35 420 Z" fill="url(#hillGrad)" />
          <path d="M65 340 C180 260 270 260 350 310 C430 360 500 160 590 170 C690 180 685 310 795 285" fill="none" stroke="#028E8A" strokeWidth="4" strokeDasharray={layers.trails ? '0' : '10 10'} opacity={layers.trails ? 0.9 : 0.2} />
          <path d="M265 292 C380 220 440 190 520 115 M520 115 C590 175 620 220 735 290" fill="none" stroke="#004AAD" strokeWidth="3" opacity={layers.trails ? 0.65 : 0.1} strokeDasharray="8 8" />
          {layers.wildlife && (
            <>
              <ellipse cx="330" cy="285" rx="82" ry="48" fill="#EF4444" opacity="0.13" />
              <ellipse cx="612" cy="232" rx="90" ry="56" fill="#D97706" opacity="0.15" />
              <ellipse cx="720" cy="315" rx="72" ry="42" fill="#16A34A" opacity="0.13" />
              <text x="300" y="247" fontSize="15" fontWeight="900" fill="#991B1B">ZONE A HIGH</text>
              <text x="575" y="201" fontSize="15" fontWeight="900" fill="#92400E">ZONE B MED</text>
              <text x="690" y="363" fontSize="15" fontWeight="900" fill="#166534">ZONE C LOW</text>
            </>
          )}
          {layers.safety && <circle cx="420" cy="235" r="58" fill="none" stroke="#EF4444" strokeWidth="4" strokeDasharray="7 7" />}
        </svg>

        {layers.facilities && (
          <>
            <MapPinButton x="8%" y="76%" icon={<Car className="h-4 w-4" />} label="Car park 87/120" onClick={() => onPin('Base car park • 87/120 • AI 97.4%')} />
            <MapPinButton x="20%" y="66%" icon={<Waves className="h-4 w-4" />} label="Pool 45/80" onClick={() => onPin('Pool • pH 7.2 • 45/80')} />
            <MapPinButton x="16%" y="52%" icon={<Mountain className="h-4 w-4" />} label="Chalets 6/10" onClick={() => onPin('Chalet cluster • smart lock QR+PIN')} />
          </>
        )}
        {layers.iot && (
          <>
            <MapPinButton x="12%" y="84%" icon={<Camera className="h-4 w-4" />} label="Entry AI camera" onClick={() => onPin('Entry camera AI • 97.4% accuracy')} />
            <MapPinButton x="35%" y="64%" icon={<Recycle className="h-4 w-4" />} label="Bin A1 90%" tone="amber" onClick={() => onPin('Smart bin A1 • 90% full • dispatch cleaning')} />
            <MapPinButton x="58%" y="20%" icon={<RadioTower className="h-4 w-4" />} label="Broadcasting mast" onClick={() => onPin('Broadcasting mast trail checkpoint')} />
          </>
        )}
        <MapPinButton x="55%" y="22%" icon={<Mountain className="h-4 w-4" />} label="North 510m" tone="teal" onClick={() => onPin('North peak • 510m • checkpoint')} />
        <MapPinButton x="76%" y="63%" icon={<Mountain className="h-4 w-4" />} label="South 470m" tone="teal" onClick={() => onPin('South peak • 470m • checkpoint')} />

        <div className="absolute bottom-3 left-3 rounded-2xl bg-white/90 p-3 text-[11px] font-bold shadow-lg backdrop-blur dark:bg-forest-900/90">
          <div className="font-black">Family loop: 4.2 km</div>
          <div className="text-slate-500 dark:text-emerald-100/70">Grade 3/10 • 1h 16m • full 4G</div>
        </div>
      </div>
    </div>
  );
}

function MapPinButton({ x, y, icon, label, onClick, tone = 'blue' }: { x: string; y: string; icon: React.ReactNode; label: string; onClick: () => void; tone?: 'blue' | 'teal' | 'amber' }) {
  const colors = {
    blue: 'bg-brand-600 text-white border-white',
    teal: 'bg-teal-500 text-white border-white',
    amber: 'bg-amber-500 text-white border-white'
  };
  return (
    <button type="button" onClick={onClick} className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5" style={{ left: x, top: y }}>
      <span className={`grid h-8 w-8 place-items-center rounded-full border-2 shadow-lg ${colors[tone]}`}>{icon}</span>
      <span className="hidden rounded-full bg-white/90 px-2 py-1 text-[9px] font-black text-slate-700 shadow md:inline dark:bg-forest-900/90 dark:text-emerald-50">{label}</span>
    </button>
  );
}
