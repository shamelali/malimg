# Handbook 05 — Finance Officer

**For:** MPK finance staff tracking revenue, the pilot budget, ROI and commercial
sustainability (demo user: **Finance Officer, finance@mpk.gov.my**, MFA
enabled).
**Your screens:** Visitor (context), **Command** (live revenue), **Budget**
(plan vs spend), **SLA** (service assurance). You do **not** operate facilities
or change configuration.

---

## 1. Your mission

Provide an accurate money view of the Smart Gunung Lambak pilot: daily revenue,
the **MYR 2.8M optimum budget**, Year-1 ROI, ESG-linked value, and the financial
case for expanding to other parks. You read operational data and financial plans;
you do not perform ranger or admin mutations.

---

## 2. Signing in

1. Choose the **Finance** role (production: MPK email + **MFA**). Your session
   carries the **reports** capability for audit/report access.
2. Start on **Command** for today’s money, then move to **Budget** for the plan.
3. Use the **Visitor** view to understand what guests pay for; use **SLA** to
   confirm the services that underpin revenue.

---

## 3. Where the money numbers live

### 3.1 Command screen — operational revenue
- **Revenue today (RM)** from bookings/parking.
- **Year-1 ROI %**.
- **AI forecast & revenue card**, e.g. weekend parking “full by 08:30” with
  **dynamic-pricing** recommendations and staffing guidance.
- **Charts**: arrivals, revenue and facility-utilisation trends — your basis for
  demand and yield analysis.
- Facility price points (chalet, pool, BBQ, camping) and live utilisation
  (used/capacity).

### 3.2 Budget screen — the MYR 2.8M plan
The optimum 12-month pilot budget is split as follows:

| Workstream | Share | Amount |
|---|--:|--:|
| Product UX | 8% | RM224k |
| Mobile iOS/Android + Web PWA | 15% | RM420k |
| Backend PostGIS / TimescaleDB | 14% | RM392k |
| GIS digital twin lite | 10% | RM280k |
| Safety & facility IoT | 15% | RM420k |
| AI / ML | 10% | RM280k |
| Cloud & security | 10% | RM280k |
| Integrations | 7% | RM196k |
| QR/NFC/IoT hardware | 6% | RM168k |
| QA, UAT, pentest, PDPA | 4% | RM112k |
| Training | 3% | RM84k |
| Contingency | 8% | RM224k |
| **Total** | **100%** | **MYR 2.8M** |

### 3.3 12-month delivery phases (for milestone/cash-flow planning)
1. **Month 1** — Mobilisation & discovery (10%)
2. **Months 2–3** — Architecture, UX & data model (15%)
3. **Months 4–6** — Enterprise MVP & integrations (30%)
4. **Months 7–9** — Safety IoT, AI & ranger workflows (20%)
5. **Months 10–11** — Community marketplace & SaaS multi-park (15%)
6. **Month 12** — Go-live, training & hypercare (10%)

Tie payments/retention to these milestones rather than calendar months alone.

---

## 4. Regular finance tasks

### Daily
1. Note **revenue today** and reconcile against bookings/parking volumes.
2. Compare actual arrivals to the **AI forecast**; flag forecast bias.
3. Confirm payment integration health (**FPX / DuitNow / Touch ‘n Go**) — a
   payment outage shows on SLA/integrations and is revenue-critical (P1).

### Weekly
1. Review revenue and utilisation charts; identify yield opportunities
   (chalets/pool/BBQ vs parking).
2. Validate **dynamic-pricing** recommendations against policy and PDPA-safe,
   non-discriminatory rules.
3. Track burn against workstream budget lines; note contingency use.

### Monthly / stage-gate
1. Match spend to the delivery-phase milestones above.
2. Update **ROI** and the business case; prepare the multi-park expansion view.
3. Obtain the **audit CSV** to evidence revenue and configuration events.

### Evidence & audit
- Use **Admin-provided audit export** (or request it): `GET
  /api/v1/reports/audit?format=csv`. Your role has the **reports** capability;
  finance and managers/auditors/super-admins can pull it.
- Columns: timestamp, actor, action, IP, result. Pair with payment-settlement
  reports for reconciliation.

---

## 5. Understanding the cost case (why RM2.8M)

Gunung Lambak is a **4.2 km Grade 3/10 family loop with full 4G**, an existing
**120-bay** car park, **10 chalets**, an **80-capacity pool**, BBQ and toilets.
Because infrastructure largely exists and coverage is good, the pilot **avoids
LoRa and remote-network spend**. Harder, taller deployments such as **Gunung
Ledang cost MYR 3.2–4.0M** due to LoRa coverage and remote infrastructure.

Talking points for budget defence:
- Safety (SOS, geofence, IoT) and experience (bookings, passes) are the two
  largest capability bundles (IoT 15% + mobile 15%).
- **Contingency is 8%** — protect it; hardware and field integration carry the
  most variance.
- Recurring cloud/security (~10%) underpins RPO/RTO and PDPA controls.

---

## 6. Revenue & value levers to watch

- **Parking** yield vs AI overflow and dynamic pricing (weekends).
- **Chalet & pool** occupancy (smart-lock frictionless check-in raises turnover).
- **BBQ & camping** utilisation and family-group volume.
- **Multi-park SaaS** upside: Gunung Lambak PILOT → Gunung Belumut (coming
  soon), Gunung Ledang Phase 2 (MYR 3.2–4.0M), Hutan Bandar Kluang (template).
- **ESG** metrics support grant/green-finance narratives even where they are not
  direct revenue.

---

## 7. Rules, boundaries & controls

- **Read/analyse:** revenue, budgets, ROI, SLA assurance, and (with the reports
  capability) audit export.
- **Do not:** change prices/capacity yourself (Admin configures, versioned and
  audit-logged), operate facilities, or manage roles.
- Pricing changes must follow MPK policy; the app recommends but a manager/
  super-admin approves and applies them.
- Reconcile only against settlement reports; the in-app figures are operational
  until matched to the ledger.
- Handle all financial personal data under **PDPA**; share audit/report files via
  controlled channels, not personal email.

---

## 8. Escalation

| Issue | Contact |
|---|---|
| Payment gateway outage / failed settlement | Park Manager + integration lead (P1) |
| Need audit CSV / missing events | Park Manager or Auditor |
| Budget variance > contingency | Park Manager → Super Admin / governance |
| Multi-park business case inputs | Super Admin (park portfolio) |
| System/backup failure affecting records | SLA process → Super Admin/IT |

---

## 9. One-card summary

- **Today:** revenue + ROI on **Command**; reconcile to settlements.
- **Plan:** the **12-line MYR 2.8M** budget and **6 delivery phases** on
  **Budget**.
- **Evidence:** audit **CSV export** (timestamp, actor, action, IP, result).
- **Case:** Lambak is low-cost because infrastructure/4G exist; Ledang-class
  peaks cost more.
- **Guardrails:** you analyse and report; managers approve and configure.
