# Handbook 02 — Ranger & Safety Officer

**For:** trail rangers and safety officers (example demo user: **Ranger Hafiz,
ranger.hafiz@mpk.gov.my**).
**Your device:** a rugged tablet or phone, typically used outdoors with one
hand or gloves. The interface is tablet-first and works fully offline.

---

## 1. Your mission

Keep every visitor safe and every facility serviceable. You are the eyes on the
mountain and the first human responder to SOS alerts. In the app you:

- Work a prioritised **task board** (cleaning, checks, repairs).
- Update **facility status** (open / cleaning / full / fault).
- Watch live **IoT device health** (bins, toilets, pool, cameras).
- Monitor **command-centre KPIs and incidents**.
- Operate offline in poor signal and **sync** when back in coverage.

**Your screens:** Visitor, **Ranger**, Command, SLA.

---

## 2. Signing in

1. Open the app and choose the **Ranger** role in the profile/role control
   (demo sets the `lambak_role` session; production uses your MPK email + **MFA**).
2. Set language **EN/BM** and choose a theme (dark is recommended for night
   rounds).
3. Allow **Location** — required for patrol position and SOS relay.
4. Install to the home screen so the app launches full-screen and stores offline
   work.

---

## 3. The Ranger board, explained

### 3.1 Task list (left column)
Each task shows:
- Title (EN/BM), **assignee**, and **due time**.
- A priority pill: **P1** (red, urgent), **P2** (amber), **P3** (blue, routine).
- A checkbox to complete or reopen it.

Tap the checkbox to toggle. With no signal the change is **queued**, not lost —
the amber **“N queued / N dalam barisan”** pill at the top tells you how many
actions are waiting.

### 3.2 Facility tiles (right column)
You manage **chalets, toilets, waste bins and the pool**. Each tile has a
coloured border:
- **Green** = open / ready.
- **Amber** = cleaning (droplets icon).
- **Red** = full / out of service (trash icon).
Tap a tile to **cycle its status**. Capacity tiles show a fill bar that turns
red above 80%.

### 3.3 Sync button
- **“Sync N offline tasks” / “Segerakkan N tugasan luar talian”** replays your
  queued changes in order when connectivity returns.
- On success the counter returns to zero. (API: `POST /api/v1/sync`.)

### 3.4 IoT device health
Live cards over **MQTT / 4G / edge alerts** show each device’s latest value,
metric, battery % and a status dot:
- 🟢 **live** (pulsing green) · 🟡 **warning** · 🔴 **fault**.
Examples: ultrasonic waste-bin fill %, toilet **ammonia (ppm)** — threshold
**20 ppm**, pool **pH and headcount**, and camera feeds.

---

## 4. Everyday procedures

### 4.1 Start of shift
1. Confirm you’re logged in as Ranger and location is on.
2. Open the **Command** screen for active incidents and visitor load.
3. Review **P1/P2 tasks due today**; tap to acknowledge and begin.
4. Check IoT dots — note any red device before you head out.

### 4.2 Complete a task
1. Tick the checkbox when work is done (add a photo/note in production).
2. If offline, keep working; the action queues automatically.
3. At a coverage point, tap **Sync** and confirm the queue reaches zero.
- API: `PATCH /api/v1/tasks` with `{ "id": "task-2", "completed": true }`.

### 4.3 Turn over a facility (e.g. chalet cleaning)
1. Before cleaning, tap the tile so it reads **cleaning** (amber) — visitors
   see it as unavailable.
2. After inspection, tap again to **open** (green).
3. If full or broken, cycle to the red state and raise the right task/fault.
- API: `PATCH /api/v1/facilities`.

### 4.4 Act on an IoT warning
- **Bin near full / fault:** schedule emptying, create/Prioritise a task.
- **Toilet ammonia ≥ 20 ppm:** close for cleaning, ventilate, reopen when safe.
- **Pool pH out of range or headcount at capacity:** pause entry and notify
  command; capacity breaches are P1.

### 4.5 Respond to an SOS
1. The command centre and your device show the alert with **GPS, linked family
   count and caller battery**.
2. Acknowledge immediately — the target acknowledgement SLA is **under 60
   seconds** (current baseline ~42 s).
3. Coordinate with **APM** and **Klinik Kesihatan**; on-scene ETA target ~8 min.
4. Update the incident severity (P0/P1/P2) and resolution on the board.

---

## 5. Incident severity guide

| Level | Meaning | Examples | Response |
|---|---|---|---|
| **P0** | Life-threatening | Injury, missing child, cardiac event | Immediate MPK + APM + clinic dispatch; SOS ack < 1 min |
| **P1** | Major operation | Car-park overflow, wildlife conflict, major facility fault | Command-centre coordination, extra staff |
| **P2** | Minor request | Cleaning, signage repair, visitor help | Routine task, complete same day |

### Wildlife quick rules
- **Zone A (long-tailed macaque, high):** keep visitors back, secure food/bins.
- **Zone B (pig-tailed, medium)** and **Zone C (dusky leaf monkey, low):**
  monitor; never feed. Escalate conflict to P1.

---

## 6. Offline & connectivity discipline

- Everything you tick or change with no signal is stored in the **IndexedDB
  offline queue** and replayed **in order** on reconnect.
- Always **sync at the trailhead/base** at the end of rounds; confirm 0 queued.
- The last dashboard stays cached, so you still see KPIs in the forest.
- If a queued SOS is present, remember it still sends later — **tell the visitor
  to call 999 immediately** rather than waiting for the app.

---

## 7. Safety, rules & boundaries

- **Do not** change RBAC, prices, or park configuration — that is Admin only.
- You can see the **SLA** screen (monitoring/DR status) but cannot alter it.
- Every status change is written to the **immutable audit log** with your name
  and timestamp — act accurately, never back-date.
- Keep your tablet charged and report battery/device faults; IoT battery levels
  are visible so sensor swaps can be planned.

---

## 8. Quick reference

| Action | How |
|---|---|
| Complete/reopen task | Tick the task checkbox |
| Change facility state | Tap the facility tile (open → cleaning → full) |
| Send queued work | **Sync** button on the Ranger board |
| See visitor load / incidents | **Command** screen |
| Check system uptime/backups | **SLA** screen |
| Emergency | Coordinate via SOS; life threats → **999** |
| Escalate access/config issue | Park Manager → MPK Super Admin |

*“When in doubt, put visitor safety first and log the action.” — Ranger standard
operating note.*
