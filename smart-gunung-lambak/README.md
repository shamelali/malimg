# Smart Gunung Lambak — Full-stack Web + Mobile App

A production-shaped, responsive web and installable mobile application for the **Smart Gunung Lambak Pilot** for MPK Kluang. The project converts the supplied static HTML prototype into a Next.js full-stack product with visitor, ranger, command-centre, admin, API, SLA and budget workflows.

## Product modules

### Visitor mobile experience

- Mobile-first interface with bottom navigation.
- Live 120-bay car-park grid with AI camera accuracy.
- Chalet, pool, BBQ and camping booking flow.
- QR/NFC e-ticket and smart-lock PIN.
- Family safe-zone mode with working child/elderly/partner linking, live distance status and safety check.
- One-tap wildlife sighting reports from the monkey-risk zones, creating command-centre incidents.
- First-run bilingual PDPA consent gate (withdrawable) mirrored to an audited endpoint.
- Trail passport checkpoint stamps and reward points.
- Bilingual Johor trail catalog (8 trails) with search, difficulty filters, ratings, weather, animated route map and bookmarks.
- Live hike recorder (timer, GPS distance with offline simulated fallback, pace, elevation, steps, progress-to-summit), post-hike summary and personal stats/badges/weekly log stored offline-first.
- Long-tailed, pig-tailed and dusky leaf monkey wildlife-risk zones.
- SOS confirmation with simulated MPK, APM and clinic dispatch.
- English / Bahasa Malaysia toggle.
- Light and dark themes.

### Ranger tablet experience

- Offline queue indicator.
- Task board with completion/reopening persistence.
- Chalet, toilet, pool and waste-bin status cycling.
- IoT cards for AI cameras, ultrasonic bins, ammonia sensors, TTLock, pool sensors and MQTT gateway.
- Offline sync action.

### Command centre

- Visitor, trail, parking and destination-health KPIs.
- Layered 2D SVG digital-twin map; no paid map token required.
- Incidents, ESG metrics, AI capacity forecast, revenue and ROI.
- Recharts hourly visitor flow, revenue mix and weighted health-index charts.

### SaaS administration

- Multi-park cards: Lambak, Belumut, Ledang and Hutan Bandar Kluang.
- Editable facility configuration.
- Demo RBAC role switcher with MFA indicators.
- Searchable audit log.
- CSV audit export at `/api/v1/reports/audit?format=csv`.

### Platform and delivery views

- SLA dashboard with RPO/RTO, MTTR, SOS acknowledgement and device accuracy.
- Monitoring, backup, DR and P0/P1/P2 severity model.
- MYR 2.8M budget breakdown and 12-month delivery plan.

## Technical features

- **Next.js 16 App Router**, React 19 and TypeScript strict mode.
- Server route handlers under `/api/v1`.
- **PostgreSQL + Drizzle ORM** schema and generated SQL migration.
- Runs without a database using a seeded in-memory store for demos.
- When `DATABASE_URL` is set, the data service uses PostgreSQL for dashboard aggregates and mutations.
- Tailwind CSS v4 and Lucide icons.
- Recharts analytics.
- OpenAPI 3.1 contract at `/api/v1/openapi`.
- In-browser interactive API Try It console.
- Basic in-memory API rate limiting.
- Security response headers.
- PWA manifest, install prompt, app shortcuts, service worker, SVG/PNG/maskable icons.
- Offline dashboard cache and IndexedDB mutation queue with automatic replay on reconnect.
- Database health check that reports PostgreSQL status or memory fallback.
- Capacitor 7 configuration and a generated Android project.
- Dockerfile and PostGIS Docker Compose stack.
- Smoke tests covering the major APIs and PWA manifest.
- Demo RBAC: Super Admin, Park Manager, Ranger, Operator, Finance, Auditor and Visitor.

## Quick start

```bash
npm install
npm run dev
```

Open the Next.js URL, normally `http://localhost:3000`.

Without PostgreSQL the app reports `database: "seeded-memory"` from `/api/v1/health`; bookings, tasks, facilities, SOS, checkpoints and sync still work for the running process.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run build
npm run start            # in one terminal
npm run test:smoke       # in another terminal
```

The smoke test verifies health, dashboard, booking, task update, checkpoint, SOS, sync, OpenAPI, audit CSV, PWA manifest and security-header behavior.

Continuous integration is defined in `.github/workflows/ci.yml` and runs lint, typecheck, production build, standalone-server startup, smoke tests and a production dependency audit.

## REST API

Examples:

```bash
curl http://localhost:3000/api/v1/health
curl http://localhost:3000/api/v1/dashboard

curl -X POST http://localhost:3000/api/v1/bookings \
  -H 'Content-Type: application/json' \
  -d '{"facilityId":"fac-bbq","guestName":"Demo family","partySize":4}'

curl -X POST http://localhost:3000/api/v1/sos \
  -H 'Content-Type: application/json' \
  -d '{"name":"Visitor","familyCount":4,"battery":78}'
```

Available endpoints:

- `GET /api/v1/health`
- `GET /api/v1/openapi`
- `GET /api/v1/dashboard`
- `GET|PATCH /api/v1/facilities`
- `GET|POST /api/v1/bookings`
- `GET|PATCH /api/v1/tasks`
- `GET /api/v1/iot`
- `POST /api/v1/sos`
- `POST /api/v1/sync`
- `POST /api/v1/checkpoints/:code`
- `GET /api/v1/trails` — bilingual Johor trail catalog (difficulty, distance, elevation, rating) and weather
- `GET|POST /api/v1/hikes` — list and save recorded hike sessions (awards 25 gamification points); queued offline
- `GET /api/v1/parks` — MPK multi-park catalog and rollout status
- `GET /api/v1/forecast` — computed car-park capacity forecast, staffing and dynamic-pricing recommendation
- `GET|POST /api/v1/incidents` — list incidents; public/ranger safety & wildlife sighting reports (GPS attached)
- `POST /api/v1/consent` / `GET` (reports) — record PDPA consent decisions and read consent stats
- `POST /api/v1/iot` — authenticated IoT edge telemetry ingest (ranger/device API key)
- `GET|POST /api/v1/admin/config` (admin) — persist facility capacities/price band, versioned and audit-logged
- `GET|POST /api/v1/admin/api-keys` (admin) — issue (shown once) / revoke masked integration keys
- `POST /api/v1/ops/restore-test` (admin) — run and log a DR restore drill
- `POST /api/v1/integrations/webhook-test` (admin) — synthetic webhook latency test
- `GET /api/v1/reports/audit?format=csv|json` (requires reports capability)
- `POST /api/v1/session` with `{ "role": "park_manager" }` for the demo RBAC cookie

The machine contract is available at `/api/v1/openapi`.

## PostgreSQL / PostGIS

The relational schema includes parks, users, facilities, bookings, ranger tasks, incidents, IoT readings, trail check-ins, family links and immutable-style audit logs.

`/api/v1/health` performs `SELECT 1` when `DATABASE_URL` is configured and returns HTTP `503` with `database: "postgresql-error"` if the database cannot be reached. Read endpoints degrade to the seeded dashboard so a pilot demonstration remains available; write endpoints should be monitored and should not silently succeed in production.

### Run with Docker Compose

```bash
docker compose up --build
```

This starts:

1. PostGIS 16.
2. A one-off migration/seed job using Drizzle.
3. The standalone Next.js server on port `3000`.

### Manual PostgreSQL setup

```bash
cp .env.example .env
# Set DATABASE_URL in .env, then:
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Generated SQL is committed under `drizzle/`. PostGIS is recommended for future geofence and trail geometry work; the current schema uses numeric latitude/longitude so plain PostgreSQL also works. Optional extension commands are provided in `drizzle/extensions.sql`.

## Mobile PWA and offline behavior

1. Deploy the app over HTTPS.
2. Open it in Chrome on Android or Safari on iOS.
3. Use the browser **Add to Home Screen** option or the in-app **Install/Pasang** button when Chrome provides it.
4. The app launches standalone with its own icon, splash colour, manifest shortcuts and service-worker shell.

Offline support is implemented at two levels:

- The latest dashboard snapshot is cached in browser storage and used when `/api/v1/dashboard` cannot be reached.
- Booking, task, facility, checkpoint, SOS and other mutations are stored in an IndexedDB queue when the network fails. They replay automatically in order when the browser fires the `online` event or after a later successful mutation.

A queued SOS is not a substitute for calling emergency services; the app explicitly tells the user to call local emergency services when offline.

## Native Android / iOS with Capacitor

An Android project has already been generated in `android/`; iOS must be added on macOS with Xcode.

Set the deployed web origin before syncing so the native shell uses the live API:

```bash
export LAMBAK_PUBLIC_URL="https://lambak.example.gov.my"
npm install
npx cap sync android
npx cap open android
```

iOS on macOS:

```bash
npx cap add ios
npx cap sync ios
npx cap open ios
```

Regenerate native icons and splash screens from `assets/logo.png`:

```bash
npm run assets:generate
```

See [`mobile/README.md`](mobile/README.md) for store, permission, PDPA and emergency-disclaimer guidance.

## Deploy with Docker

The production Dockerfile uses Next.js standalone output:

```bash
docker build -t smart-lambak .
docker run -p 3000:3000 \
  -e DATABASE_URL='postgresql://postgres:postgres@db:5432/app_db' \
  smart-lambak
```

## Project structure

```text
android/                         # Generated Capacitor Android project
assets/                          # Source icon for native asset generation
drizzle/                         # Generated Drizzle SQL migration
mobile/                          # Native packaging/store guidance
public/                          # PWA icons and service worker
scripts/smoke-test.mjs           # API/PWA smoke test
src/
  app/
    api/v1/...                   # REST route handlers
    layout.tsx
    manifest.ts
    page.tsx
  components/                    # Product modules and shared UI
  db/
    client.ts                    # Optional PostgreSQL client
    schema.ts                    # Drizzle schema
    seed.ts                      # PostgreSQL seed
  lib/
    dataService.ts               # Switches between PostgreSQL and memory store
    rateLimit.ts                 # Basic API rate limiting
    serverStore.ts               # Demo store and static operational data
    types.ts
www/                             # Capacitor launch shell
```

## Production hardening roadmap

1. Replace demo RBAC with MPK SSO/Auth.js/Clerk, MFA, JWT expiry and API-key scopes.
2. Persist ranger offline mutations in IndexedDB with a durable replay queue.
3. Add TimescaleDB hypertable and continuous aggregates for IoT readings.
4. Add PostGIS geometry columns, geofences and nearest-responder queries.
5. Integrate FPX/DuitNow, WhatsApp Gateway, MET Malaysia and Hikvision webhooks.
6. Add Playwright browser tests, Lighthouse CI and load tests.
7. Complete government UAT, PDPA review and emergency-workflow sign-off before enabling real SOS.
