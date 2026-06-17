# 05 — Sleep Module

**Current Completeness:** 30%  
**Target Completeness:** 100%  
**Priority:** P2 — Medium  
**Depends On:** T1D module (nocturnal hypo risk), Activity module (training load), Habits module (sleep protocol compliance)  
**Feeds Into:** T1D module (sleep → insulin sensitivity), Activity module (sleep → training readiness), Journal module (sleep → mood)

---

## 1. Current State Analysis

### 1.1 Existing Models

| Model | Fields | Assessment |
|---|---|---|
| `SleepSession` | id, startTime, endTime, quality (1-5), notes, source, stages (SleepStage[]) | **Basic.** Logs when you slept and how well. |
| `SleepStage` | id, sessionId, type (deep/rem/light/awake), startTime, endTime | **Good for wearable data.** But Almonzer doesn't have a wearable that tracks stages. |

### 1.2 Why 30%?

Almonzer has a **strict sleep protocol**: 21:45 bedtime, 05:45 wake (8 hours), no screens 30 min before, white noise, Sunday rest day. Sleep is his T1D stabilizer and athletic recovery engine.

The current module can log "went to bed at X, woke at Y, quality Z." What it **can't do** is answer the questions that matter:

1. **Did he follow his protocol?** Compliance tracking — did laptop actually close at 21:00? In bed at 21:45?
2. **What's his sleep debt?** If he got 6h one night, the cumulative deficit matters.
3. **How does sleep affect his glucose?** Poor sleep = worse insulin sensitivity the next day. This correlation is critical for T1D.
4. **How does training affect his sleep?** Hard workout → deeper sleep or disrupted sleep?
5. **Is Sunday actually a rest day?** Protocol says no deep work on Sunday. Is it happening?

---

## 2. Target State — Functional Requirements

### 2.1 New Models

#### BedtimeRoutine
```prisma
model BedtimeRoutine {
  id                  String   @id @default(uuid())
  date                DateTime @unique // one per night
  screensOffAt        DateTime? // target: 21:00
  inBedAt             DateTime? // target: 21:45
  lightsOutAt         DateTime? // actual sleep start
  wakeAt              DateTime? // actual wake time (target: 05:45)
  whiteNoiseOn        Boolean  @default(false)
  preSleepActivity    String?  // "reading", "stretching", "planning next day", "screens"
  caffeinatedAfter    DateTime? // any caffeine after 14:00?
  lateMeal            Boolean  @default(false) // ate within 2h of bed?
  compliance          Float?   // computed: 0-1 score
  notes               String?
  sleepSessionId      String?  // link to SleepSession
  createdAt           DateTime @default(now())
  
  @@index([date])
}
```

#### SleepDebt
```prisma
model SleepDebt {
  id                String   @id @default(uuid())
  date              DateTime @unique // daily snapshot
  targetHours       Float    @default(8) // user's target
  actualHours       Float    // from SleepSession
  dailyDeficit      Float    // target - actual (negative = surplus)
  cumulativeDeficit Float    // running total of daily deficits (resets to 0 after surplus)
  createdAt         DateTime @default(now())
  
  @@index([date])
}
```

### 2.2 Changes to Existing Models

#### SleepSession — Add:
```prisma
latency          Int?     // minutes to fall asleep
restingHR        Int?     // resting heart rate during sleep (from wearable)
hrv              Float?   // heart rate variability (from wearable)
compliance       Float?   // 0-1: how close to protocol
trainingLoadDay  Float?   // training load from that day (from Activity module)
nextDayGlucose   Float?   // avg glucose next day (for correlation)
```

---

## 3. Target State — Technical Requirements

### 3.1 New API Routes

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/health/sleep/routine` | GET, POST | Bedtime routine logging. GET returns tonight's state. |
| `/api/health/sleep/debt` | GET | Current sleep debt and history. |
| `/api/health/sleep/stats` | GET | Weekly averages, compliance trend, correlation with glucose/training. |
| `/api/health/sleep/correlation` | GET | Sleep ↔ glucose correlation data. Sleep ↔ training load correlation. |

### 3.2 Compliance Calculation

```typescript
// lib/sleep-compliance.ts
function calculateCompliance(routine: BedtimeRoutine): number {
  let score = 0;
  let total = 0;
  
  // Screens off by 21:00 (weight: 2)
  total += 2;
  if (routine.screensOffAt) {
    const diff = (routine.screensOffAt.getTime() - getTargetTime(routine.date, 21, 0)) / 3600000;
    if (diff <= 0) score += 2;
    else if (diff <= 0.5) score += 1; // within 30 min grace
  }
  
  // In bed by 21:45 (weight: 3)
  total += 3;
  if (routine.inBedAt) {
    const diff = (routine.inBedAt.getTime() - getTargetTime(routine.date, 21, 45)) / 3600000;
    if (diff <= 0) score += 3;
    else if (diff <= 0.25) score += 1.5; // 15 min grace
  }
  
  // Wake at 05:45 (weight: 2)
  total += 2;
  if (routine.wakeAt) {
    const diff = Math.abs(routine.wakeAt.getTime() - getTargetTime(routine.date, 5, 45)) / 3600000;
    if (diff <= 0.25) score += 2;
    else if (diff <= 0.5) score += 1;
  }
  
  // No screens activity (weight: 1)
  total += 1;
  if (routine.preSleepActivity && routine.preSleepActivity !== "screens") score += 1;
  
  // No late meal (weight: 1)
  total += 1;
  if (!routine.lateMeal) score += 1;
  
  // White noise (weight: 1)
  total += 1;
  if (routine.whiteNoiseOn) score += 1;
  
  return score / total;
}
```

### 3.3 Sleep Debt Tracking

```typescript
// lib/sleep-debt.ts
function calculateSleepDebt(sessions: SleepSession[], targetHours: number = 8): {
  currentDebt: number;
  trend: "improving" | "worsening" | "stable";
  daysToRecover: number;
} {
  let cumulative = 0;
  const dailyDeficits: number[] = [];
  
  for (const session of sessions) {
    const hours = (session.endTime.getTime() - session.startTime.getTime()) / 3600000;
    const deficit = targetHours - hours;
    cumulative = Math.max(0, cumulative + deficit); // debt resets to 0, can't go below
    dailyDeficits.push(deficit);
  }
  
  const trend = dailyDeficits.slice(-7).reduce((a, b) => a + b, 0) > 0 ? "worsening" : "improving";
  const daysToRecover = Math.ceil(cumulative / 1); // assuming 1h extra per night recovery
  
  return { currentDebt: cumulative, trend, daysToRecover };
}
```

### 3.4 Cross-Module Events

```
sleep:session { hours: 6.2, quality: 2, compliance: 0.4 }
  → Insight: "Only 6.2h sleep — 1.8h deficit. Sleep debt: 4.5h. Poor sleep reduces insulin sensitivity by ~25%. Increase glucose monitoring today."
  → Activity module: "Training readiness: LOW. Consider easy day or rest."
  → Journal prompt: "How does low sleep affect your mood and focus today?"

activity:completed { trainingLoad: 145 }
  → Sleep module: "Hard training day (TRIMP 145). Prioritize full 8h sleep for recovery. Consider magnesium before bed."
```

---

## 4. UI/UX Requirements

### 4.1 Sleep Dashboard

```
┌──────────────────────────────────────────────────────────────┐
│ Sleep                                      7-Day Average     │
│ ┌───────────┬───────────┬───────────┬──────────────────────┐ │
│ │ Last Night│ Sleep Debt│ Compliance│ Avg Quality          │ │
│ │ 7.2h      │ -3.5h     │ 85%       │ ★★★★☆ (3.8)         │ │
│ │ 23:15-06:30│ Recover: │ this week │                      │ │
│ └───────────┴───────────┴───────────┴──────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Protocol Compliance (7 days)                             │ │
│ │ Mon ████████████████████ 95% ✓                           │ │
│ │ Tue ██████████████████░░ 88% ✓                           │ │
│ │ Wed ████████████████████ 92% ✓                           │ │
│ │ Thu ██████████████░░░░░░ 72% △ (screens at 21:30)       │ │
│ │ Fri ████████████████████ 94% ✓                           │ │
│ │ Sat ████████░░░░░░░░░░░░ 45% ✗ (late night)             │ │
│ │ Sun ███████████████████░ 90% ✓ (rest day)                │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Sleep ↔ Glucose Correlation (30 days)                    │ │
│ │ <6h sleep → avg next-day glucose: 158 mg/dL △           │ │
│ │ 7-8h sleep → avg next-day glucose: 125 mg/dL ✓          │ │
│ │ >8h sleep → avg next-day glucose: 118 mg/dL ✓           │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 Bedtime Routine Check-In

A simple nightly form (open at 21:00, remind if not completed by 21:30):
- [ ] Screens off at ____ (pre-filled: 21:00)
- [ ] In bed at ____ (pre-filled: 21:45)
- [ ] White noise on
- [ ] Pre-sleep activity: Reading / Stretching / Planning / Screens (red flag)
- [ ] Caffeine after 14:00?
- [ ] Ate within 2h of bed?

---

## 5. Implementation Steps

1. Add `BedtimeRoutine`, `SleepDebt` models + new fields to `SleepSession`
2. Create `lib/sleep-compliance.ts` and `lib/sleep-debt.ts`
3. API routes for routine logging, debt calculation, stats, correlation
4. UI: routine check-in form, compliance dashboard, sleep-glucose correlation chart
5. Cross-module events: sleep → T1D warnings, sleep → activity readiness
6. Tests

---

## 6. Acceptance Criteria

1. Log bedtime routine → compliance calculated → 85% shows green ✓
2. Sleep 6h → debt increases by 2h → cumulative debt: 4.5h → "3 days to recover"
3. Sleep <6h → next morning: "Poor sleep reduces insulin sensitivity ~25%. Monitor glucose closely today."
4. Correlation chart: shows that <6h sleep correlates with +30 mg/dL avg glucose
5. Sunday compliance flag: if deep work logged on Sunday → "Protocol violation: Sunday is rest day"
