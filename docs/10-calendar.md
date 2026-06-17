# 10 — Calendar Module

**Current Completeness:** 15%  
**Target Completeness:** 100%  
**Priority:** P2 — Medium  
**Depends On:** Tasks module (time blocks), Prayer module (prayer times)  
**Feeds Into:** Tasks module (scheduled tasks), Prayer module (prayer time display)

---

## 1. Current State Analysis

### 1.1 Existing Models

| Model | Fields | Assessment |
|---|---|---|
| `CalendarEvent` | id, externalId (CalDAV UID), title, description, startTime, endTime, location, source (manual/caldav) | **Basic.** Simple event storage with iCloud sync. |

### 1.2 Why 15%?

Almonzer lives by a **rigid time-blocked schedule**. Every hour has a purpose:

```
05:45 Wake
06:00-07:00 Gym
07:00-07:30 Shower + Breakfast
07:30-09:00 Deep Work 1
09:00-13:00 University
13:00-14:00 Lunch
14:00-16:00 Deep Work 2
16:00-17:00 Admin
17:00-18:00 Free
18:00-19:00 Dinner
19:00-21:00 Light Work
21:00 Laptop closes
21:45 In bed
```

Plus 5 daily prayers at calculated times based on KL location.

The current calendar module stores events but cannot represent his actual life because:
1. **No recurring events.** Everything in his schedule repeats daily/weekly.
2. **No time block templates.** His day IS a template.
3. **No prayer time integration.** Prayer times change daily based on sun position.
4. **No block compliance.** Did he actually do Deep Work during Deep Work block?

---

## 2. Target State — Functional Requirements

### 2.1 New Models

#### TimeBlockTemplate
```prisma
model TimeBlockTemplate {
  id            String   @id @default(uuid())
  name          String   // "Deep Work 1", "Gym", "University", "Admin"
  startTime     String   // "07:30" (HH:mm, timezone-aware)
  endTime       String   // "09:00"
  daysOfWeek    String   // "1,2,3,4,5" (0=Sun, 1=Mon, ..., CSV of applicable days)
  color         String?  // for calendar display
  type          String   // fixed (always at this time), prayer (calculated), variable
  isActive      Boolean  @default(true)
  sortOrder     Int      @default(0)
  createdAt     DateTime @default(now())
}
```

Pre-seeded templates:
```typescript
const TIME_BLOCKS = [
  { name: "Gym", startTime: "06:00", endTime: "07:00", daysOfWeek: "1,2,3,4,5,6", color: "#e85460", type: "fixed" },
  { name: "Shower + Breakfast", startTime: "07:00", endTime: "07:30", daysOfWeek: "1,2,3,4,5,6,0", color: "#929ca9", type: "fixed" },
  { name: "Deep Work 1", startTime: "07:30", endTime: "09:00", daysOfWeek: "1,2,3,4,5", color: "#c8a85b", type: "fixed" },
  { name: "University", startTime: "09:00", endTime: "13:00", daysOfWeek: "1,2,3,4,5", color: "#689dc8", type: "fixed" },
  { name: "Lunch", startTime: "13:00", endTime: "14:00", daysOfWeek: "1,2,3,4,5,6,0", color: "#929ca9", type: "fixed" },
  { name: "Deep Work 2", startTime: "14:00", endTime: "16:00", daysOfWeek: "1,2,3,4,5", color: "#c8a85b", type: "fixed" },
  { name: "Admin", startTime: "16:00", endTime: "17:00", daysOfWeek: "1,2,3,4,5", color: "#a08ef5", type: "fixed" },
  { name: "Free", startTime: "17:00", endTime: "18:00", daysOfWeek: "1,2,3,4,5,6,0", color: "#3ec488", type: "fixed" },
  { name: "Dinner", startTime: "18:00", endTime: "19:00", daysOfWeek: "1,2,3,4,5,6,0", color: "#929ca9", type: "fixed" },
  { name: "Light Work", startTime: "19:00", endTime: "21:00", daysOfWeek: "1,2,3,4,5,6", color: "#d58b45", type: "fixed" },
  { name: "Laptop Closes", startTime: "21:00", endTime: "21:00", daysOfWeek: "1,2,3,4,5,6,0", color: "#e85460", type: "fixed" },
  { name: "Bed", startTime: "21:45", endTime: "05:45", daysOfWeek: "1,2,3,4,5,6,0", color: "#586573", type: "fixed" },
  { name: "Sunday Rest", startTime: "00:00", endTime: "23:59", daysOfWeek: "0", color: "#3ec488", type: "fixed" },
];
```

#### BlockCompliance
```prisma
model BlockCompliance {
  id            String   @id @default(uuid())
  date          DateTime
  blockName     String   // "Deep Work 1", "Gym", etc.
  scheduledStart DateTime
  scheduledEnd   DateTime
  actualStart   DateTime?
  actualEnd     DateTime?
  compliance    Float?   // 0-1: how close to schedule
  activity      String?  // what was actually done during this block
  notes         String?
  
  @@unique([date, blockName])
  @@index([date])
}
```

### 2.2 Changes to Existing Models

#### CalendarEvent — Add:
```prisma
isRecurringParent Boolean  @default(false)
recurringRule     String?  // RRULE string (RFC 5545): "FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR"
isPrayerTime      Boolean  @default(false)
isTimeBlock       Boolean  @default(false)
timeBlockTemplateId String? // FK to TimeBlockTemplate
prayerName        String?  // "Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"
hijriDate         String?  // Islamic calendar date
```

---

## 3. Target State — Technical Requirements

### 3.1 Prayer Time Calculation

```typescript
// lib/prayer-times.ts
interface PrayerTimes {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
}

// Using KL coordinates: 3.1390° N, 101.6869° E
// Calculate using standard Islamic calculation methods
function calculatePrayerTimes(date: Date, lat: number = 3.1390, lng: number = 101.6869): PrayerTimes {
  // Implementation using astronomical calculations
  // Method: Muslim World League (MWL)
  // Fajr: 18° below horizon
  // Isha: 17° below horizon
}
```

Prayer times are auto-generated for each day and stored as CalendarEvents with `isPrayerTime: true`.

### 3.2 Daily Schedule Generation

Each night at midnight (or on first login):
1. Fetch today's TimeBlockTemplates for current day of week
2. Calculate prayer times for today
3. Generate CalendarEvents for each time block + prayer
4. If tasks have timeBlockSlot assignments, slot them into the appropriate block
5. Return the full daily schedule

### 3.3 New API Routes

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/calendar/blocks` | GET, POST, PATCH | TimeBlockTemplate CRUD |
| `/api/calendar/today` | GET | Full today's schedule: blocks + prayers + events + tasks |
| `/api/calendar/compliance` | GET, POST | BlockCompliance logging |
| `/api/calendar/prayer-times` | GET | Prayer times for a given date/location |
| `/api/calendar/hijri` | GET | Hijri date conversion |

---

## 4. UI/UX Requirements

### 4.1 Today View (Timeline)

```
┌──────────────────────────────────────────────────────────────┐
│ Today — Wednesday, June 17, 2026  ·  10 Dhu al-Hijjah 1447  │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │  05:45  🌅 Wake                                          │ │
│ │  05:52  🕌 Fajr                                          │ │
│ │  06:00  💪 Gym                    [In Progress]          │ │
│ │  07:00  🚿 Shower + Breakfast                            │ │
│ │  07:30  🧠 Deep Work 1            [Upcoming]             │ │
│ │         □ Draft VantLaunch outreach                      │ │
│ │  09:00  🏫 University             [Upcoming]             │ │
│ │         □ WIA2004 Tutorial                              │ │
│ │  13:00  🍽 Lunch                                         │ │
│ │  13:15  🕌 Dhuhr                                         │ │
│ │  14:00  🧠 Deep Work 2            [Upcoming]             │ │
│ │  16:00  📋 Admin                  [Upcoming]             │ │
│ │  16:38  🕌 Asr                                           │ │
│ │  17:00  🌿 Free                   [Upcoming]             │ │
│ │  18:00  🍲 Dinner                                        │ │
│ │  19:10  🕌 Maghrib                                       │ │
│ │  19:30  💡 Light Work             [Upcoming]             │ │
│ │  20:20  🕌 Isha                                          │ │
│ │  21:00  💻 Laptop Closes                                 │ │
│ │  21:45  😴 In Bed                                        │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 Block Compliance

At the end of each block (or when tapped):
- Did you start on time? (Yes / Late by X min / Skipped)
- What did you actually do? (Pre-filled with task list for the block)
- Notes

Weekly compliance view:
```
Deep Work 1:  ████████████████░░ 85% (4/5 days on time, 1 started late)
Deep Work 2:  ██████████░░░░░░░░ 55% (3/5 days, 2 skipped)
Gym:          ████████████████████ 100% (6/6 days on time)
```

---

## 5. Implementation Steps

1. Add `TimeBlockTemplate`, `BlockCompliance` models + new fields to `CalendarEvent`
2. Create `lib/prayer-times.ts` — prayer time calculation for KL
3. Create `lib/hijri.ts` — Hijri date conversion
4. API routes: blocks, today, compliance, prayer times, hijri
5. UI: timeline view, block compliance check-in, prayer time display
6. Daily schedule generator: runs on first login each day
7. Tests

---

## 6. Acceptance Criteria

1. Open Calendar → today's timeline shows all 14 time blocks + 5 prayer times in chronological order
2. Prayer times auto-calculated for KL: Fajr 05:52, Dhuhr 13:15, Asr 16:38, Maghrib 19:10, Isha 20:20
3. Tap "Deep Work 1" → log compliance: "Started at 07:35 (5 min late) — worked on VantLaunch outreach"
4. Hijri date displayed: "10 Dhu al-Hijjah 1447"
5. Tasks assigned to "Deep Work 1" slot appear nested under that block in timeline
6. Weekly compliance: "Gym: 6/6 (100%), Deep Work 1: 4/5 (80%), Deep Work 2: 3/5 (60%)"
