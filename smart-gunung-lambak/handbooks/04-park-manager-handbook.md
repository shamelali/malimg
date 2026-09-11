# Handbook 04 — Park Manager

**For:** the MPK Kluang park manager responsible for daily operations, safety and
service delivery at Gunung Lambak (demo user: **Park Manager,
manager@mpk.gov.my**, MFA enabled).
**Your screens:** Visitor, Ranger, **Command**, **Admin**, **API &
Integrations**, **SLA**, **Budget**. You hold the broadest operational remit
below the Super Admin.

---

## 1. Your mission

Run a safe, smooth, data-driven park: watch live KPIs and incidents, deploy staff
and overflow controls, keep facilities compliant, manage configuration and users
for **your park**, and use the audit trail and SLA views to assure performance —
all within the MPK SaaS tenant.

You administer **Gunung Lambak (PILOT)**. Tenant-level settings and other parks
belong to the Super Admin.

---

## 2. Signing in

1. Choose **Park Manager** in the role control. Production enforces your
   government email **plus MFA** — keep your authenticator available.
2. A server-side capability session is created (`lambak_role` cookie) so your
   changes are authorised by the API, not just the screen.
3. Start each day on the **Command** screen.

---

## 3. Command centre — your daily cockpit

**Top KPI cards**
- **Visitors today**, with peak window (typically 7–9 am, ~68% of arrivals).
- **On trail**, including family groups (safe-zone radius 50 m).
- **Car park** occupancy vs 120 bays, % full and AI accuracy.
- **Health index** — the weighted destination score.

**Digital-twin map (TwinMap)** — toggle layers:
**safety · facilities · IoT · wildlife · trails**. Tap any pin for detail. Use
this to position rangers and see incidents geographically.

**Live operations panel**
- **Active incidents** with zone, status and severity (P0/P1/P2).
- **ESG** metrics vs targets.
- **AI forecast & revenue:** e.g. “parking full by 08:30, 92% confidence on
  weekends — recommend 3 staff and dynamic pricing,” plus **revenue today (RM)**
  and **Year-1 ROI %**.
- Trend **charts** for arrivals, revenue and facility use.
- Bottom tiles: families on trail, overflow forecast time, toilet status, and
  **SOS SLA (target ack < 60 s)**.

---

## 4. Daily operating rhythm

### Morning (before 7 am)
1. Open **Command**: check health index, overnight incidents, IoT red dots.
2. Review **SLA** screen: all services live? Any backup/DR failures overnight?
3. Check the **AI forecast**; if “full by 08:30,” schedule the extra staff and
   prepare the **ECONSAVE overflow route**.
4. In the **Ranger** view, confirm P1/P2 tasks are assigned and facilities
   cycling correctly.

### Peak (7–9 am, weekends)
1. Watch car-park %; trigger overflow before 80% becomes gridlock.
2. Monitor pool headcount (cap 80) and toilets (ammonia 20 ppm threshold).
3. Keep an incident commander on SOS alerts — acknowledgement **< 60 seconds**.

### Midday / afternoon
1. Resolve P1/P2 incidents, update statuses.
2. Verify rangers have **synced** offline tasks after rounds.
3. Spot-check ESG readings and revenue vs forecast.

### Close of day
1. Confirm all P0/P1 incidents closed or escalated.
2. Review revenue, ROI movement and tomorrow’s forecast.
3. Ensure audit entries for the day are present and backups succeeded.

---

## 5. Incident command (P0–P2)

| Level | You |
|---|---|
| **P0 — life-threatening** | Take command; confirm MPK + APM + clinic dispatch; SOS ack < 1 min; notify Super Admin |
| **P1 — major** | Deploy extra staff, overflow, wildlife response or facility shutdown; track in Command |
| **P2 — minor** | Assign to rangers/operators; verify same-day closure |

SOS payloads give you **GPS, linked family count and battery %**. Use the map
safety layer to guide responders.

---

## 6. Administration (your park)

Open the **Admin** screen. You can:
- **See all parks** in the tenant and their status/budget, but you configure
  only your park in the pilot.
- **Facility configuration:** edit capacities and price band (defaults: car
  park **120**, chalets **10**, pool **80**, price **RM5–120**). Every save is
  **versioned and creates an immutable audit event**.
- **User management / RBAC / MFA:** review the seven roles and their
  permissions for your park, and verify MFA is enforced for staff.
- **Audit log:** search by actor, action or IP, and **export CSV** for reviews.
  Logs are retained operationally for **90 days**, with PDPA controls and
  consent-expiry workflow.

> Changes write through the admin API and require the **admin**/**reports**
> capabilities your session carries. Auditors have read-only access — do not
> perform actions on their behalf to bypass that.

---

## 7. API & integrations

In the **API** screen you can run live “try-it” calls (`/api/v1/...`), view the
**OpenAPI 3.1** contract, **generate API keys** (rotate/revoke is audited), and
**test webhooks**. Managed adapters include:

- MPK counter adapter; **FPX / DuitNow / Touch ‘n Go** payments
- **MET Malaysia** weather; **Hikvision** camera AI
- Ultrasonic waste bins; ammonia toilet sensors
- **TTLock** QR + PIN smart locks; pool pH + headcount
- WhatsApp gateway; webhook SOS escalation

Keep integrations least-privilege; store keys in the secrets manager, not in
chat or documents.

---

## 8. SLA, backup & resilience you are accountable for

From the **SLA** screen, watch:
- **Monitoring stack:** API gateway, PostgreSQL/PostGIS, Redis/MQTT, Grafana,
  PagerDuty, ELK logs (90-day retention).
- **Backups/DR:** daily full 02:00 MYT, hourly incremental (**15-min RPO**),
  retention **30 daily / 12 monthly**, AES-256, DR region **ap-southeast-1**,
  **RTO 60 minutes**.
- Run/confirm the monthly **restore test** (logged).

Escalate any service showing red or a missed backup immediately; a failed
restore test is a P1.

---

## 9. Budget awareness (your park)

The **Budget** view holds the **MYR 2.8M optimum pilot** breakdown and 12-month
delivery phases, plus why Lambak is cheaper than harder peaks (Gunung Ledang
MYR 3.2–4.0M — LoRa/remote infrastructure). You track revenue and ROI here;
detailed financial ownership sits with Finance (handbook 05).

---

## 10. Rules & boundaries

- **Can:** all operational actions, your-park config, user/role review, audit
  export, integration key management, SLA oversight.
- **Cannot (Super Admin only):** create/deprovision parks, tenant-wide
  configuration and global role templates.
- Every config/key/permission action is audit-logged — make changes for a stated
  operational reason, during duty hours where possible.
- Never share MFA codes or API keys; rotate keys on staff change.
- PDPA: minimise data, honour consent and data-removal requests via the
  documented workflow.

---

## 11. One-card summary

| Concern | Screen | Target |
|---|---|---|
| Live park state | Command | Health index green |
| SOS response | Command / Ranger | Acknowledge < 60 s |
| Car-park overflow | Command + staff | Activate before 80% |
| Facility turnover | Ranger | No sold unit “open”; clean fast |
| Config & users | Admin | Versioned, MFA enforced |
| Compliance evidence | Admin audit (CSV) | Complete, 90-day log |
| System health/DR | SLA | All live, RPO 15m / RTO 60m |
| Money & ROI | Command / Budget | Track vs AI forecast |

When safety numbers turn red, act first and document second. Everything else can
be planned from the dashboard.
