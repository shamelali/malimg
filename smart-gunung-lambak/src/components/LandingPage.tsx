'use client';

import { Fragment, useEffect, useState } from 'react';
import Link from 'next/link';
import { SocialLogin } from '@/components/SocialLogin';
import {
  ArrowRight,
  BarChart3,
  Code2,
  Compass,
  Database,
  Download,
  Gauge,
  Languages,
  Leaf,
  MapPin,
  Menu,
  Mountain,
  RadioTower,
  Shield,
  Sparkles,
  Wrench,
  X
} from 'lucide-react';

const t = (lang: 'EN' | 'BM', en: string, bm: string) => (lang === 'BM' ? bm : en);

const contourLines = [
  'M-80,540 C120,430 220,410 340,460 C470,515 560,430 700,455 C790,471 870,455 940,430',
  'M-80,600 C100,490 240,470 360,520 C490,575 590,495 720,520 C810,536 890,520 950,498',
  'M-80,665 C130,545 260,530 380,580 C510,635 610,560 740,583 C840,600 900,585 950,565',
  'M-80,730 C150,610 280,595 400,645 C530,700 630,625 760,648 C860,665 920,650 950,635'
];

const mountainPath =
  'M0,430 C90,350 128,262 172,214 C196,188 214,196 226,224 C242,260 250,302 268,340 ' +
  'C286,378 318,392 348,398 C372,403 398,398 418,382 C452,356 456,320 480,302 ' +
  'C504,284 530,300 552,330 C570,354 580,372 602,388 C636,412 688,420 760,424 L800,430 Z';

const birdPath = 'M0,0 C0,-34 20,-58 46,-66 C24,-44 30,-18 44,0 L20,-10 L14,-6 L0,0 Z';

const rolodexLabels = [
  'VOLCANIC PLUG',
  '2.5 BILLION-YEAR-OLD',
  '510 M NORTH PEAK',
  'RM 2.8 M PILOT',
  'MPK KLUANG',
  'DUTA INTEGRA SOLUTIONS',
  '7 ROLES · 23 API ROUTES',
  'EN · BM · PWA · IoT',
  '8 TRAILS · 4 PARKS'
];

const rolodexItems = [
  {
    inner: 'EXPEDITION TIMELINE',
    rows: [
      ['MONTH', 'MILESTONE'],
      ['M1–M2', 'Digital twin & IoT survey'],
      ['M3–M4', 'AI parking + bookings live'],
      ['M5–M6', 'Ranger tablets & offline queue'],
      ['M7–M8', 'SOS, consent & e-ticket'],
      ['M9–M12', 'SaaS rollout, SLA & DR'],
      ['PILOT', 'SOFT GO-LIVE ON PEAKS']
    ]
  },
  {
    inner: 'BUDGET · RM 2.8 M',
    rows: [
      ['PERIOD', 'COMMITMENT'],
      ['YEAR 1', '41%'],
      ['YEAR 2', '26%'],
      ['YEAR 3', '19%'],
      ['OPS', '9%'],
      ['CONTINGENCY', '5%'],
      ['ROI TARGET', '23.5% YEAR 1']
    ]
  },
  {
    inner: 'SLA COMMITMENTS',
    rows: [
      ['METRIC', 'TARGET'],
      ['UPTIME', '99.9%'],
      ['RPO / RTO', '15M / 60M'],
      ['MTTR', '< 30M'],
      ['SOS ACK', '< 60S'],
      ['GPS SUCCESS', '> 98%'],
      ['ALERT PROPAGATION', '< 3S']
    ]
  },
  {
    inner: 'IOT INVENTORY',
    rows: [
      ['DEVICE', 'SIGNAGE VIA API'],
      ['CAMERA AI', '97.4% ACCURACY'],
      ['ULTRASONIC BINS', 'FILL LEVEL'],
      ['AMMONIA TOILETS', 'NH₃ / USAGE'],
      ['TTLOCK', 'QR + PIN'],
      ['POOL SENSOR', 'PH / HEADCOUNT'],
      ['4G · MQTT GATEWAY', '1.8S ALERTS']
    ]
  }
];

const zooAnimals = [
  { label: 'LONG-TAILED MACAQUE', zone: 'ZONE A', risk: 'HIGH', cls: 'text-red-300', emoji: '🐒' },
  { label: 'PIG-TAILED MACAQUE', zone: 'ZONE B', risk: 'MED', cls: 'text-amber-300', emoji: '🐷' },
  { label: 'DUSKY LEAF MONKEY', zone: 'ZONE C', risk: 'LOW', cls: 'text-lime-300', emoji: '🐒' },
  { label: 'HORNBILL', zone: 'CANOPY', risk: '—', cls: 'text-teal-300', emoji: '🐦' },
  { label: 'FLYING LIZARD', zone: 'BANDANA', risk: '—', cls: 'text-emerald-300', emoji: '🦎' }
];

const stampIndex = [2, 0, 1, 2, 3, 2, 4];

type ModuleId = 'visitor' | 'ranger' | 'command' | 'admin' | 'api' | 'sla' | 'mobile';

const modules: Record<ModuleId, { id: ModuleId; en: string; bm: string; verb: string; desc: string; icon: React.ElementType }> = {
  visitor: {
    id: 'visitor',
    en: 'Visitor',
    bm: 'Pelawat',
    verb: 'WALK-IN App',
    desc: 'QR passport, live car-park grid, chalet & BBQ booking, 50 m family safe-zone, one-tap wildlife and SOS.',
    icon: Compass
  },
  ranger: {
    id: 'ranger',
    en: 'Ranger',
    bm: 'Renjer',
    verb: 'TABLET',
    desc: 'Offline-first task board, facility status cycling, IoT device health and a 50-item offline queue.',
    icon: Wrench
  },
  command: {
    id: 'command',
    en: 'Command Centre',
    bm: 'Pusat Kawalan',
    verb: 'DIGITAL TWIN LITE',
    desc: 'Layered SVG twin map, incidents, ESG ledger, AI capacity forecast and weighted health index.',
    icon: BarChart3
  },
  admin: {
    id: 'admin',
    en: 'SaaS Admin',
    bm: 'Pentadbir SaaS',
    verb: 'MULTI-PARK',
    desc: 'Four MPK parks, RBAC with MFA, resident audit log, CSV export and versioned facility config.',
    icon: Shield
  },
  api: {
    id: 'api',
    en: 'API & Integrations',
    bm: 'API & Integrasi',
    verb: '23 ROUTES',
    desc: 'OpenAPI 3.1 contract, in-browser Try It console, IoT ingest and an immutable-style audit trail.',
    icon: Code2
  },
  sla: {
    id: 'sla',
    en: 'SLA & Budget',
    bm: 'SLA & Belanjawan',
    verb: 'ENTERPRISE VIEW',
    desc: 'RPO/RTO, MTTR, DR restore drills, webhook latency and a MYR 2.8 M line-item budget.',
    icon: Gauge
  },
  mobile: {
    id: 'mobile',
    en: 'Mobile',
    bm: 'Mudah Alih',
    verb: 'PWA + CAPACITOR',
    desc: 'Installable PWA with offline cache and IndexedDB replay, wrapped for Android with Capacitor 7.',
    icon: Download
  }
};

const handbookRows = [
  ['01 · VISITOR & FAMILY', 'SAFE-ZONE CONSENT'],
  ['02 · RANGER', 'OFFLINE TABLET'],
  ['03 · CHALET OPERATOR', 'SMART LOCKS'],
  ['04 · PARK MANAGER', 'MULTI-PARK SAAS'],
  ['05 · FINANCE', 'SETTLEMENT EXPORT'],
  ['06 · AUDITOR', 'RESIDENT AUDIT LOG'],
  ['07 · SUPER ADMIN', 'RESTORE DRILLS']
];

const routeData = [
  { code: 'GET /api/v1/health', desc: 'PROBE + DATABASE MODE', state: '200 · POSTGRES_OK' },
  { code: 'POST /api/v1/bookings', desc: 'QR REF + SMART-LOCK PIN', state: '201 · CREATED' },
  { code: 'GET /api/v1/forecast', desc: 'PARKING-FULL ETA · STAFF', state: '200 · 92% CONF.' },
  { code: 'POST /api/v1/sos', desc: 'DISPATCH TO MPK · APM', state: '201 · ETA 8 MIN' },
  { code: 'POST /api/v1/consent', desc: 'PDPA DECISION MIRROR', state: '201 · AUDITED' },
  { code: 'GET /api/v1/openapi', desc: 'OPENAPI 3.1 CONTRACT', state: '200 · JSON' }
];

const securityRows = [
  ['X-CONTENT-TYPE-OPTIONS', 'NOSNIFF'],
  ['STRICT-TRANSPORT-SECURITY', '63072000'],
  ['REFERRER-POLICY', 'STRICT-ORIGIN'],
  ['PERMISSIONS-POLICY', 'CAMERA · GEO'],
  ['HSTS PRELOAD', 'ENABLED'],
  ['RBAC + DEMO MFA', '7 ROLES']
];

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return mounted;
}

export default function LandingPage() {
  const [lang, setLang] = useState<'EN' | 'BM'>('EN');
  const [open, setOpen] = useState(false);
  const [module, setModule] = useState<ModuleId | null>(null);
  const mounted = useMounted();

  return (
    <div className="landing-root">
      <TopBar lang={lang} onLang={() => setLang((value) => (value === 'EN' ? 'BM' : 'EN'))} open={open} onMenu={() => setOpen((value) => !value)} onClose={() => setOpen(false)} />

      {/* HERO */}
      <header className="landing-hero relative overflow-hidden">
        <div className="landing-noise" aria-hidden="true" />
        <svg className="landing-contours" aria-hidden="true" viewBox="0 0 1000 800" preserveAspectRatio="none">
          {contourLines.map((d, i) => (
            <path key={i} d={d} fill="none" stroke="currentColor" strokeWidth="1" opacity={0.16 + i * 0.03} className="landing-contour" style={{ animationDelay: `${i * 0.6}s` }} />
          ))}
          <path d={mountainPath} fill="url(#mtnGrad)" opacity="0.9" />
          <defs>
            <linearGradient id="mtnGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f2e2a" />
              <stop offset="100%" stopColor="#173f38" />
            </linearGradient>
          </defs>
        </svg>
        <div className="landing-gradient-sky" aria-hidden="true" />
        <div className="landing-light" aria-hidden="true" />
        <div className="landing-grid-overlay" aria-hidden="true" />

        <div className="landing-hero-grid relative mx-auto grid max-w-7xl gap-10 px-6 pb-24 pt-16 lg:grid-cols-12 lg:pb-32 lg:pt-24">
          <div className="relative z-10 lg:col-span-7">
            <div className="landing-kicker">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t(lang, 'MPK Kluang · Smart-Park Pilot · Duta Integra Solutions', 'MPK Kluang · Perintis Taman Pintar · Duta Integra Solutions')}</span>
            </div>
            <h1 className="landing-hero-title mt-6">
              {t(lang, 'A mountain, made', 'Sebuah gunung,')}
              <br />
              <em className="landing-hero-it">{t(lang, 'an operating system.', 'dijadikan sistem operasi.')}</em>
            </h1>
            <p className="landing-hero-sub mt-6 max-w-xl">
              {t(
                lang,
                'Smart Gunung Lambak fuses an ancient trail with live civic technology — AI camera parking, QR passport stamps, 50 m family geofences and P0 SOS to MPK, APM and clinic. One source of truth for every role on the mountain.',
                'Smart Gunung Lambak menggabungkan denai purba dengan teknologi sivik langsung — parkir kamera AI, cop passport QR, geofens keluarga 50 m dan SOS P0 ke MPK, APM dan klinik. Satu sumber kebenaran untuk setiap peranan di gunung.'
              )}
            </p>

            <div className="landing-cta-group mt-9">
              <LandingLink className="landing-btn-primary" href="/app">
                {t(lang, 'Enter the command centre', 'Masuk pusat kawalan')}
                <ArrowRight className="landing-btn-arrow" />
              </LandingLink>
              <LandingLink className="landing-btn-ghost" href="/app?view=visitor">
                {t(lang, 'Try the visitor app', 'Cuba aplikasi pelawat')}
              </LandingLink>
            </div>

            <div className="landing-social-divider">
              <span>{t(lang, 'or sign in with', 'atau log masuk dengan')}</span>
            </div>
            <SocialLogin lang={lang} />

            <div className="landing-hero-facts mt-10 grid grid-cols-3 gap-px border border-white/10 bg-white/10 text-white">
              <Fact value={'510'} unit={t(lang, 'M', 'M')} label={t(lang, 'NORTH PEAK', 'PUNCAK UTARA')} />
              <Fact value={'23'} unit={t(lang, 'API ROUTES', 'LALUAN API')} label={t(lang, 'LIVE', 'LANGSUNG')} />
              <Fact value={'SOS'} unit={'8 MIN'} label={t(lang, 'MPK · APM · CLINIC', 'MPK · APM · KLINIK')} />
            </div>
          </div>

          <div className="relative lg:col-span-5">
            <div className="landing-hero-stamp-wrap" style={{ opacity: mounted ? 1 : 0, transitionDelay: '500ms' }}>
              <HeroStamp lang={lang} />
            </div>
          </div>
        </div>

        <div className="landing-marquee" aria-hidden="true">
          <div className="landing-marquee-track">
            {[...rolodexLabels, ...rolodexLabels].map((item, index) => (
              <span key={index} className="landing-marquee-item">
                {item} <span className="text-teal-400">✳</span>
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* ROLODEX / ROUTE STRIP */}
      <section className="landing-rolodex" aria-label={t(lang, 'Programme at a glance', 'Program sepintas lalu')}>
        <div className="mx-auto max-w-7xl px-6 py-14 lg:py-16">
          <div className="landing-rolodex-track">
            {rolodexItems.map((item, index) => (
              <div key={index} className="landing-rolodex-cell">
                <div className="landing-rolodex-inner">
                  <div className="landing-rolodex-head">{item.inner}</div>
                  <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5">
                    {item.rows.map(([a, b]) => (
                      <Fragment key={a}>
                        <span className="landing-rolodex-k">{a}</span>
                        <span className="landing-rolodex-v">{b}</span>
                      </Fragment>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODULES */}
      <section className="landing-section landing-section-paper relative" id="modules">
        <div className="landing-noise-white" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-28">
          <SectionHeading
            kicker={t(lang, 'ONE MOUNTAIN · SEVEN WORKSPACES', 'SATU GUNUNG · TUJUH RUANG KERJA')}
            title={t(lang, 'Everyone on the mountain, in the loop.', 'Semua di atas gunung, dalam gelung.')}
            sub={t(
              lang,
              'From a visitor’s flip-flops to the superintendent’s desk — every role gets a sharp, dedicated pane of the same live truth.',
              'Dari selipar pelawat ke meja penguasa — setiap peranan mendapat panel tajam dan khusus daripada kebenaran langsung yang sama.'
            )}
          />

          <div className="landing-modules">
            {(Object.keys(modules) as ModuleId[]).map((key, index) => {
              const item = modules[key];
              const Icon = item.icon;
              return (
                <article key={key} className="landing-module" style={{ animationDelay: `${index * 70}ms` }}>
                  <span className="landing-module-index">{String(index + 1).padStart(2, '0')}</span>
                  <div className="flex items-start justify-between gap-3">
                    <span className="landing-module-icon"><Icon /></span>
                    <span className="landing-module-verb">{item.verb}</span>
                  </div>
                  <h3 className="landing-module-title">{item.en}</h3>
                  <p className="landing-module-desc">{item.desc}</p>
                  <button type="button" onClick={() => setModule(item.id)} className="landing-module-link">
                    {t(lang, 'Enter workspace', 'Masuki ruang kerja')} <ArrowRight />
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* TWIN PEAKS ANNOTATED SECTION */}
      <section className="landing-section landing-section-dark relative overflow-hidden" id="twin">
        <div className="landing-grid-overlay" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-28">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
            <div>
              <SectionHeading
                dark
                kicker={t(lang, 'LEGEND K2-2 · NORTH 510 M · SOUTH 470 M', 'LEGENDA K2-2 · UTARA 510 M · SELATAN 470 M')}
                title={t(lang, 'The 4.2 km loop, annotated.', 'Gelung 4.2 km, dianotasi.')}
                sub={t(
                  lang,
                  'A digital twin painted on paper — layered, labelled and live. Toggle safety, facilities, wildlife and trail mesh from the command centre.',
                  'Kembar digital yang dilukis di atas kertas — berlapis, berlabel dan langsung. Togol keselamatan, fasiliti, hidupan liar dan jaringan denai dari pusat kawalan.'
                )}
              />
              <ul className="landing-legend-list">
                {(
                  [
                    [Compass, t(lang, '5 QR passport stamps — BASE · CP1 · NORTH · SOUTH · MAST', '5 cop QR — BASE · CP1 · NORTH · SOUTH · MAST')],
                    [Shield, t(lang, '50 m family safe-zone on the family loop', 'Zon selamat keluarga 50 m di gelung keluarga')],
                    [Leaf, t(lang, 'Monkey-risk zones A · B · C with ML prediction', 'Zon risiko monyet A · B · C dengan ramalan ML')],
                    [RadioTower, t(lang, 'Full 4G along the ridge; 1.8 s alert propagation', '4G penuh di rabung; penyebaran amaran 1.8 s')],
                    [MapPin, t(lang, 'GPS success 99.1% — browser, native or demo fallback', 'Kejayaan GPS 99.1% — pelayar, asli atau luaran demo')]
                  ] as [React.ElementType, string][]
                ).map(([Icon, text], index) => {
                  const Tag = Icon;
                  return (
                    <li key={index} className="landing-legend-item">
                      <Tag className="landing-legend-icon" />
                      <span>{text}</span>
                    </li>
                  );
                })}
              </ul>
              <button type="button" onClick={() => setModule('command')} className="landing-btn-ghost-dark mt-8">
                {t(lang, 'Open the live twin — data seat', 'Buka kembar langsung — tempat duduk data')}
                <ArrowRight />
              </button>
            </div>

            <div className="landing-map-wrap">
              <div className="landing-map" aria-hidden="true">
                <h4 className="landing-map-title">GUNUNG LAMBAK · 2.0251°N 103.3444°E</h4>
                <div className="landing-map-inner">
                  <div className="landing-map-bird" style={{ left: '17%', top: '20%' }}>
                    <svg viewBox="-12 -18 96 60" className="w-full"><path d={birdPath} fill="#E8F6A0" /></svg>
                  </div>
                  <svg viewBox="0 0 600 460" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                    <path d={mountainPath} fill="#1f5247" />
                    <path d="M0,448 C200,448 400,448 600,448 L600,460 L0,460 Z" fill="#12332d" />
                    <path d="M120,300 C220,100 340,90 470,270" fill="none" stroke="#f5c518" strokeWidth="2" strokeDasharray="2 7" opacity="0.75" />
                    <path d="M240,470 C300,300 300,200 300,90" fill="none" stroke="#7df3d1" strokeWidth="1.4" strokeDasharray="5 5" opacity="0.5" />
                  </svg>
                  <span className="landing-map-pin landing-map-peak" style={{ left: '49%', top: '16%' }}><b>NORTH 510M</b>· CP</span>
                  <span className="landing-map-pin" style={{ left: '30%', top: '56%' }}>THIN AIR</span>
                  <span className="landing-map-pin landing-map-pin-red" style={{ left: '62%', top: '70%' }}>ZONE A · MACAQUE</span>
                  <span className="landing-map-pin" style={{ left: '78%', top: '44%' }}>ZONE B · BERUK</span>
                  <span className="landing-map-pin landing-map-pin-green" style={{ left: '84%', top: '80%' }}>ZONE C · LOTONG</span>
                  <span className="landing-map-pin" style={{ left: '14%', top: '80%' }}>BASE · CP1</span>
                  <span className="landing-map-pin landing-map-pin-dashed" style={{ left: '44%', top: '34%' }}>MAST · 4G</span>
                  <label className="landing-map-chk"><input type="checkbox" defaultChecked /> SAFETY</label>
                  <label className="landing-map-chk landing-map-chk-y"><input type="checkbox" defaultChecked /> WILDLIFE</label>
                  <label className="landing-map-chk landing-map-chk-t"><input type="checkbox" defaultChecked /> TRAILS</label>
                  <label className="landing-map-chk landing-map-chk-g"><input type="checkbox" defaultChecked /> IOT CAMS</label>
                  <div className="landing-map-legend">FAMILY LOOP 4.2 KM · GRADE 3/10 · 4G SHADED</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ZOOLOGICAL SOCIETY SPEC SHEETS */}
      <section className="landing-section landing-section-paper relative" id="zoo">
        <div className="landing-noise-white" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            <div>
              <SectionHeading
                kicker={t(lang, 'JH ZOOLOGICAL SOCIETY · SPECIMEN SHEETS', 'PERSATUAN ZOOLOGI JH · HELAIAN SPESIMEN')}
                title={t(lang, 'The resident cast.', 'Ahli tetap penduduk.')}
                sub={t(
                  lang,
                  'The trail’s wildlife is part of the safety system. Each species carries an ML risk zone — rangers get the report before you reach the bend.',
                  'Hidupan liar denai adalah sebahagian sistem keselamatan. Setiap spesies membawa zon risiko ML — renjer menerima laporan sebelum anda tiba di selekoh.'
                )}
              />
              <div className="landing-stamp-row" aria-hidden="true">
                {stampIndex.map((item, index) => (
                  <span key={index} className="landing-stamp" style={{ transform: `rotate(${item * 7 - 14}deg)`, animationDelay: `${index * 120}ms` }}>
                    SMART LAMBAK · FIELD STAMP
                  </span>
                ))}
              </div>
            </div>

            <div className="landing-zoo">
              {zooAnimals.map((animal, index) => (
                <div key={index} className="landing-specimen">
                  <div className="landing-specimen-art">
                    <span className="landing-specimen-emoji">{animal.emoji}</span>
                    <span className="landing-specimen-no">№ {String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <div className="landing-specimen-body">
                    <div className="landing-specimen-label">{animal.label}</div>
                    <div className="landing-specimen-meta">
                      <span className="landing-specimen-zone">{animal.zone}</span>
                      <span className={animal.cls}>{animal.risk}</span>
                    </div>
                  </div>
                </div>
              ))}
              <aside className="landing-zoo-note">
                <Bird emoji="🐒" />
                {t(
                  lang,
                  'Machine-learning detection on every camera; conservation levy ring-fenced. Tap report on the trail — GPS attached.',
                  'Pengesanan pembelajaran mesin pada setiap kamera; levi pemuliharaan dikhaskan. Tekan lapor di denai — GPS dilampirkan.'
                )}
              </aside>
            </div>
          </div>
        </div>
      </section>

      {/* HANDBOOK ROLODEX */}
      <section className="landing-section landing-section-dark relative" id="handbooks">
        <div className="landing-grid-overlay" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-28">
          <SectionHeading
            dark
            kicker={t(lang, 'OPERATING MANUALS · 7 ROLES', 'MANUAL OPERASI · 7 PERANAN')}
            title={t(lang, 'No one improvises on the mountain.', 'Tiada siapa berimprovisasi di gunung.')}
            sub={t(
              lang,
              'Battle-tested handbooks take every operator from first sign-in to audit-ready operations.',
              'Buku panduan yang teruji membawa setiap pengendali dari log masuk pertama ke operasi sedia-audit.'
            )}
          />
          <div className="landing-handbooks">
            {handbookRows.map(([title, sub], index) => (
              <article key={index} className="landing-handbook">
                <div className="flex items-center gap-3">
                  <span className="landing-handbook-no">{title.split(' · ')[0]}</span>
                  <div>
                    <h3 className="landing-handbook-title">{title.split(' · ').slice(1).join(' · ')}</h3>
                    <p className="landing-handbook-sub">{sub}</p>
                  </div>
                </div>
                <ArrowRight className="landing-handbook-arrow" />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ROUTE CONSOLE */}
      <section className="landing-section landing-section-paper relative" id="api">
        <div className="landing-noise-white" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-28">
          <div className="grid gap-14 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <SectionHeading
                kicker="REST · /api/v1 · OPENAPI 3.1"
                title={t(lang, 'The contract behind the counters.', 'Kontrak di sebalik kaunter.')}
                sub={t(
                  lang,
                  'State, bookings, SOS, consent and device telemetry travel over the same same-origin JSON the UI uses. Try any endpoint live in the browser.',
                  'Keadaan, tempahan, SOS, kebenaran dan telemetri peranti melalui JSON asal yang sama digunakan UI. Cuba mana-mana hujung API secara langsung dalam pelayar.'
                )}
              />
              <div className="landing-security mt-8">
                {securityRows.map(([k, v], index) => (
                  <div key={index} className="landing-security-row">
                    <span>{k}</span>
                    <span>{v}</span>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setModule('api')} className="landing-btn-dark mt-8">
                <Code2 /> {t(lang, 'Open the API console', 'Buka konsol API')}
                <ArrowRight />
              </button>
            </div>

            <div className="lg:col-span-7">
              <div className="landing-terminal-wrap">
                <div className="landing-terminal">
                  <div className="landing-terminal-head">
                    <span />
                    <span />
                    <span />
                    <code>smart-lambak — route handlers</code>
                  </div>
                  <div className="landing-terminal-body">
                    {routeData.map((item, index) => (
                      <div key={index} className="landing-terminal-row">
                        <span className="landing-terminal-dot" />
                        <div className="grid min-w-0 flex-1 gap-1 sm:grid-cols-[1fr_auto]">
                          <code className="landing-terminal-code">{item.code}</code>
                          <span className="landing-terminal-desc">{item.desc}</span>
                        </div>
                        <span className="landing-terminal-state">{item.state}</span>
                      </div>
                    ))}
                  </div>
                  <div className="landing-terminal-foot" aria-hidden="true">
                    <span>RATE LIMIT 120/MIN</span>
                    <span>HSTS PRELOAD</span>
                    <span>AUDIT IMMUTABLE</span>
                    <span>DR DRILL READY</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-section landing-section-paper landing-cta relative overflow-hidden">
        <div className="landing-noise-white" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 text-center lg:py-32">
          <div className="landing-cta-halo" aria-hidden="true" />
          <h2 className="landing-cta-title">
            {t(lang, 'The mountain is waiting', 'Gunung menunggu')} <br />
            <em>{t(lang, 'for its logbook.', 'jurnalnya.')}</em>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm font-bold leading-relaxed text-stone-600">
            {t(
              lang,
              'Soft go-live across all seven workspaces — visitor, ranger, command, admin, API, SLA and budget — backed by the smoke-tested PostgreSQL pilot.',
              'Go-live lembut merentas ketujuh-tujuh ruang kerja — pelawat, renjer, perintah, admin, API, SLA dan belanjawan — disokong perintis PostgreSQL yang diuji.'
            )}
          </p>
          <div className="landing-cta-group land-cta-center mt-9">
            <LandingLink className="landing-btn-primary" href="/app">
              {t(lang, 'Enter the command centre', 'Masuk pusat kawalan')}
              <ArrowRight className="landing-btn-arrow" />
            </LandingLink>
            <LandingLink className="landing-btn-ghost-dark" href="/api/v1/openapi" target="_blank">
              <Code2 /> {t(lang, 'Read the API contract', 'Baca kontrak API')}
            </LandingLink>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-5">
              <div className="landing-footer-mark">
                <Mountain className="h-5 w-5" />
                <span>SMART GUNUNG LAMBAK</span>
              </div>
              <p className="mt-4 max-w-sm text-xs font-semibold leading-relaxed text-stone-500">
                {t(
                  lang,
                  'A Duta Integra Solutions build for MPK Kluang. Responsive web, installable PWA, PostgreSQL/Drizzle, IoT, AI forecast and audit-ready by design.',
                  'Binaan Duta Integra Solutions untuk MPK Kluang. Web responsif, PWA boleh pasang, PostgreSQL/Drizzle, IoT, ramalan AI dan sedia-audit sejak awal.'
                )}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {['NEXT.JS 16', 'REACT 19', 'POSTGRESQL', 'DRIZZLE', 'CAPACITOR 7', 'TAILWIND V4'].map((tag) => (
                  <span key={tag} className="landing-footer-tag">{tag}</span>
                ))}
              </div>
            </div>
            <div className="md:col-span-3">
              <h4 className="landing-footer-head">{t(lang, 'Enter as', 'Masuk sebagai')}</h4>
              <ul className="mt-4 space-y-2">
                {['Visitor', 'Ranger', 'Command', 'Admin', 'API', 'SLA', 'Budget'].map((item, index) => (
                  <li key={item}>
                    <a href={`/app?view=${item.toLowerCase()}`} className="landing-footer-link">
                      {String(index + 1).padStart(2, '0')} · {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-4">
              <h4 className="landing-footer-head">{t(lang, 'Charts & maps', 'Carta & peta')}</h4>
              <ul className="mt-4 space-y-2">
                <li><a href="/app?view=ranger" className="landing-footer-link">Ranger task board & IoT health</a></li>
                <li><a href="/app?view=command" className="landing-footer-link">Digital twin + incident ledger</a></li>
                <li><a href="/app?view=api" className="landing-footer-link">Live API Try It console</a></li>
                <li><a href="/app?view=sla" className="landing-footer-link">RPO / RTO & DR drills</a></li>
                <li><a href="/app?view=budget" className="landing-footer-link">MYR 2.8 M budget breakdown</a></li>
              </ul>
            </div>
          </div>
          <div className="landing-footer-base">
            <span>© 2026 DUTA INTEGRA SOLUTIONS · MPK KLUANG PILOT</span>
            <span className="flex items-center gap-1.5"><Leaf className="h-3.5 w-3.5" /> TREAD LIGHTLY · KELUAR SEMUA SAMPAH</span>
          </div>
        </div>
      </footer>

      {module && <ModuleModal module={module} lang={lang} onClose={() => setModule(null)} />}
    </div>
  );
}

function TopBar({
  lang,
  onLang,
  open,
  onMenu,
  onClose
}: {
  lang: 'EN' | 'BM';
  onLang: () => void;
  open: boolean;
  onMenu: () => void;
  onClose: () => void;
}) {
  return (
    <div className="landing-topbar">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="landing-brand">
          <span className="landing-brand-mark"><Mountain className="h-5 w-5" /></span>
          <span className="landing-brand-text">SMART<br /><em>GUNUNG&nbsp;LAMBAK</em></span>
        </Link>
        <nav className="hidden items-center gap-6 lg:flex">
          {[
            ['#modules', t(lang, 'Workspaces', 'Ruang kerja')],
            ['#twin', 'Digital twin'],
            ['#zoo', 'Wildlife'],
            ['#handbooks', 'Handbooks'],
            ['#api', 'API'],
            ['/app', t(lang, 'Enter', 'Masuk')]
          ].map(([href, label]) =>
            href.startsWith('#') ? (
              <a key={href} href={href} className="landing-topbar-link">{label}</a>
            ) : (
              <LandingLink key={href} href={href} className="landing-btn-primary-sm">{label}</LandingLink>
            )
          )}
          <button type="button" onClick={onLang} className="landing-topbar-lang">
            <Languages className="h-3.5 w-3.5" /> {lang}
          </button>
        </nav>
        <div className="flex items-center gap-2 lg:hidden">
          <button type="button" onClick={onLang} className="landing-topbar-lang"><Languages className="h-3.5 w-3.5" /> {lang}</button>
          <button type="button" onClick={onMenu} aria-label="Menu" className="landing-menu-btn">
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <div className="landing-mobile-menu lg:hidden">
          {[
            ['#modules', t(lang, 'Workspaces', 'Ruang kerja')],
            ['#twin', 'Digital twin'],
            ['#zoo', 'Wildlife'],
            ['#handbooks', 'Handbooks'],
            ['#api', 'API'],
            ['/app', t(lang, 'Enter the command centre', 'Masuk pusat kawalan')]
          ].map(([href, label]) => (
            <a key={href} href={href} onClick={onClose} className="landing-mobile-link">{label}</a>
          ))}
        </div>
      )}
    </div>
  );
}

function Fact({ value, unit, label }: { value: string; unit: string; label: string }) {
  return (
    <div className="landing-fact">
      <span className="landing-fact-value">{value}</span>
      <span className="landing-fact-unit">{unit}</span>
      <span className="landing-fact-label">{label}</span>
    </div>
  );
}

function SectionHeading({
  kicker,
  title,
  sub,
  dark
}: {
  kicker: string;
  title: string;
  sub: string;
  dark?: boolean;
}) {
  return (
    <div className="max-w-2xl">
      <div className={dark ? 'landing-kicker-k dark' : 'landing-kicker-k'}>{kicker}</div>
      <h2 className={dark ? 'landing-section-title dark' : 'landing-section-title'}>{title}</h2>
      <p className={dark ? 'landing-section-sub dark' : 'landing-section-sub'}>{sub}</p>
    </div>
  );
}

function Bird({ emoji }: { emoji: string }) {
  return <span className="landing-zoo-note-bird">{emoji}</span>;
}

function HeroStamp({ lang }: { lang: 'EN' | 'BM' }) {
  return (
    <div className="landing-stamp-card">
      <div className="landing-stamp-card-head">
        <span>SMART LAMBAK · {t(lang, 'EXPEDITION PASS', 'PAS EKSPEDISI')}</span>
        <span>№ 2026</span>
      </div>
      <div className="landing-stamp-card-body">
        <p className="landing-stamp-card-issue">{t(lang, 'Issued to', 'Dikeluarkan kepada')}</p>
        <div className="landing-signature-wrap">
          <div className="landing-signature">
            {t(lang, 'Visitor & Family', 'Pelawat & Keluarga')}
          </div>
          <div className="landing-signature-none">—</div>
        </div>
        <dl className="landing-stamp-card-meta">
          <div><dt>LOOP</dt><dd>4.2 KM · GRADE 3/10</dd></div>
          <div><dt>PEAKS</dt><dd>NORTH 510 M · SOUTH 470 M</dd></div>
          <div><dt>FACILITIES</dt><dd>CHALET · POOL · BBQ · CAMPING</dd></div>
          <div><dt>PARKING</dt><dd>120 BAYS · AI CAMERA EXACT</dd></div>
          <div><dt>{t(lang, 'PASSPORT', 'PASSPORT')}</dt><dd>5 CHECKPOINTS · +15 PTS</dd></div>
        </dl>
        <div className="landing-stamp-card-qr">SMART#LAMBAK·PILOT·2026</div>
        <div className="landing-stamp-card-verdict">ISSUED UNDER PDPA · CONSENT MIRRORED TO /api/v1/consent</div>
      </div>
      <div className="landing-stamp-card-foot">
        <span>ENTRY 07:12 · BAY 23 · FAMILY 4</span>
        <span className="landing-stamp-card-foot-ok">SOFT GO-LIVE ✓</span>
      </div>
    </div>
  );
}

function ModuleModal({ module, lang, onClose }: { module: ModuleId; lang: 'EN' | 'BM'; onClose: () => void }) {
  const item = modules[module];
  const Icon = item.icon;
  const mount = ['ranger', 'command', 'admin', 'api', 'sla'].includes(module);
  return (
    <div className="landing-modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="landing-modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="landing-modal-head">
          <span className="landing-modal-icon"><Icon /></span>
          <div>
            <div className="landing-modal-verb">{item.verb} · GUNUNG LAMBAK PILOT</div>
            <h3 className="landing-modal-title">{item.en} — {t(lang, 'enter as', 'masuk sebagai')}</h3>
          </div>
          <button type="button" onClick={onClose} aria-label={t(lang, 'Close', 'Tutup')} className="landing-modal-close"><X /></button>
        </div>
        <div className="landing-modal-body">
          {(
            [
              ['visitor', t(lang, 'Walk-in visitor', 'Pelawat masuk')],
              ['ranger', 'Ranger Hafiz'],
              ['command', t(lang, 'Command centre', 'Pusat kawalan')],
              ['admin', t(lang, 'Park manager', 'Pengurus taman')],
              ['finance', 'Finance'],
              ['auditor', 'Auditor']
            ] as [string, string][]
          ).map(([role, label], index) => (
            <a
              key={role}
              href={mount ? `/app?view=${module}` : `/app?view=${role}`}
              className="landing-modal-role"
            >
              <span className="landing-modal-role-no">{String(index + 1).padStart(2, '0')}</span>
              <span>{label}</span>
              <span className="landing-modal-role-role">{role}</span>
              <ArrowRight className="landing-modal-role-arrow" />
            </a>
          ))}
        </div>
        <div className="landing-modal-foot">{item.desc}</div>
      </div>
    </div>
  );
}

function LandingLink({ href, className, children, target }: { href: string; className?: string; children: React.ReactNode; target?: string }) {
  return (
    <a href={href} className={className} {...(target ? { target, rel: 'noopener noreferrer' } : {})}>
      {children}
    </a>
  );
}