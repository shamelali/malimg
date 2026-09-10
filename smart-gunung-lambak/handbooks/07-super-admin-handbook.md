# Handbook 07 — MPK Super Admin (SaaS Tenant Administrator)

**For:** MPK IT / platform administrators responsible for the entire smart-park
tenant across multiple parks (demo user: **MPK Super Admin,
admin@mpk.gov.my**, MFA enforced).
**Your screens:** everything — Visitor, Ranger, Command, **Admin**, API, SLA,
Budget. You are the only role that manages the **park portfolio** and
tenant-level configuration.

---

## 1. Your mission

Operate Smart Gunung Lambak as a **multi-park SaaS service** for MPK Kluang:
provision and configure parks, manage users and least-privilege roles with MFA,
issue and rotate integration credentials, safeguard the immutable audit trail,
and own security, backups/DR and production hardening. Great power, full
accountability — every privileged action is logged under your name.

---

## 2. Signing in & account security

1. Sign in with your named MPK administrator identity and **MFA** (never a shared
   login). The pilot role switcher sets a `lambak_role` session; production must
   use the real identity provider with signed sessions.
2. Use a privileged-access workstation where possible; log in, perform the
   change, log out.
3. Keep MFA devices and recovery information controlled; losing the only
   super-admin account can lock the tenant.
4. The optional service key header is **`x-api-key`** compared against
   `DEMO_API_KEY` and grants super-admin — generate a long random value, store it
   in a secrets manager, and **never ship the default in production**.

---

## 3. Multi-park administration

Open the **Admin** screen → park portfolio:

| Park | Status | Budget/context |
|---|---|---|
| **Gunung Lambak PILOT** | ACTIVE | MYR 2.8M optimum pilot |
| Gunung Belumut | COMING SOON | Planning |
| Gunung Ledang Phase 2 | PHASE 2 | MYR 3.2–4.0M (harder terrain) |
| Hutan Bandar Kluang | ACTIVE | Template |

**Your responsibilities**
- Provision/onboard a new park from the template; decommission or suspend parks;
  set status (active / coming soon / phase).
- Scope every user, facility and configuration row to the correct park
  (tenant isolation). Data for one park must never leak into another.
- Park Managers administer **their own park**; cross-park changes are yours.
- Park configuration is stored as versioned JSONB against the PostGIS schema;
  every change produces an **immutable audit event**.

---

## 4. Facility configuration

In **Admin → Facility configuration**, set and version:
- Capacities (defaults: **car park 120, chalets 10, pool 80**).
- Pricing band (**RM5–RM120**) and other operating parameters.
- **Save configuration** writes through the admin API (requires the **admin**
  capability) and records an immutable event.

Guardrails:
- Changes affect live availability/pricing — coordinate with the Park Manager;
  prefer off-peak changes.
- Never edit the database directly to bypass versioning; use the API/UI so the
  audit trail is intact.

---

## 5. Users, RBAC & MFA

Seven roles exist — assign the **minimum** role each person needs:

| Role | Grant to |
|---|---|
| Visitor | Public (self-serve, no staff data) |
| Chalet Operator | Counter/reception/check-in staff |
| Ranger | Trail and safety officers |
| Finance | Revenue/budget officers |
| Auditor | Compliance reviewers (read-only) |
| Park Manager | The accountable on-site manager |
| Super Admin | A tiny, named IT/platform group (you) |

**Lifecycle**
1. Create named accounts tied to MPK email; enforce **MFA** for all staff roles.
2. Assign park scope and exactly one primary role; review access quarterly.
3. On transfer/resignation, disable access immediately and rotate any keys they
   held.
4. Keep the **Auditor** role strictly read-only; never grant mutation rights “to
   save time.”
5. Periodically review the role/permission matrix and remove dormant accounts.

Server-side capabilities: **booking, checkpoint, sos** (visitor-facing),
**ranger** (operational changes), **reports** (audit/finance), **admin**
(configuration). Verify protected endpoints reject unauthorized sessions with
**403**, not just hidden menus.

---

## 6. API keys, integrations & webhooks

In the **API & Integrations** screen:
- View the **OpenAPI 3.1** contract and run live try-it calls.
- **Generate API keys**; every generation, rotation and revocation is audited.
- **Test webhooks** (SOS escalation) and adapters: MPK counter, FPX/DuitNow/
  Touch ‘n Go, MET Malaysia weather, Hikvision camera AI, ultrasonic bins,
  ammonia sensors, TTLock QR+PIN, pool pH/headcount, WhatsApp gateway.

Practices
- One key per system/integrator, least privilege, and an expiry/rotation date.
- Store secrets in a manager; inject via environment (`DEMO_API_KEY`,
  `DATABASE_URL`) — never commit them.
- On a failed integration test or suspected leak, **revoke and rotate** at once
  and review the audit log for that key.
- Rate limiting protects endpoints (e.g. SOS is tightly limited); tune via
  configuration, monitor for 429 spikes.

---

## 7. Security hardening (production checklist)

- [ ] Replace the demo role cookie with the real identity provider, hashed
      passwords, signed/JWT sessions, and **MFA** for staff.
- [ ] Set cookies `Secure` + `SameSite=strict` over HTTPS; add CSRF protection
      for cookie-authenticated mutations.
- [ ] Remove/disable the default `DEMO_API_KEY`; issue strong per-system keys.
- [ ] Confirm security headers live: **HSTS** (`max-age=63072000;
      includeSubDomains; preload`), **X-Content-Type-Options: nosniff**,
      referrer policy, and the camera/geolocation/microphone permissions policy.
- [ ] Enforce TLS everywhere; run the dependency audit (target **0 production
      vulnerabilities**) and patch on a schedule.
- [ ] Run the documented **pentest/PDPA** gate before go-live (budget line
      includes QA/UAT/pentest/PDPA).
- [ ] Validate the Docker/Compose production image and secrets handling;
      restrict database network access.

---

## 8. Database, backups & disaster recovery

- The platform uses **PostgreSQL + PostGIS** via Drizzle migrations; it runs on
  seeded in-memory data only for local/demo. Point production at
  `DATABASE_URL` and run migrations + seed.
- Apply migrations with the Drizzle workflow (`db:generate` / `db:push`); use
  the optional PostGIS / pg_trgm extensions for geo and search.
- **Backups/DR you own:** daily full 02:00 MYT, hourly incremental (**15-min
  RPO**), retention **30 daily / 12 monthly**, **AES-256**, DR region
  **ap-southeast-1**, **RTO 60 minutes**.
- Schedule and log the **monthly restore test**; a restore never performed is an
  assumption, not a control.
- Watch the **SLA** screen and monitoring stack: API gateway, PostGIS,
  Redis/MQTT, Grafana, PagerDuty, ELK (**90-day** logs).

Deployment & CI notes
- GitHub Actions CI runs lint, typecheck, build, standalone startup and smoke
  tests; keep it green before releases.
- The production server runs the Next.js **standalone** output via
  `scripts/start-standalone.mjs`; health is at `/api/v1/health` and reports
  `postgresql-ok`, `seeded-memory`, or HTTP 503 on database failure.

---

## 9. Audit log stewardship

- You (with managers/finance/auditors) can export the log:
  `GET /api/v1/reports/audit?format=csv|json` (fields: timestamp, actor,
  action, IP, result).
- Keep the log **append-only**; do not edit history even to correct a mistake —
  make a new corrective event.
- Support PDPA subject requests and consent expiry; coordinate with the Auditor
  for independent verification.
- Retain operational logs for 90 days and the backup schedule above.

---

## 10. Mobile / PWA release duties

- The app is an installable **PWA** (manifest, service worker, offline queue,
  install prompt) and an Android **Capacitor** package
  (`gov.mpk.lambak.pilot`, app name “Smart Lambak”).
- Before release: rebuild web assets, run `npx cap sync android`, and produce a
  **signed APK/AAB** (requires Android SDK + JDK 17) through your CI/build
  machine.
- The Android app declares coarse/fine **location** permissions for safe-zone
  and SOS; justify permissions in the store listing and keep only required ones.
- iOS requires macOS/Xcode and is not generated in this environment; plan it in
  the mobile budget line.
- Test real-device offline/GPS behaviour and the queued-SOS emergency warning.

---

## 11. Operating runbook

| Event | Action |
|---|---|
| New starter | Create named account + MFA, assign park + minimum role |
| Leaver/transfer | Disable account, reassign tasks, rotate their API keys |
| Suspected key leak | Revoke/rotate immediately, inspect audit log, file incident |
| Park go-live | Clone template park, set config, run migrations, assign manager |
| Database outage | Health returns 503; app falls back to seeded read data; follow RTO 60m |
| Security incident P0/P1 | Follow incident severity, preserve logs, notify governance |
| Audit request | Provide read-only account + CSV/JSON exports; never alter records |
| Release | CI green → standalone/Docker build → smoke tests → mobile sync/sign |

---

## 12. Golden rules

1. **Least privilege and named accounts** — no shared super-admin logins.
2. **MFA always** for staff; protect your own MFA first.
3. **Change through the API**, never the database directly, so history is intact.
4. **Every privileged action is audited** — act as though the auditor is reading
   it (they are).
5. **Default secrets never reach production**; rotate on people/key changes.
6. **Backups must restore** — test monthly, log the proof.
7. **Isolate parks** and respect PDPA; minimise and protect personal data.

You are the custodian of the whole tenant: keep it secure, recoverable and
provably well-governed.
