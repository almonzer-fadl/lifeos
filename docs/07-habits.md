# 07 — Habits Module

**Current Completeness:** 40%  
**Target Completeness:** 100%  
**Priority:** P1 — High  
**Depends On:** Prayer module (prayer streak), Journal module (mood correlation)  
**Feeds Into:** Journal module (habit → mood), T1D module (habit → health outcomes), Prayer module (streak reinforcement)

---

## 1. Current State Analysis

### 1.1 Existing Models

| Model | Fields | Assessment |
|---|---|---|
| `Habit` | id, name, frequency (daily/weekly/monthly), frequencyCount, timeOfDay, category, color | **Functional.** Covers basic habit definition. |
| `HabitLog` | id, habitId, date, completed (Boolean), notes | **Simple.** One log per habit per day. Cannot handle multi-per-day habits. |

### 1.2 Why 40%?

Almonzer's habits are **specific, structured, and non-negotiable**:
- 5x daily prayers (multi-per-day, not just "completed yes/no")
- Daily gym 06:00-07:00 (time-specific)
- Quran memorization (target: X pages/week)
- Language study (15 min French/day minimum)
- Sleep protocol (21:45 bed, 21:00 screens off)
- Sunday rest (no deep work)

Critical gaps:
1. **No streak tracking.** The single most motivating metric. Currently derivable from HabitLog but not computed or displayed.
2. **No multi-per-day support.** Prayers happen 5x daily. HabitLog has one entry per habit per day (unique constraint on habitId+date).
3. **No time-of-day compliance.** Gym at 06:00 is different from gym at 09:00. Logging only captures "did it" not "did it on time."
4. **No weekly target tracking.** Quran: 5 pages/week. French: 105 minutes/week. Need weekly rollups vs targets.
5. **No habit correlation.** Does missing gym correlate with worse glucose? Worse mood?

---

## 2. Target State — Functional Requirements

### 2.1 New Models

#### HabitStreak
```prisma
model HabitStreak {
  id          String   @id @default(uuid())
  habitId     String   @unique
  currentStreak  Int   @default(0)
  longestStreak  Int   @default(0)
  lastCompletedAt DateTime?
  updatedAt   DateTime @updatedAt
}
```

### 2.2 Changes to Existing Models

#### Habit — Add:
```prisma
targetCount       Int      @default(1) // completions per period (1 = daily, 5 = prayers, 7 = pages/week)
targetValue       Float?   // if measuring quantity: 15 (minutes), 5 (pages), 3 (liters)
targetUnit        String?  // "minutes", "pages", "liters", "times"
isNonNegotiable   Boolean  @default(false) // appears in "core habits" section
streakOn          Boolean  @default(true)  // track streak for this habit
color             String?  // for UI display
streak            HabitStreak?
```

#### HabitLog — Add:
```prisma
completedAt   DateTime?  // actual time completed (for time-of-day compliance)
value         Float?     // for quantifiable habits: minutes studied, pages memorized, liters drank
timeOfDay     String?    // morning, afternoon, evening, night (overrides habit default)
```

And remove the `@@unique([habitId, date])` constraint — replace with:
```
@@unique([habitId, date, completedAt]) // allows multiple entries per day
```

Or better: keep `@@unique([habitId, date])` but add a `count` field:
```prisma
count       Int        @default(1) // how many times completed this day (for multi-per-day)
```

Actually, for multi-per-day tracking we need each completion to be a separate log. Remove the unique constraint or make it `@@unique([habitId, date, timeOfDay])` for time-slot habits.

Better approach — add a session concept:

#### HabitSession
```prisma
model HabitSession {
  id          String   @id @default(uuid())
  habitId     String
  date        DateTime @default(now())
  completedAt DateTime @default(now())
  timeOfDay   String?  // fajr, dhur, asr, maghrib, isha (for prayers)
  value       Float?   // minutes, pages, reps
  notes       String?
  habit       Habit    @relation(fields: [habitId], references: [id], onDelete: Cascade)
  
  @@index([habitId, date])
}
```

This replaces the simple `HabitLog` for habits that need multi-per-day tracking. `HabitLog` stays for simple daily yes/no habits.

### 2.3 Habit Definitions for Almonzer

Pre-seeded habits:

```typescript
const DEFAULT_HABITS = [
  {
    name: "Fajr Prayer", frequency: "daily", targetCount: 1,
    timeOfDay: "fajr", isNonNegotiable: true, streakOn: true
  },
  {
    name: "Dhuhr Prayer", frequency: "daily", targetCount: 1,
    timeOfDay: "dhuhr", isNonNegotiable: true, streakOn: true
  },
  {
    name: "Asr Prayer", frequency: "daily", targetCount: 1,
    timeOfDay: "asr", isNonNegotiable: true, streakOn: true
  },
  {
    name: "Maghrib Prayer", frequency: "daily", targetCount: 1,
    timeOfDay: "maghrib", isNonNegotiable: true, streakOn: true
  },
  {
    name: "Isha Prayer", frequency: "daily", targetCount: 1,
    timeOfDay: "isha", isNonNegotiable: true, streakOn: true
  },
  {
    name: "Morning Gym", frequency: "daily", targetCount: 1,
    timeOfDay: "morning", isNonNegotiable: true, streakOn: true
  },
  {
    name: "Quran Memorization", frequency: "daily", targetCount: 1,
    targetValue: 1, targetUnit: "pages", streakOn: true
  },
  {
    name: "French Study", frequency: "daily", targetCount: 1,
    targetValue: 15, targetUnit: "minutes", streakOn: true
  },
  {
    name: "Sleep Protocol", frequency: "daily", targetCount: 1,
    timeOfDay: "night", isNonNegotiable: true, streakOn: true
  },
  {
    name: "No Deep Work Sunday", frequency: "weekly", targetCount: 1,
    isNonNegotiable: true
  },
  {
    name: "Weekly Review", frequency: "weekly", targetCount: 1
  },
  {
    name: "Malay Study", frequency: "daily", targetCount: 1,
    targetValue: 15, targetUnit: "minutes"
  },
  {
    name: "Spanish Study", frequency: "daily", targetCount: 1,
    targetValue: 10, targetUnit: "minutes"
  },
];
```

---

## 3. Target State — Technical Requirements

### 3.1 New API Routes

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/productivity/habits/streaks` | GET | All habit streaks, sorted by current streak desc |
| `/api/productivity/habits/sessions` | POST, DELETE | Log individual habit sessions (multi-per-day) |
| `/api/productivity/habits/stats` | GET | Weekly completion %, streak leaders, correlations |
| `/api/productivity/habits/today` | GET | Today's habit status: completed, pending, missed |

### 3.2 Streak Calculation

```typescript
// lib/streaks.ts
async function recalculateStreak(habitId: string): Promise<HabitStreak> {
  const logs = await db.habitLog.findMany({
    where: { habitId, completed: true },
    orderBy: { date: "desc" }
  });
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Walk backwards day by day
  for (let i = 0; i < logs.length; i++) {
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);
    const logDate = new Date(logs[i].date);
    logDate.setHours(0, 0, 0, 0);
    
    if (logDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else if (logDate.getTime() < expectedDate.getTime()) {
      break; // gap found
    }
  }
  
  const existing = await db.habitStreak.findUnique({ where: { habitId } });
  const longestStreak = Math.max(streak, existing?.longestStreak || 0);
  
  return db.habitStreak.upsert({
    where: { habitId },
    create: { habitId, currentStreak: streak, longestStreak: longestStreak, lastCompletedAt: logs[0]?.date },
    update: { currentStreak: streak, longestStreak: longestStreak, lastCompletedAt: logs[0]?.date }
  });
}
```

### 3.3 Cross-Module Events

```
habit:completed { habitId, name: "Morning Gym", date }
  → Streak recalculated — if new record: "17 day gym streak — new personal best!"
  → Check: did glucose improve on gym days vs non-gym days? (correlation insight)

habit:missed { habitId, name: "Fajr Prayer", date }
  → Insight: "Fajr missed today. Your prayer streak: 12 days broken. Get back on track tomorrow."
  → Journal prompt: "What got in the way of Fajr today?"

habit:streak_milestone { habitId, name, streak: 30 }
  → Celebration: "30 day gym streak! 🔥 That's elite consistency. Top 2% of humans."
```

---

## 4. UI/UX Requirements

### 4.1 Habits Dashboard

```
┌──────────────────────────────────────────────────────────────┐
│ Habits                                      Today            │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Non-Negotiables                                          │ │
│ │ ○ Fajr     ○ Dhuhr    ○ Asr     ○ Maghrib ○ Isha       │ │
│ │ ✓ Gym (06:15)  ○ Sleep Protocol                          │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Active Habits                                            │ │
│ │ ✓ Gym                  🔥 18 days        06:15 today     │ │
│ │ ○ Quran Memorization   🔥 5 days         0/1 pages       │ │
│ │ ○ French Study         1 day             0/15 min        │ │
│ │ ○ Malay Study          3 days            0/15 min        │ │
│ │ ○ Spanish Study        0 days            0/10 min        │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Weekly Targets                               Progress    │ │
│ │ Quran: 3/5 pages this week                    ██████░░ 60%│ │
│ │ French: 45/105 minutes this week              ████░░░░ 43%│ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Streak Leaders                                           │ │
│ │ 🥇 Gym            18 days                               │ │
│ │ 🥈 Fajr Prayer    12 days                               │ │
│ │ 🥉 Dhuhr Prayer   12 days                               │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 Habit Completion Flow

1. Dashboard shows today's habits as checklist
2. Tap habit → marks complete with spring animation
3. Multi-per-day habits (prayers): each instance shown separately (Fajr/Dhuhr/Asr/Maghrib/Isha)
4. Quantifiable habits: tap → enter value (pages, minutes) → saved
5. Missed habits: shown in muted rose at end of day → "Missed French today. 3-day streak broken."

### 4.3 Celebration Animation

When logging a habit completion:
- Checkmark icon spring-bounces in (scale 0 → 1.2 → 1)
- If streak milestone (7, 14, 30, 60, 90, 365): special animation with sparkle effect
- If all non-negotiables completed for the day: "Perfect Day" banner

---

## 5. Implementation Steps

1. Add `HabitStreak`, `HabitSession` models + new fields to `Habit`, `HabitLog`
2. Remove or modify unique constraint on HabitLog for multi-per-day support
3. Create `lib/streaks.ts` — streak calculation
4. API routes for streaks, sessions, stats, today view
5. Seed default habits (prayers, gym, study)
6. UI: streak display, daily checklist, weekly target progress bars, celebration animations
7. Cross-module: habit → journal prompts, habit → glucose correlation
8. Tests

---

## 6. Acceptance Criteria

1. Daily checklist shows all 5 prayers + gym + study habits, each independently completable
2. Complete gym → streak counter updates to "19 days" → celebration if milestone
3. Weekly target: "Quran: 3/5 pages this week" — progress bar at 60%
4. Miss a day → streak resets → "Gym streak broken at 18 days. Start a new one tomorrow."
5. Prayer completion: tap Fajr → marked ✓ → "4/5 prayers today"
6. Habit-mood correlation: "On days you gym, average mood is 4.2/5. On rest days: 3.5/5."
