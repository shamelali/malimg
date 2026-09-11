# Smart Gunung Lambak — User Handbook Library

Welcome to **Smart Gunung Lambak** (MPK Kluang smart-park pilot): a bilingual
(English / Bahasa Melayu) web app and installable mobile PWA for visitors,
rangers, facility operators, command-centre staff, finance, auditors and
administrators.

This folder contains one handbook **per user role**. Pick the one that matches
your job. You only need to read your own — each is self-contained.

| # | Handbook | Who it is for | Main screens |
|---|----------|---------------|--------------|
| 01 | [Visitor & Family Handbook](./01-visitor-family-handbook.md) | Public visitors, families, elderly guests | Visitor |
| 02 | [Ranger Handbook](./02-ranger-handbook.md) | Trail rangers and safety officers (e.g. Ranger Hafiz) | Visitor, Ranger, Command, SLA |
| 03 | [Chalet & Facility Operator Handbook](./03-chalet-operator-handbook.md) | Chalet/pool/BBQ counter and check-in staff | Visitor, Ranger board |
| 04 | [Park Manager Handbook](./04-park-manager-handbook.md) | MPK park manager on duty | All operational + Admin |
| 05 | [Finance Officer Handbook](./05-finance-officer-handbook.md) | Revenue, budget and ROI officers | Command, Budget, SLA |
| 06 | [Auditor Handbook](./06-auditor-handbook.md) | Internal/external compliance auditors (read-only) | Command, SLA, API, Budget |
| 07 | [Super Admin Handbook](./07-super-admin-handbook.md) | MPK IT / SaaS tenant administrators | Everything |

## Access at a glance (role matrix)

| Screen / ability | Visitor | Operator | Ranger | Finance | Auditor | Manager | Super Admin |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| Visitor & family app | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ranger task & facility board | – | ✅ | ✅ | – | – | ✅ | ✅ |
| Command centre / KPIs | – | – | ✅ | ✅ | ✅ | ✅ | ✅ |
| SLA / monitoring / DR | – | – | ✅ | ✅ | ✅ | ✅ | ✅ |
| Budget & revenue plan | – | – | – | ✅ | 👁 | ✅ | ✅ |
| API & integrations console | – | – | – | – | 👁 | ✅ | ✅ |
| Admin: parks, config, RBAC | – | – | – | – | – | ✅ | ✅ |
| Immutable audit log export | – | – | – | ✅ | 👁 | ✅ | ✅ |
| Mutate operational data | – | ✅ | ✅ | – | **read-only** | ✅ | ✅ |

👁 = view only (auditors cannot change anything, by design).

## Things that apply to everyone

- **Install it as an app:** open the site in Chrome/Edge/Safari and use
  **“Add to Home screen / Install app.”** Once installed it launches full-screen
  like a native app.
- **Two languages:** use the **EN / BM** toggle. All safety terms appear in
  both English and Bahasa Melayu.
- **Light / dark theme:** use the theme (sun/moon) control; the ranger and
  command screens are designed for outdoor glare and night duty.
- **Works offline:** tasks and bookings made with no signal are saved in an
  **offline queue** and replayed automatically when the connection returns.
  The last dashboard is cached for viewing offline.
- **Signing in:** open the profile/role control, choose your role, and confirm.
  In the pilot this sets a demo session; production will use your government
  email plus **MFA**.
- **In any real emergency, call emergency services first** — the in-app SOS is
  an aid, not a replacement for calling for help.

## Quick emergency & support reference

| Situation | Do this |
|---|---|
| Life-threatening emergency | Call **999** (MERS999), then press and hold the in-app **SOS** button |
| In-app SOS | Press-and-hold the red **SOS** button → dispatches MPK Kluang, APM and Klinik Kesihatan |
| Wildlife (macaque) encounter | Leave Zone A quietly, secure food, follow signage; report to a ranger |
| Facility/IoT fault | Ranger board → set status; P1 faults auto-flag command centre |
| Access / login problem | Contact MPK IT / Super Admin (see handbook 07) |
| Data / PDPA request | Route to the Auditor/Super Admin process (handbooks 06/07) |

---
*Pilot deployment: Gunung Lambak, Kluang, Johor. Budget reference MYR 2.8M,
12-month optimum pilot. These handbooks describe the pilot build; production
login uses real identity + MFA.*
