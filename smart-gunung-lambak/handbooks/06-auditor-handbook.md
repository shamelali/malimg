# Handbook 06 — Auditor (Read-Only Compliance Reviewer)

**For:** internal audit and external/compliance reviewers assessing security,
data protection (PDPA), operational controls and record integrity (demo user:
**Auditor, auditor@mpk.gov.my**, MFA enabled).
**Your access is deliberately read-only.** You can see screens and export the
audit log, but you **cannot change any data, configuration or status**.

**Your screens:** Visitor (context), **Command**, **SLA**, **API**, **Budget**
(view). Your server role carries the **reports** capability (audit export) but
not ranger/admin mutation capabilities.

---

## 1. Your mission

Independently verify that Smart Gunung Lambak:
- Maintains a **complete, immutable, searchable and exportable audit trail**.
- Enforces **least-privilege RBAC** and **MFA** for staff.
- Meets stated **SLA, backup and disaster-recovery** commitments.
- Handles personal data in line with **PDPA**, including consent and retention.
- Leaves evidence for every material change (bookings, facility status, config,
  API keys).

You review; you never fix records yourself — you raise findings to the Park
Manager / Super Admin.

---

## 2. Signing in & independence

1. Choose the **Auditor** role (production: named auditor account + **MFA**;
   shared accounts are not acceptable for audit work).
2. Note the exact date/time window you review; the server timestamps every
   action.
3. Confirm your session cannot mutate data: task checkboxes, facility tiles and
   “Save configuration” controls should be unavailable/blocked for your role.
   If you can change anything, **log it as a critical segregation-of-duties
   finding**.

---

## 3. The audit log — primary evidence

Open **Admin-adjacent audit data** via the report endpoint; in the pilot the
searchable log and CSV export are exposed through the audit report.

**Export the log**
- JSON: `GET /api/v1/reports/audit?format=json`
- CSV:  `GET /api/v1/reports/audit?format=csv`
  (CSV header: `timestamp,actor,action,ip,result`)
- Access requires the **reports** capability (super-admin, manager, finance,
  auditor). An unauthenticated/insufficient request must return **403 Forbidden**
  — test this as a control.

**Each record shows**
- `timestamp` (server time), `actor` (who), `action` (what), `ip` (source), and
  `result` (**success / blocked / failed**).

**What to look for**
1. **Coverage gaps:** bookings, facility status changes, config saves, key
   generation and logins should all appear.
2. **Blocked/failed results:** repeated blocked actions may indicate misuse,
   brute force, or RBAC probing.
3. **Out-of-hours or unexpected admin actions**, especially config changes and
   key rotation.
4. **Actor consistency:** actions attributed to real, named staff (not generic
   shared logins).
5. **Integrity:** records are append-only/immutable; any inability to reproduce
   an export, or altered/deleted historical rows, is a major finding.

**Search & sampling**
- In the UI search box, filter by actor, action keyword or IP.
- Sample: all config changes, all key generations, a random booking set, and all
  `blocked` results for your window.

---

## 4. RBAC & MFA controls to verify

Review the role matrix (also in the handbook index):

| Role | Intended access |
|---|---|
| Visitor | Visitor features only; no staff data |
| Chalet Operator | Visitor + operational board (bookings/facility status) |
| Ranger | Visitor, Ranger, Command, SLA |
| Finance | Command, Budget, SLA + reports/audit |
| **Auditor (you)** | Read-only Command/SLA/API/Budget + audit export |
| Park Manager | All operational + Admin for their park |
| Super Admin | Everything, across parks/tenant |

Verify:
- **Least privilege:** staff only reach what their role needs.
- **MFA enforced** for every staff role (all demo staff show `mfa: true`).
- **Server-side enforcement:** protected APIs (tasks, facilities, sync, reports,
  admin) reject unauthorized calls — not merely hidden in the UI.
- **Demo session vs production:** the pilot role cookie (`lambak_role`) and
  `x-api-key`/`DEMO_API_KEY` must be replaced/controlled in production; presence
  of a default API key in a live environment is a finding.

---

## 5. SLA, monitoring & disaster recovery evidence

On the **SLA** screen verify each metric shows **value vs target** and a PASS:
- **Monitoring stack:** API gateway, PostgreSQL/PostGIS, Redis/MQTT, Grafana,
  PagerDuty, ELK logs.
- **Log retention:** operational logs held **90 days** (ELK).
- **Backups:** daily full at **02:00 MYT**; hourly incremental = **15-min RPO**;
  retention **30 daily / 12 monthly**; **AES-256** encryption.
- **DR:** region **ap-southeast-1**; **RTO target 60 minutes**.
- **Control test:** request evidence of the **monthly restore test** (it is
  logged). A backup never successfully restored is a finding.

Record actual SLA values on the day and whether SOS acknowledgement is within
the **< 60-second** target (baseline ~42 s).

---

## 6. PDPA / data-protection review

Confirm the platform and operators:
- Collect only necessary visitor data (name, party size, date for bookings;
  GPS only for safety/SOS).
- Present **PDPA consent in BM/EN** with a **consent-expiry workflow**.
- Apply **30-day operational / 12-month monthly backup retention** and encrypted
  (AES-256) storage.
- Support data-subject access/removal via the documented route (Manager/
  Super Admin).
- Do not transmit personal data to personal messaging/email; check integration
  scoping (WhatsApp gateway, payment adapters).

Note GPS/SOS data as sensitive; verify access is limited to safety roles and that
geolocation requires user permission.

---

## 7. Financial controls (view)

On the **Budget** screen you may view (not approve) the **MYR 2.8M** budget and
delivery milestones to support value-for-money and stage-payment audit. Cross-
check revenue actions in the audit log against Finance’s settlement records
(refer exceptions to Finance, handbook 05).

---

## 8. Suggested audit checklist

- [ ] Audit log complete, time-ordered, immutable, reproducible on re-export.
- [ ] CSV/JSON export works; unauthorized requests return 403.
- [ ] No shared/generic accounts; named actors only.
- [ ] MFA enforced for all staff roles.
- [ ] Auditor role truly read-only (cannot mutate any record).
- [ ] Server-side RBAC enforced on protected APIs.
- [ ] Default/demo API key not usable in production; keys rotated & audited.
- [ ] Backups encrypted; RPO 15 m / RTO 60 m; restore test evidence present.
- [ ] 90-day log retention met; PDPA consent/retention/removal in place.
- [ ] Booking → payment → facility status changes reconcile end-to-end.
- [ ] Security headers/TLS settings present (HSTS, nosniff, referrer policy).

---

## 9. Raising findings

| Severity | Examples | Route |
|---|---|---|
| Critical | Auditor can mutate data; missing/altered audit records; live default key | Immediate → Super Admin + governance |
| High | MFA off for staff; backup/restore failing; no server-side RBAC | Park Manager + Super Admin, set deadline |
| Medium | Retention/PDPA gaps; monitoring blind spots | Written finding, follow-up review |
| Low | Documentation/naming, minor log-format issues | Log for next cycle |

You should receive read-only evidence (CSV/JSON exports, SLA screenshots, restore
test logs) and file an independent report. Do not accept “fixed verbally” —
re-test and re-export to confirm.

---

## 10. Quick reference

| Need | Path / screen |
|---|---|
| Audit log (CSV) | `GET /api/v1/reports/audit?format=csv` |
| Audit log (JSON) | `GET /api/v1/reports/audit?format=json` |
| API contract | `GET /api/v1/openapi` |
| Service status/DB mode | `GET /api/v1/health` |
| Uptime/backups/DR | **SLA** screen |
| RBAC roles/MFA | **Admin** role view (read-only) |
| Budget (view) | **Budget** screen |

*Independence is the value of your role: observe, export, evidence — never
change.*
