# Handbook 01 — Visitor & Family

**For:** members of the public, families, and elderly guests visiting Gunung
Lambak.
**You do not need an account or password.** Open the website or install the app
and you are ready.

---

## 1. Welcome

Gunung Lambak is a **4.2 km family loop** with twin peaks and roughly **405 m of
climbing** — a friendly Grade 3/10 day out with full 4G coverage. The app helps
you:

- Buy and carry **e-tickets** (QR + NFC) without queuing.
- See **live car-park bays** before you drive in.
- Book a **chalet, pool slot, BBQ pit or campsite** and get a door PIN.
- Keep children and elderly family members inside a **50 m safe zone**.
- Collect **trail passport stamps** and **gamification points**.
- Stay clear of **monkey-risk zones**.
- Call for help instantly with the **press-and-hold SOS** button.

> BM: *Aplikasi pelawat & keluarga — Selamat datang ke Gunung Lambak.*

---

## 2. Install the app (recommended)

1. Open the site in your phone browser.
2. Tap the browser menu → **“Add to Home screen” / “Install app.”**
3. Launch **Smart Lambak** from your home icon. It opens full-screen and works
   offline.
4. Use the **EN / BM** toggle for your language and the sun/moon icon for
   light/dark mode.

Allow **Location** permission when prompted — this powers the safe zone and
gives rescuers your GPS position in an SOS.

---

## 3. Your home screen, top to bottom

- **Welcome banner:** visitors today, people currently on the trail, and your
  points. The green **Safe zone 50m ON** pill means the geofence is active.
- **Car park:** a live map of **120 bays** — green = free, red = occupied — with
  AI occupancy accuracy (~97%).
- **Facility booking:** chalet, pool, BBQ and camping cards showing price (RM),
  slots used and a fill bar.
- **Trail passport stamps:** five checkpoints — **BASE, CP1, NORTH, SOUTH,
  MAST**.
- **Monkey-risk zones:** A (high), B (medium), C (low).
- **Big red SOS button** at the bottom.

---

## 4. Everyday tasks

### 4.1 Get your e-ticket (QR + NFC)
1. Tap **“e-Ticket QR+NFC.”**
2. Your ticket appears with a **LAMBAK-xxxxx** reference and a QR code.
3. Scan it (or tap the NFC pad) at the entry gate — no paper, no counter queue.

### 4.2 Check car-park availability
- Open the app before arriving. Free bays are green. When occupancy passes
  **80%**, the counter turns amber and the command centre may open the overflow
  route via the ECONSAVE junction.

### 4.3 Book a facility
1. Tap a **chalet / pool / BBQ / camping** card.
2. Enter your name, party size (**1–20 people**) and date, then confirm.
3. You receive a **QR reference** and, for smart-lock chalets, a **4-digit door
   PIN** valid for your check-in date.
4. Show the QR at reception; key the PIN into the chalet lock.
- Example API behind the button: `POST /api/v1/bookings`
  `{ "facilityId": "fac-chalet", "guestName": "...", "partySize": 4,
  "checkInDate": "YYYY-MM-DD" }`.

### 4.4 Keep the family together (safe zone)
1. Tap **“Safe zone on” / “Zon selamat aktif”** to enable the **50 m geofence**.
2. Use **“Child link”** and **“Elderly link”** to pair family members.
3. If a linked person moves outside 50 m, the app raises an alert.

### 4.5 Collect trail passport stamps
1. At each checkpoint, tap its card (**BASE → CP1 → NORTH → SOUTH → MAST**).
2. A successful stamp turns the card green and awards **15 points** per stamp.
3. Collect all five to complete the family loop and top the leaderboard.
- Behind the button: `POST /api/v1/checkpoints/NORTH`.

### 4.6 Explore trails and record a hike
The app includes a full hiking companion (the **Trails (Denai)**, **Record
(Rekod)** and **My Hikes (Denai Saya)** tabs):

1. **Trails** — browse **8 Johor trails** (the Gunung Lambak family loop, North
   and South peaks, Belumut, Ledang and more) with difficulty
   (Easy/Moderate/Hard), distance, elevation gain, estimated time, star rating,
   tags, on-trail weather and an animated route map. Use **search** and the
   difficulty chips; tap the **bookmark** to save a trail for later.
2. **Record** — pick a trail and press the big green **START HIKE** button. Live
   stats show elapsed time, distance, pace (min/km), elevation, steps and a
   hiker icon moving along a **progress-to-summit** bar. Use **Pause/Resume**;
   **Stop & save** opens a summary with time, distance, pace, elevation, steps
   and **calories**.
3. Tracking uses your **GPS** when available and automatically falls back to an
   offline estimate with no signal, so it keeps working on the trail. A saved
   hike awards **+25 points** and is queued for sync if you are offline.
4. **My Hikes** — your totals (hikes, km, elevation, hours), a weekly distance
   chart, earned/locked **badges** (Trail Pioneer, Early Bird, Summit Seeker,
   Waterfall Hunter, Five Trails, Fire Trail 25 km) and a dated hike log.
- On the trail detail page, tap **Start hike** to jump straight into recording;
  the recorder also has an **Emergency SOS** button.

### 4.7 Stay safe around monkeys
- **Zone A — Long-tailed macaque (high risk):** keep food sealed, use bin
  locks, do not feed.
- **Zone B — Pig-tailed macaque (medium):** keep distance.
- **Zone C — Dusky leaf monkey (low):** observe quietly.
- The app’s ML model predicts activity and prompts bin locks + signage.

---

## 5. SOS — how to get help

1. **In a life-threatening emergency, call 999 first.**
2. Open the app and **press and hold the big red SOS button** (tap also works),
   then confirm.
3. The alert automatically includes:
   - Your **live GPS location** (with a safe fallback position if GPS is
     denied: approx. **2.02509, 103.34437**),
   - **Number of linked family members**,
   - Your **phone battery %**, so responders know how long you can stay in
     contact.
4. It is dispatched to **MPK Kluang, APM (Civil Defence) and Klinik
   Kesihatan**; target response ETA is about **8 minutes**, with acknowledgement
   under 60 seconds.
- **No signal?** The SOS is saved with GPS in the **offline queue** and sends
  automatically when you regain signal. **Do not rely on this alone — also call
  emergency services as soon as you can.**

---

## 6. Tips & FAQs

- **Do I need to register?** No for the pilot. Bookings and tickets work as a
  walk-in visitor; the name you enter is printed on your booking.
- **Does it use my data?** Only what is needed for safety and your booking,
  handled under **PDPA**. You can ask MPK about consent and data removal.
- **No signal on the trail?** The cached map/dashboard and offline queue keep
  working; actions sync later.
- **Points not updating?** Reconnect to the internet and the stamps/points sync.
- **Lost chalet PIN?** See the chalet counter operator (handbook 03) with your
  LAMBAK reference.

---

## 7. When to ask a human

| Need | Who |
|---|---|
| Door PIN / booking change / refund | Chalet & Facility Operator |
| Injury, lost party, wildlife conflict | Any **Ranger** (uniformed) |
| Medical emergency | **999** then in-app **SOS** |
| Safety on the trail | Ranger / Command Centre |

Enjoy the climb, stay inside the safe zone, keep food away from monkeys, and
keep your phone charged. Selamat mendaki!
