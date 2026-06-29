# 15 — Prayer / Quran Module

**Current Completeness:** 0% (does not exist)  
**Target Completeness:** 100%  
**Priority:** P1 — High  
**Depends On:** Calendar module (prayer times), Habits module (prayer habit tracking)  
**Feeds Into:** Calendar module (prayer time slots), Habits module (prayer streak)

---

## 1. Rationale

Almonzer's spiritual practice is central to his identity and daily structure:

**Prayers (Salah):** 5x daily, non-negotiable. Times change daily based on sun position in KL.
- Fajr (~05:52), Dhuhr (~13:15), Asr (~16:38), Maghrib (~19:10), Isha (~20:20)

**Quran Memorization (Hifz):** 35 pages memorized (Juz 1 + part of Juz 2). Target: full Quran (604 pages) by 2030.
- Method: flow-through revision then new memorization
- Recite to aunt for verification
- Started February 5, 2026
- Was "called out" by his aunt for inconsistency — needs accountability

**Tafsir:** Quranic exegesis journaling planned but not yet started.

Currently exists only as habits (prayer yes/no) and scattered Obsidian notes. No:
- Prayer compliance tracking with times
- Quran memorization velocity ("pages memorized per week")
- Daily/weekly Quran targets
- Memorization quality tracking (how well is it retained?)
- Tafsir journaling
- Qibla direction

---

## 2. Models

### PrayerLog
```prisma
model PrayerLog {
  id          String   @id @default(uuid())
  date        DateTime
  prayer      String   // fajr, dhuhr, asr, maghrib, isha
  status      String   @default("on_time") // on_time, late, qadha (made up), missed
  prayedAt    DateTime? // actual time prayed
  scheduledAt DateTime  // calculated prayer time for that day
  notes       String?
  createdAt   DateTime @default(now())
  
  @@unique([date, prayer])
  @@index([date])
}
```

### QuranProgress
```prisma
model QuranProgress {
  id              String   @id @default(uuid())
  totalPages       Int     @default(604) // target: full Quran
  pagesMemorized  Int      @default(0)  // current: 35
  currentSurah    String?  // "Al-Baqarah"
  currentJuz      Int?     // 2
  currentPage     Int?     // current working page
  targetDate      DateTime? // target: 2030
  method          String?  // "flow-through revision then new memorization"
  teacher         String?  // "Aunt"
  startedAt       DateTime // Feb 5, 2026
  notes           String?
  updatedAt       DateTime @updatedAt
  
  sessions        QuranSession[]
}
```

### QuranSession
```prisma
model QuranSession {
  id              String   @id @default(uuid())
  date            DateTime @default(now())
  type            String   // new_memorization, revision, recitation_to_teacher, tafsir
  startPage       Int?     // page range worked on
  endPage         Int?
  pagesMemorized  Float?   // new pages memorized (can be 0.5)
  pagesRevised     Float?   // pages revised
  duration        Int?     // minutes
  quality         Int?     // 1-5: how well did it go?
  teacherVerified Boolean? // did aunt approve?
  notes           String?
  createdAt       DateTime @default(now())
  
  @@index([date])
}
```

### TafsirEntry
```prisma
model TafsirEntry {
  id          String   @id @default(uuid())
  date        DateTime @default(now())
  surah       String   // surah name
  ayahRange   String   // "2:255" or "2:255-257"
  notes       String   // markdown — reflections, tafsir notes
  source      String?  // "Ibn Kathir", "Al-Jalalayn", "lecture", "personal reflection"
  createdAt   DateTime @default(now())
  
  @@index([date])
  @@index([surah])
}
```

### DhikrLog (Optional — for tracking morning/evening adhkar)
```prisma
model DhikrLog {
  id          String   @id @default(uuid())
  date        DateTime
  type        String   // morning_adhkar, evening_adhkar, after_salah, general
  completed   Boolean  @default(true)
  notes       String?
  createdAt   DateTime @default(now())
  
  @@index([date])
}
```

---

## 3. Technical Requirements

### 3.1 API Routes

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/prayer/log` | GET, POST | Prayer log CRUD. GET: today's prayer status. POST: mark prayer as prayed. |
| `/api/prayer/times` | GET | Today's calculated prayer times for KL |
| `/api/prayer/stats` | GET | Weekly/monthly prayer compliance, streak, on-time % |
| `/api/quran/progress` | GET, PATCH | Quran memorization progress |
| `/api/quran/sessions` | GET, POST, DELETE | Memorization session CRUD |
| `/api/quran/stats` | GET | Pages memorized (total), weekly rate, projected completion date, streak |
| `/api/quran/tafsir` | GET, POST, PATCH, DELETE | Tafsir entry CRUD |

### 3.2 Projection Calculation

```typescript
// lib/quran-projection.ts
function projectCompletion(progress: QuranProgress, sessions: QuranSession[]): {
  pagesRemaining: number;
  avgPagesPerWeek: number;
  weeksRemaining: number;
  projectedDate: Date;
  onTrack: boolean;
  targetPagesPerWeek: number;
} {
  const pagesRemaining = progress.totalPages - progress.pagesMemorized;
  
  // Average over last 4 weeks
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
  const recentSessions = sessions.filter(s => new Date(s.date) >= fourWeeksAgo && s.type === "new_memorization");
  const totalPages = recentSessions.reduce((s, sess) => s + (sess.pagesMemorized || 0), 0);
  const avgPagesPerWeek = totalPages / 4;
  
  const weeksRemaining = pagesRemaining / avgPagesPerWeek;
  const projectedDate = new Date();
  projectedDate.setDate(projectedDate.getDate() + weeksRemaining * 7);
  
  // Target: 604 pages by 2030 (from start Feb 2026 = ~208 weeks = ~2.74 pages/week)
  const totalWeeks = (new Date("2030-01-01").getTime() - progress.startedAt.getTime()) / (7 * 24 * 60 * 60 * 1000);
  const targetPagesPerWeek = (progress.totalPages - 35) / totalWeeks; // 35 already memorized
  
  const onTrack = avgPagesPerWeek >= targetPagesPerWeek;
  
  return { pagesRemaining, avgPagesPerWeek, weeksRemaining, projectedDate, onTrack, targetPagesPerWeek };
}
```

### 3.3 Prayer Time Calculation

Already covered in `docs/10-calendar.md`. Reuse `lib/prayer-times.ts`:
- Location: KL (3.1390° N, 101.6869° E)
- Method: Muslim World League
- Timezone: Asia/Kuala_Lumpur (+8)

---

## 4. UI/UX

### 4.1 Prayer/Quran Dashboard

```
┌──────────────────────────────────────────────────────────────┐
│ Faith                                       June 17, 2026    │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Today's Prayers                                          │ │
│ │ 05:52  Fajr     ✓ On time (05:50)                       │ │
│ │ 13:15  Dhuhr    ○ Upcoming (in 2h 15m)                  │ │
│ │ 16:38  Asr      ○                                       │ │
│ │ 19:10  Maghrib  ○                                       │ │
│ │ 20:20  Isha     ○                                       │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌───────────┬───────────┬───────────┬──────────────────────┐ │
│ │ This Week │ Streak    │ On-Time % │ Quran Target        │ │
│ │ 20/20 ✓  │ 34 days   │ 92%       │ 2.5 pg/wk (on track)│ │
│ └───────────┴───────────┴───────────┴──────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Quran Memorization                                       │ │
│ │ Juz 1: ✓ Complete                                        │ │
│ │ Juz 2: ████████████░░░░░░░░  35/141 pages (25%)         │ │
│ │                                                          │ │
│ │ Progress: 35/604 pages (5.8%)                            │ │
│ │ Weekly avg: 2.5 pages  ·  Projected completion: Dec 2030│ │
│ │ Target: Full Quran by 2030 (on track ✓)                  │ │
│ │                                                          │ │
│ │ This week: 2.5/2.5 pages ✓                              │ │
│ │ [Log Session]                                            │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Recent Sessions                                          │ │
│ │ Jun 17  📖 New memorization  2:255-257  0.5 pages  ★★★★ │ │
│ │ Jun 16  🔄 Revision          Juz 1 (full)  20 pages ★★★★│ │
│ │ Jun 15  🎓 Recited to Aunt   2:250-257    Approved ✓    │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Tafsir Journal                          [New Entry]      │ │
│ │ Jun 14  Al-Fatihah  "The opening — a reminder that..."   │ │
│ │ Jun 10  Al-Baqarah 2:255  "Ayat al-Kursi — the greate..."│ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 Quick Prayer Log

Simple tap interface:
- Dashboard shows 5 prayer slots for today with times and status (pending/completed/missed)
- Tap a prayer → marked as prayed at current time → green checkmark expands with spring animation
- Long press → options: "Prayed on time", "Prayed late", "Made up (Qadha)", "Missed"
- Push notification 5 minutes before each prayer time

### 4.3 Quran Session Logging

After a memorization session:
- Type: New memorization / Revision / Recitation to teacher / Tafsir
- Start page → End page (from Quran)
- Pages memorized (new)
- Pages revised
- Duration
- Quality (1-5)
- Teacher verified? (checkbox)
- Notes

---

## 5. Implementation Steps

1. Add `PrayerLog`, `QuranProgress`, `QuranSession`, `TafsirEntry`, `DhikrLog` models
2. Create/expand `lib/prayer-times.ts` — reuse from Calendar module
3. Create `lib/quran-projection.ts` — completion projection
4. API routes for prayers, quran progress, sessions, tafsir
5. UI: faith dashboard, prayer checklist, Quran progress tracker, session logger, tafsir journal
6. Integration: prayer times → Calendar events, prayer completion → Habits streak, Quran sessions → Education stats
7. Push notifications for prayer times
8. Tests

---

## 6. Acceptance Criteria

1. Dashboard shows today's 5 prayer times with completion status (3/5 done, 2 upcoming)
2. Tap Fajr → marked as "on time" at 05:50 → green checkmark
3. Prayer streak: "34 consecutive days with all 5 prayers on time"
4. Quran progress: "35/604 pages (5.8%). Weekly avg: 2.5 pages. On track for 2030 completion."
5. Log session: "New memorization, Al-Baqarah 2:255-257, 0.5 pages, ★★★★ quality"
6. Teacher verification: mark session as "Aunt approved ✓"
7. Tafsir entry: "Ayat al-Kursi — the greatest verse in the Quran..." saved as markdown
8. Prayer notification: "Maghrib in 5 minutes (19:10)" — push notification
