# 03 — Activity / Exercise Module

**Current Completeness:** 40%  
**Target Completeness:** 100%  
**Priority:** P1 — High  
**Depends On:** T1D module (exercise-glucose correlation)  
**Feeds Into:** T1D module (insulin sensitivity warnings), Body Metrics (weight/measurements), Sleep (training load → recovery)

---

## 1. Current State Analysis

### 1.1 Existing Models

| Model | Fields | Assessment |
|---|---|---|
| `Activity` | id, type (run/swim/bike/walk/hike/other), startTime, endTime, distance(m), elevationGain, heartRateAvg, heartRateMax, calories, notes, source, externalId | **Good foundation.** Covers cardio activities. Missing: GPS data, perceived exertion, training block context, race flag. |
| `ActivitySplit` | id, activityId, splitNumber, distance(m), duration(s), pace(s/km) | **Good.** Used for interval/pace tracking on runs. |
| `GymWorkout` | id, date, name, notes, duration(min) | **Adequate.** Simple workout logging. |
| `GymSet` | id, workoutId, exerciseId, setNumber, weight(kg), reps, rpe (1-10), notes | **Good for weight training.** Missing: warmup flag, rest timer. For calisthenics (bodyweight), the weight field is less useful — needs progression tracking. |
| `Exercise` | id, name (unique), muscleGroup, equipment, instructions, gifUrl, secondaryMuscles | **Good.** Exercise database with search. |

### 1.2 Existing API Routes

All functional: `/api/health/activity`, `/api/health/workouts`, `/api/health/exercises`, `/api/health/exercise-db`. CRUD works. Missing stats/trend endpoints.

---

## 2. Why 40%? — Gap Analysis

Almonzer is a **hybrid athlete** on a structured 6-day/week program:
- Monday: Upper body calisthenics
- Tuesday: Easy run 5-8K
- Wednesday: Full body + core
- Thursday: Tempo run or intervals
- Friday: Upper body strength
- Saturday: Long run (building from 10K to 21K)
- Sunday: Rest

He's training for: KL Marathon (Oct 2026), Sekinchan Ultra 50K (Oct 2026), Ironman 70.3 (2027), Full Ironman (2028).

### Critical Gaps

1. **No personal records.** The primary motivation engine for an athlete. Current 5K: 24:54. Target: sub-22. Current pull-ups: working toward 12+. There's no way to see progress.

2. **No training plan structure.** His week is a fixed template. The OS should know: "Today is Tuesday = easy run" and pre-fill the activity form accordingly.

3. **No progressive overload tracking.** For calisthenics, progression is: assisted → negatives → full reps → weighted. Currently there's no "pull-up progression: 8 → 9 → 10 → 11 → 12" view.

4. **No race calendar.** He has concrete race dates. Countdown timers, training blocks leading to races, taper periods — none of this exists.

5. **No heart rate zone configuration.** He tracks HR but doesn't have Z1-Z5 defined. For an endurance athlete, HR zone training is fundamental.

6. **No GPS/route data.** Runs have distance but no route map, splits have pace but no elevation-per-split.

7. **No training load / strain.** Preventing overtraining is critical with T1D. Need a simple training load score.

8. **No bodyweight-specific tracking.** GymSet tracks weight(kg) + reps — great for barbell work. For pull-ups (bodyweight), dips (bodyweight), push-ups — the "weight" is ~70kg and never changes. Need a different metric.

### Not Needed
- Social features / sharing (solo training)
- Training plan marketplace
- Coach integration
- Live tracking

---

## 3. Target State — Functional Requirements

### 3.1 New Models

#### PersonalRecord
```prisma
model PersonalRecord {
  id              String   @id @default(uuid())
  activityType    String   // run, swim, bike, pull_ups, dips, push_ups, squat, deadlift, bench, etc.
  distance        Float?   // for distance-based: 5000 for 5K, 21097 for half marathon
  metric          String   // "time", "reps", "weight", "distance"
  value           Float    // the record value: seconds for time, reps count, kg for weight, meters for distance
  unit            String   // "seconds", "reps", "kg", "meters"
  achievedAt      DateTime
  activityId      String?  // FK to Activity (for verified records)
  notes           String?
  createdAt       DateTime @default(now())
  
  @@unique([activityType, distance, metric]) // one record per type+metric
  @@index([activityType])
}
```

Example records:
```
{ activityType: "run", distance: 5000, metric: "time", value: 1494, unit: "seconds" }  // 24:54
{ activityType: "run", distance: 13000, metric: "time", value: 5346, unit: "seconds" } // 1:29:06 Sapanca
{ activityType: "pull_ups", distance: null, metric: "reps", value: 8, unit: "reps" }
{ activityType: "dips", distance: null, metric: "reps", value: 12, unit: "reps" }
```

#### TrainingBlock
```prisma
model TrainingBlock {
  id              String   @id @default(uuid())
  name            String   // "KL Marathon Prep", "Base Building", "Ironman 70.3 Prep"
  type            String   // macro_cycle, meso_cycle, micro_cycle
  goal            String   // "Sub-4 marathon", "Complete Ironman"
  startDate       DateTime
  endDate         DateTime
  status          String   @default("planned") // planned, active, completed, abandoned
  notes           String?
  parentBlockId   String?  // self-ref for nested blocks
  activities      Activity[]
  createdAt       DateTime @default(now())
  
  @@index([startDate])
  @@index([status])
}
```

#### Race
```prisma
model Race {
  id              String   @id @default(uuid())
  name            String   // "KL Standard Chartered Marathon"
  raceType        String   // marathon, half_marathon, ultra_50k, ironman_703, ironman_full, triathlon_sprint
  distance        Float?   // meters
  date            DateTime
  location        String?  // "Kuala Lumpur, Malaysia"
  targetTime      Int?     // target in seconds
  targetPace      Float?   // seconds per km
  status          String   @default("upcoming") // upcoming, completed, dns, dnf
  actualTime      Int?     // actual finish time in seconds
  notes           String?
  trainingBlockId String?  // FK to TrainingBlock
  activityId      String?  // FK to Activity (the race itself, when completed)
  createdAt       DateTime @default(now())
  
  @@index([date])
  @@index([status])
}
```

#### ExerciseProgression
```prisma
model ExerciseProgression {
  id              String   @id @default(uuid())
  exerciseName    String   // "Pull-up", "Dip", "Push-up", "Pistol Squat"
  progressionStep String   // "assisted_band", "negative_only", "full_range", "weighted_5kg", "weighted_10kg"
  currentReps     Int      // max reps at this progression
  targetReps      Int      // target reps before advancing to next step
  achievedAt      DateTime?
  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@unique([exerciseName, progressionStep])
}
```

Example progression for pull-ups:
```
Step 1: "band_assisted" → target 12 reps → achieved → advance
Step 2: "negative_only" → target 8 reps → achieved → advance
Step 3: "full_range" → target 12 reps → currently at 8 reps
Step 4: "weighted_5kg" → target 8 reps → locked
Step 5: "weighted_10kg" → target 5 reps → locked
```

### 3.2 Changes to Existing Models

#### Activity — Add:
```prisma
trainingBlockId    String?  // FK to TrainingBlock
raceId             String?  // FK to Race (if this activity was a race)
isRace             Boolean  @default(false)
perceivedExertion  Int?     // RPE 1-10 (different from set-level RPE)
routeData          Json?    // GPS coordinates: [{lat, lng, elevation, timestamp}]
trainingLoadScore  Float?   // computed: duration * intensity factor
```

#### GymSet — Add:
```prisma
isWarmup      Boolean @default(false)  // warmup sets excluded from volume calc
restSeconds   Int?    // rest time after this set
isBodyweight  Boolean @default(false)  // for calisthenics: weight field is bodyweight
bodyweightKg  Float?  // user's weight at time of exercise (for weighted calisthenics: total = bw + added)
```

---

## 4. Target State — Technical Requirements

### 4.1 New API Routes

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/health/activity/stats` | GET | Activity stats: weekly volume, monthly distance, training load trend |
| `/api/health/activity/prs` | GET, POST | List all PRs. POST: check if new activity beats existing PR → auto-create |
| `/api/health/activity/races` | GET, POST, PATCH, DELETE | Race CRUD |
| `/api/health/activity/training-blocks` | GET, POST, PATCH | Training block CRUD |
| `/api/health/activity/progressions` | GET, POST, PATCH | Exercise progression CRUD |
| `/api/health/workouts/template` | POST, GET | Save/load workout templates ("Monday Upper Body", "Wednesday Full Body") |

### 4.2 PR Detection Logic

```typescript
// lib/prs.ts
async function checkForPR(activity: Activity): Promise<PersonalRecord | null> {
  const existingPR = await db.personalRecord.findFirst({
    where: { activityType: activity.type, distance: activity.type === "run" ? activity.distance : null }
  });
  
  // For runs: compare duration (lower is better)
  if (activity.type === "run" && activity.endTime) {
    const durationSec = (activity.endTime.getTime() - activity.startTime.getTime()) / 1000;
    if (!existingPR || durationSec < existingPR.value) {
      return createPR(activity.type, activity.distance!, "time", durationSec, "seconds", activity.id);
    }
  }
  
  // For calisthenics via GymSet: check highest rep count
  // Triggered after workout completion
  return null;
}
```

### 4.3 Training Load Calculation

Simple Training Impulse (TRIMP) for a solo athlete:

```typescript
// lib/training-load.ts
function calculateTRIMP(activity: Activity): number {
  if (!activity.duration || !activity.heartRateAvg) return 0;
  
  const durationMin = activity.duration / 60;
  const hrReserve = (activity.heartRateAvg - RESTING_HR) / (MAX_HR - RESTING_HR);
  
  // Banister's TRIMP
  const intensityFactor = 0.64 * Math.exp(1.92 * hrReserve);
  return durationMin * hrReserve * intensityFactor;
}
```

Weekly training load → compare to previous weeks → flag if >20% increase (injury risk).

### 4.4 Cross-Module Events

```
activity:completed { type: "run", duration: 5400, distance: 15000, ... }
  → Check for PR (duration vs existing 15K time)
  → If new PR: emit "pr:achieved" event → insight card + celebration
  → T1D module: "15K run completed. Insulin sensitivity increased for 24-48h. Reduce basal tonight."
  → Sleep module: "Hard training day — prioritize 8h sleep tonight."
```

---

## 5. UI/UX Requirements

### 5.1 Activity Dashboard (Redesigned)

```
┌──────────────────────────────────────────────────────────────┐
│ Activity                                   Week 24, 2026     │
│ ┌───────────┬───────────┬───────────┬──────────────────────┐ │
│ │ This Week │ Monthly   │ Streak    │ Next Race            │ │
│ │ 4/6 done  │ 42 km     │ 18 days   │ KL Marathon         │ │
│ │ Rest tomorrow│15,200 cal│          │ 110 days            │ │
│ └───────────┴───────────┴───────────┴──────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Personal Records                                         │ │
│ │ 5K: 24:54 (4:58/km)  ·  Ultra 13K: 1:29:06              │ │
│ │ Pull-ups: 8  ·  Dips: 12                                  │ │
│ │ [View All]    [Set Goal]                                  │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ This Week's Schedule                                     │ │
│ │ Mon ✓ Upper Body    Tue ✓ Easy Run 5K   Wed ○ Full Body  │ │
│ │ Thu ○ Tempo Run     Fri ○ Upper Body    Sat ○ Long Run   │ │
│ │ Sun · Rest                                                 │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Recent Activities                          [Log Activity] │ │
│ │ Sat  Long Run       15.2 km   1:18:22   5:09/km          │ │
│ │ Fri  Upper Body     6 exer    45 min    RPE 8            │ │
│ │ Thu  Tempo Run      7.8 km    34:15    4:23/km           │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### 5.2 Workout Logger (Enhanced)

The existing `workout-logger.tsx` is good. Add:
- **Template loading:** "Monday Upper Body" → loads pull-ups, dips, push-ups, rows with target sets/reps from last session
- **Rest timer:** between sets, countdown timer with vibration (on mobile)
- **Previous session comparison:** below each exercise: "Last time: 8, 7, 6 reps. Today: target 8, 8, 7"
- **RPE quick-select:** emoji scale (😮‍💨 easy → 🥵 max effort) mapping to 1-10
- **Warmup set toggle:** warmup sets shown in muted color, excluded from volume calculations

### 5.3 Race Countdown Widget

Home dashboard widget:
```
┌──────────────────────────┐
│ KL Marathon              │
│ Oct 10, 2026             │
│ ████████████░░░ 110 days │
│ Target: Sub-4 hours      │
│ Training block: Week 3/16│
└──────────────────────────┘
```

---

## 6. Implementation Steps

### Step 1: Database
1. Add `PersonalRecord`, `TrainingBlock`, `Race`, `ExerciseProgression` models
2. Add fields to `Activity`, `GymSet`
3. Run migration

### Step 2: Utilities
1. Create `lib/prs.ts` — PR detection logic
2. Create `lib/training-load.ts` — TRIMP calculation
3. Create `lib/heart-rate-zones.ts` — zone calculation from max HR

### Step 3: API Routes
1. Stats, PRs, Races, Training Blocks, Progressions endpoints
2. Workout template save/load

### Step 4: UI Components
1. `components/modules/activity/race-countdown.tsx`
2. `components/modules/activity/pr-board.tsx`
3. `components/modules/activity/weekly-schedule.tsx`
4. Update `workout-logger.tsx` with templates, rest timer, progression tracking
5. Update `activity-form.tsx` with exercise context for T1D

### Step 5: Tests
1. `__tests__/lib/prs.test.ts`
2. `__tests__/lib/training-load.test.ts`

---

## 7. Acceptance Criteria

1. Complete a 5K run in 23:45 → system detects new PR → shows celebration → updates PR board
2. Monday morning: dashboard shows "Upper Body" template pre-loaded with last session's numbers
3. Race page shows: KL Marathon in 110 days, Sekinchan Ultra in 120 days, Ironman 70.3 countdown
4. Pull-up progression: 8 reps logged → goal is 12 → progress bar at 67% → "4 more reps to next level"
5. 15K run completed → T1D module receives event → shows: "Insulin sensitivity elevated for 24-48h"
6. Weekly training load chart shows trend — flags if current week is >20% above average
7. Gym workout: between sets, 90-second rest timer with haptic feedback at 10 seconds remaining
