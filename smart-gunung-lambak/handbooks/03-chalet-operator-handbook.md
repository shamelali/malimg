# Handbook 03 — Chalet & Facility Operator

**For:** counter, reception and check-in staff managing chalets, the pool, BBQ
pits and campsites (demo user: **Chalet Operator, operator@mpk.gov.my**).
**Your screens:** the **Visitor** app (what guests see) and the **Ranger-style
operations board** (tasks + facility tiles). You do **not** have command-centre,
finance or admin access.

---

## 1. Your mission

Give visitors a smooth, fast check-in and keep the facilities you own showing
the correct live status. You create and verify bookings, hand over **smart-lock
PINs**, monitor occupancy, and turn units between **cleaning** and **open**.

---

## 2. Signing in & setup

1. Choose the **Chalet Operator** role in the profile control (production: MPK
   email + **MFA**).
2. Set **EN/BM** to match the guest; keep the tablet at the counter charged.
3. Install to the home screen for kiosk-style use.
4. Open the **Visitor** view to see exactly what the guest sees (availability,
   prices, QR ticket) and the operations board to act on it.

---

## 3. What you manage

| Facility | Capacity (pilot) | Notes |
|---|---|---|
| Car park | 120 bays | Live AI occupancy; overflow routes are command decisions |
| Chalets | 10 units | Each booking issues a QR + **4-digit smart-lock PIN** |
| Pool | 80 guests | Headcount + pH monitored; pause entry at capacity/fault |
| BBQ pits | Multiple | Bookable by date |
| Camping | Pitches | Bookable by date |
| Toilets / bins | – | Status + IoT telemetry (ammonia, fill level) |

---

## 4. Core procedures

### 4.1 Create a booking (walk-in or assisted)
1. In the Visitor view, tap the facility card (e.g. **Chalet**).
2. Enter the **guest name**, **party size (1–20)** and **check-in date**
   (`YYYY-MM-DD`), then confirm.
3. The system returns:
   - A **LAMBAK-xxxxx** QR/NFC reference,
   - A **4-digit smart-lock PIN** (chalets only),
   - The amount in RM and the check-in date.
4. Show/print the QR and hand the PIN to the guest.
- API: `POST /api/v1/bookings`
  `{ "facilityId", "guestName", "partySize", "checkInDate" }`.
- If a facility is at capacity the API rejects with an error — offer another
  date or facility.

### 4.2 Check a guest in
1. Ask for the **LAMBAK** reference or scan the guest’s QR / NFC.
2. Confirm name, pax and date match.
3. For chalets, confirm the **4-digit PIN** opens the lock; reissue via the
   booking if the lock was reset.
4. Update the unit tile as needed (see 4.4).

### 4.3 Monitor occupancy & pricing
- Each facility card shows **used / capacity** and a fill bar; it turns amber
  over ~80%.
- Price range configuration is **RM5–RM120**; you cannot edit prices — that is
  an Admin/Manager setting.
- Pool headcount and pH are sensor-assisted; stop entries when full or unsafe.

### 4.4 Turn a facility over
1. After checkout, tap the unit tile to **cleaning** (amber) so it stops selling.
2. When housekeeping confirms it, tap again to **open** (green).
3. Set **full / out of service** (red) for faults and tell a ranger/manager.
- API: `PATCH /api/v1/facilities`.

### 4.5 Handle the car-park question
- Guests see the same live bay map you do. When occupancy passes 80% and the
  command centre forecasts overflow (weekends often “full by 08:30”), direct
  guests to the advised **ECONSAVE-junction overflow route** once announced.

### 4.6 Offline at the counter
- Bookings and status changes made during an internet outage are **queued** and
  replayed in order when restored; tell guests their reference is confirmed and
  will sync shortly.
- Tap **Sync** to flush the queue; wait until it reads zero.

---

## 5. What guests will ask you

| Guest question | Your action |
|---|---|
| “Where is my door PIN?” | Look up the LAMBAK booking; re-read the 4-digit PIN |
| “Can I change date / add people?” | Re-book with correct date/pax (max 20); refunds → manager |
| “Is there parking?” | Show live bays; use overflow route when announced |
| “Pool full?” | Check headcount tile; pause entry at 80/80 or pH fault |
| “SOS / someone hurt” | Escort to/alert a Ranger immediately; emergencies → **999** |

---

## 6. Rules & boundaries

- You **can** create bookings and set operational facility status.
- You **cannot** change prices, capacity configuration, roles, budgets, or audit
  logs — route those to the **Park Manager / Super Admin**.
- Every booking and status change is recorded in the **audit trail** under the
  guest/actor name — enter names correctly.
- Handle guest personal data per **PDPA**; only collect name, pax and date needed
  for the booking.
- Payment in the pilot is recorded as RM; production uses **FPX / DuitNow /
  Touch ‘n Go** — follow the live payment adapter, never take credentials on
  paper.

---

## 7. Quick reference

| Need | Where |
|---|---|
| New booking / QR / PIN | Visitor view → facility card |
| Mark unit cleaning/open | Operations board → facility tile |
| Occupancy & price | Facility cards (used/capacity, RM) |
| Flush offline work | **Sync** button |
| Refund or price dispute | Park Manager |
| Faulty lock/sensor | Ranger task → Park Manager if P1 |
| Medical/emergency | Ranger and **999** |

Keep the board green where units are ready, amber while cleaning, and never
leave a sold unit showing “open” by mistake.
