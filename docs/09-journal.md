# 09 — Journal Module

**Current Completeness:** 30%  
**Target Completeness:** 100%  
**Priority:** P2 — Medium  
**Depends On:** Habits module (habit → mood correlation), Sleep module (sleep → mood correlation)  
**Feeds Into:** Insights engine (mood patterns), Habits module (reflection prompts)

---

## 1. Current State Analysis

### 1.1 Existing Models

| Model | Fields | Assessment |
|---|---|---|
| `JournalEntry` | id, date (unique), content (markdown), mood (great/good/okay/bad/terrible), tags (comma-separated) | **Basic.** One entry per day, free-form markdown, mood rating. |

### 1.2 Why 30%?

Almonzer has a **structured 3-tier journaling system**:
1. **Morning (5 min):** Intention setting — what matters today, one thing to ship
2. **Evening (3-line):** What I shipped / What tomorrow holds / What got in the way
3. **Weekly Sunday:** Full reflection — wins, lessons, adjustments for next week

The current model has one entry per day (unique constraint on date) and no structure. He can't do morning + evening entries, can't follow his 3-line format, and can't distinguish a Sunday review from a regular entry.

Critical gaps:
1. **No multiple entries per day.** Morning intention and evening review are separate entries.
2. **No structured prompts.** The 3-line format isn't enforced or guided.
3. **No mood ↔ habit correlation.** Does gym → better mood? Poor sleep → worse mood?
4. **No photo/voice attachments.** He records himself for speech improvement.
5. **No entry type differentiation.** Morning intention, evening review, and weekly review are different formats with different prompts.

---

## 2. Target State — Functional Requirements

### 2.1 New Models

#### JournalTemplate
```prisma
model JournalTemplate {
  id          String   @id @default(uuid())
  name        String   // "Morning Intention", "Evening Review", "Weekly Reflection"
  entryType   String   @unique // morning_intention, evening_review, weekly_review
  prompts     Json     // [{field: "shipped", label: "What I shipped today", type: "text"}, ...]
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
}
```

### 2.2 Changes to Existing Models

#### JournalEntry — Add:
```prisma
entryType     String   @default("free") // morning_intention, evening_review, weekly_review, free
structuredData Json?   // for template-based entries: { intention: "...", shipped: "...", tomorrow: "...", blocker: "..." }
photoPath     String?  // attached photo
audioPath     String?  // voice note
wordCount     Int?     // computed
```

And remove the `@@unique([date])` constraint — allow multiple entries per day (morning + evening).

---

## 3. Target State — Technical Requirements

### 3.1 New API Routes

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/productivity/journal/templates` | GET, POST | Template CRUD with seed data |
| `/api/productivity/journal/stats` | GET | Writing streak, mood trend, word count stats |
| `/api/productivity/journal/correlation` | GET | Mood ↔ habits, mood ↔ sleep, mood ↔ glucose |

### 3.2 Default Templates (Seeded)

**Morning Intention:**
```json
{
  "name": "Morning Intention",
  "entryType": "morning_intention",
  "prompts": [
    { "field": "intention", "label": "What matters today?", "type": "textarea", "required": true },
    { "field": "ship", "label": "One thing I will ship today", "type": "text", "required": true },
    { "field": "gratitude", "label": "One thing I'm grateful for", "type": "text" }
  ]
}
```

**Evening Review (3-Line):**
```json
{
  "name": "Evening Review",
  "entryType": "evening_review",
  "prompts": [
    { "field": "shipped", "label": "What I shipped today", "type": "textarea", "required": true },
    { "field": "tomorrow", "label": "What tomorrow holds", "type": "textarea", "required": true },
    { "field": "blocker", "label": "What got in the way", "type": "textarea", "required": true }
  ]
}
```

**Weekly Reflection (Sunday):**
```json
{
  "name": "Weekly Reflection",
  "entryType": "weekly_review",
  "prompts": [
    { "field": "wins", "label": "Wins this week", "type": "textarea", "required": true },
    { "field": "lessons", "label": "Lessons learned", "type": "textarea" },
    { "field": "adjustments", "label": "What I'll adjust next week", "type": "textarea", "required": true },
    { "field": "gym", "label": "Training: sessions completed / planned", "type": "text" },
    { "field": "prayers", "label": "Prayer consistency this week", "type": "text" },
    { "field": "quran", "label": "Quran progress this week", "type": "text" },
    { "field": "finance", "label": "Money: spent / income / notes", "type": "text" }
  ]
}
```

### 3.3 Mood Correlation Engine

```typescript
// lib/mood-correlation.ts
async function getMoodCorrelations(days: number = 30): Promise<{
  gymImpact: { gymDays: number; restDays: number; gymMood: number; restMood: number };
  sleepImpact: { goodSleepMood: number; poorSleepMood: number };
  glucoseImpact: { inRangeMood: number; highMood: number; lowMood: number };
}> {
  // Join JournalEntry mood with HabitLog (gym), SleepSession (hours), GlucoseReading (in-range)
  // Return average mood scores per condition
}
```

---

## 4. UI/UX Requirements

### 4.1 Journal Dashboard

```
┌──────────────────────────────────────────────────────────────┐
│ Journal                                    June 17, 2026     │
│ ┌───────────┬───────────┬───────────┬──────────────────────┐ │
│ │ Streak    │ Entries   │ This Week │ Avg Mood            │ │
│ │ 12 days   │ 142 total │ 5/7       │ 😊 Good (3.8)       │ │
│ └───────────┴───────────┴───────────┴──────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Today's Entries                          [New Entry]     │ │
│ │ 🌅 Morning    "Ship VantLaunch DM templates..."  08:15  │ │
│ │ 🌙 Evening    (pending — reminder at 21:00)              │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Mood Trend (14 days)                                     │ │
│ │ 😊 Mon  Tue  Wed  Thu  Fri  Sat  Sun                    │ │
│ │     😊   😐   😊   😊   😔   😐   😊                     │ │
│ │                                                          │ │
│ │ Correlations:                                            │ │
│ │ Gym days → avg mood 4.2/5   Rest days → avg mood 3.5/5  │ │
│ │ <6h sleep → avg mood 3.0/5   7h+ → avg mood 4.0/5       │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Recent Entries                                           │ │
│ │ Jun 16 🌙 "Shipped: outreach research. Tomorrow: send..."│ │
│ │ Jun 16 🌅 "Today matters: close first client conversation"│ │
│ │ Jun 15 🌙 "Shipped: fixed TeraMotors bug. Blocker: ..."  │ │
│ │ Jun 14 📋 Weekly: "Wins: 5/6 gym. Lessons: outreach >.." │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 Entry Flow

**Morning (triggered at 06:00 notification):**
1. "Good morning. What matters today?" → textarea
2. "One thing you will ship today" → single line
3. "One thing you're grateful for" → single line (optional)
4. Mood: 😊 Great / 😐 Okay / 😔 Struggling
5. Save → appears on dashboard

**Evening (triggered at 20:30 notification):**
1. "What did you ship today?" → textarea (pre-filled if morning had ship intention?)
2. "What does tomorrow hold?" → textarea
3. "What got in the way?" → textarea
4. Mood: how was today overall?
5. Save → cross-reference: did you ship what you intended this morning?

**Weekly (triggered Sunday morning):**
1. Full reflection form with all prompts
2. Mood: overall week rating
3. Auto-pulls stats: gym sessions completed, prayer consistency, pages memorized
4. Save → weekly report generated

---

## 5. Implementation Steps

1. Add `JournalTemplate` model + new fields to `JournalEntry`, remove date unique constraint
2. Create `lib/mood-correlation.ts`
3. Seed default templates
4. API routes: templates, stats, correlation
5. UI: structured entry forms per template, mood chart, correlation insights
6. Notification scheduling: morning at 06:00, evening at 20:30, Sunday morning
7. Tests

---

## 6. Acceptance Criteria

1. Morning: tap notification → structured form with 3 prompts → submit → "Morning Intention" entry saved
2. Evening: 20:30 reminder → 3-line review form → mood 😊 → entry saved
3. Sunday: weekly reflection with all prompts + auto-pulled stats → "Weekly Review" entry
4. Mood chart: 14-day trend with emoji visualization
5. Correlation: "Gym days: mood 4.2/5. Rest days: 3.5/5. Schedule gym daily."
6. Writing streak: "12 consecutive days with at least 1 entry"
