# Work Split — Life OS v2 Implementation

**Date:** June 17, 2026  
**Team Size:** 2 developers  
**Context:** Full docs in `docs/00-master-architecture.md` through `docs/16-implementation-roadmap.md`

---

## Phase 0 — Foundation (Both Must Complete Before Phase 1)

### 0.1 Event Bus — DONE ✅
- **Owner:** Almonzer
- **File:** `lib/events.ts`, `__tests__/events.test.ts`
- Other person: read and understand, do not modify.

### 0.2 Insight Model + Engine Expansion
- **Owner:** Almonzer
- Files: `prisma/schema.prisma` (add `Insight` model), `lib/insights.ts` (expand rule engine), `components/modules/ai/insights-widget.tsx` (integrate)
- Other person: do not touch. Your events will feed insights. Just emit events and the engine handles the rest.

### 0.3 Notification Model + Service Worker
- **Owner:** Other person
- Files: `prisma/schema.prisma` (add `Notification` model), `lib/notifications.ts`, `app/api/notifications/route.ts`, `public/sw.js` (update)
- Almonzer: do not touch.

### 0.4 Global Search
- **Owner:** Other person
- Files: `prisma/schema.prisma` (add tsvector columns), `lib/search.ts`, `app/api/search/route.ts`

### 0.5 Test DB Setup
- **Owner:** Almonzer
- Files: `vitest.config.ts` (update), `__tests__/setup.ts` (new)

---

## Prisma Schema Coordination — CRITICAL RULES

The schema file `prisma/schema.prisma` is the single biggest conflict point. Rules:

1. **Only one person touches the schema at a time.** Coordinate before any schema change.
2. **Add models at the BOTTOM of the file**, never between existing models.
3. **Use the comment separators already in the file:** `// ─── T1D ───`, `// ─── Activity ───`, etc.
4. **When you add a model, add the matching comment block:**
   ```prisma
   // ─── Your Module ──────────────────────────────────────
   ```
5. **Run `npx prisma migrate dev --name add_your_models` immediately after any schema change.** Push the migration file. The other person pulls and runs `npx prisma migrate dev` (which auto-applies pending migrations).
6. **Never use `prisma db push`** — it skips migration history and breaks the other person's DB state.

---

## PHASE 1 ONWARD — Strict Module Ownership

```
┌─────────────────────────────────────┬─────────────────────────────────────┐
│        ALMONZER (Health)            │      OTHER PERSON (Operations)      │
├─────────────────────────────────────┼─────────────────────────────────────┤
│                                     │                                     │
│  T1D / Diabetes (docs/01-t1d.md)   │  Finance (docs/02-finance.md)      │
│  ├── CarbEntry, ICR, CF            │  ├── Invoice, PaymentReceived       │
│  ├── TargetRange, KetoneReading    │  ├── RunwaySnapshot, Subscription   │
│  ├── InjectionSite                 │  ├── Account/Transaction new fields │
│  ├── GlucoseReading new fields     │  └── All /api/finance/* routes      │
│  ├── InsulinDose new fields        │                                     │
│  ├── BasalRate new fields          │  CRM (docs/11-crm.md)              │
│  ├── lib/iob.ts, lib/bolus.ts      │  ├── Contact, Interaction          │
│  ├── lib/tir.ts, lib/h1bc.ts       │  ├── ContactGroup                  │
│  └── All /api/health/glucose*      │  └── All /api/crm/* routes         │
│       /api/health/insulin*         │                                     │
│       /api/health/bolus-calculator  │  Projects (docs/13-projects.md)    │
│                                     │  ├── Project model expansion       │
│  Nutrition (docs/04-nutrition.md)  │  ├── ProjectMilestone, MRRSnapshot │
│  ├── FrequentFood, FoodCost        │  └── All /api/projects/* routes    │
│  ├── Recipe, RecipeIngredient      │                                     │
│  ├── FastingSession                │  Tasks (docs/08-tasks.md)           │
│  ├── FoodDiaryEntry new fields     │  ├── Subtask, RecurringTaskTemplate │
│  ├── FoodItem new fields           │  ├── TaskTimeBlock                 │
│  ├── lib/net-carbs.ts              │  ├── Task/Project new fields       │
│  └── All /api/health/nutrition/*   │  └── All /api/productivity/tasks/* │
│                                     │                                     │
│  Activity (docs/03-activity.md)    │  Calendar (docs/10-calendar.md)    │
│  ├── PersonalRecord, TrainingBlock │  ├── TimeBlockTemplate             │
│  ├── Race, ExerciseProgression     │  ├── BlockCompliance               │
│  ├── Activity new fields           │  ├── CalendarEvent new fields      │
│  ├── GymSet new fields             │  ├── lib/hijri.ts                  │
│  ├── lib/prs.ts, lib/training-load │  └── All /api/calendar/* routes    │
│  └── All /api/health/activity/*    │                                     │
│                                     │  Journal (docs/09-journal.md)      │
│  Sleep (docs/05-sleep.md)          │  ├── JournalTemplate               │
│  ├── BedtimeRoutine, SleepDebt     │  ├── JournalEntry new fields       │
│  ├── SleepSession new fields       │  ├── lib/mood-correlation.ts       │
│  ├── lib/sleep-compliance.ts       │  └── All /api/productivity/journal*│
│  └── All /api/health/sleep/*       │                                     │
│                                     │  Habits (docs/07-habits.md)        │
│  Body Metrics (docs/06-body.md)    │  ├── HabitStreak, HabitSession     │
│  ├── HbA1cRecord, ThyroidPanel    │  ├── Habit/HabitLog new fields     │
│  ├── SkinCondition, Medication     │  ├── lib/streaks.ts                │
│  ├── BodyMeasurement new fields    │  └── All /api/productivity/habits/*│
│  ├── LabResult new fields          │                                     │
│  └── All /api/health/body-*        │  Education (docs/12-education.md)   │
│       /api/health/lab-*            │  ├── Course, Assignment, Exam      │
│       /api/health/medications      │  ├── GPASnapshot                    │
│                                     │  ├── LanguageProgress, LangSession │
│  Prayer/Quran (docs/15-prayer.md)  │  ├── lib/gpa.ts                    │
│  ├── PrayerLog, QuranProgress      │  └── All /api/education/* routes   │
│  ├── QuranSession, TafsirEntry     │                                     │
│  ├── DhikrLog                      │  Reading (docs/14-reading.md)       │
│  ├── lib/prayer-times.ts           │  ├── Book, BookNote                │
│  ├── lib/quran-projection.ts       │  └── All /api/reading/* routes     │
│  └── All /api/prayer/*             │                                     │
│       /api/quran/*                  │                                     │
└─────────────────────────────────────┴─────────────────────────────────────┘
```

---

## Cross-Module Touchpoints — When We Need Each Other

These are the only places where one person needs something from the other person's module. Handle early.

| # | What | Who Needs It | Who Provides It | Resolution |
|---|---|---|---|---|
| 1 | `lib/prayer-times.ts` | Almonzer (Prayer) AND Other (Calendar) | **Almonzer builds, Other imports** | Almonzer writes it. Calendar imports from `@/lib/prayer-times`. |
| 2 | `lib/hijri.ts` | Other (Calendar) | **Other builds** | Calendar owns Hijri. Prayer imports if needed. |
| 3 | `Project` model expansion | Both | **Other builds** | Other expands Project model. Almonzer's Tasks reference the expanded fields that exist. |
| 4 | `Insight` model writes | Other's events emit → Almonzer's engine generates | **Almonzer owns Insight, Other emits events** | Just emit from `@/lib/events`. The engine listens. |
| 5 | `Notification` model writes | Almonzer's engine generates → Other's notification system delivers | **Other owns Notification** | Almonzer does `await events.emit(EventTypes.INSIGHT_GENERATED, {...})`. Other's notification listener picks it up and creates a Notification row. |
| 6 | Post-meal glucose → Nutrition | Almonzer (T1D and Nutrition are both his) | N/A — both Almonzer | Internal to health stack. |
| 7 | Exercise → T1D warning | Almonzer (both Activity and T1D) | N/A — both Almonzer | Internal to health stack. |
| 8 | Client payment → Project MRR | Other (both Finance and Projects) | N/A — both Other | Internal to operations stack. |
| 9 | Invoice → CRM Contact | Other (both) | N/A — both Other | Internal to operations stack. |
| 10 | Task → Calendar time block | Other (both) | N/A — both Other | Internal to operations stack. |

**Result:** Only 5 real cross-person touchpoints, and 3 of them are just "emit an event" or "import a library."

---

## File Ownership Map — DO NOT EDIT THE OTHER PERSON'S FILES

### Almonzer's Files (DO NOT TOUCH)

```
lib/
  events.ts           ✅ DONE
  iob.ts              (new)
  bolus.ts            (new)
  tir.ts              (new)
  h1bc.ts             (expand)
  prs.ts              (new)
  training-load.ts    (new)
  sleep-compliance.ts (new)
  sleep-debt.ts       (new)
  net-carbs.ts        (new)
  nutrition-insights.ts (new)
  prayer-times.ts     (new)
  quran-projection.ts (new)

app/api/health/
  glucose/route.ts    (expand)
  glucose/stats/route.ts (new)
  insulin/route.ts    (expand)
  insulin/iob/route.ts   (new)
  bolus-calculator/route.ts (new)
  carbs/route.ts      (new)
  ratios/route.ts     (new)
  targets/route.ts    (new)
  ketones/route.ts    (new)
  sites/route.ts      (new)
  activity/stats/route.ts  (new)
  activity/prs/route.ts    (new)
  activity/races/route.ts  (new)
  activity/training-blocks/route.ts (new)
  activity/progressions/route.ts (new)
  sleep/routine/route.ts   (new)
  sleep/debt/route.ts      (new)
  sleep/stats/route.ts     (new)
  body-measurements/route.ts (expand)
  lab-results/route.ts (expand)
  hba1c/route.ts      (new)
  thyroid/route.ts     (new)
  skin/route.ts        (new)
  medications/route.ts (new)
  nutrition/route.ts   (expand)
  nutrition/recipes/route.ts (new)
  nutrition/frequent/route.ts (new)
  nutrition/costs/route.ts (new)
  nutrition/fasting/route.ts (new)

app/api/prayer/
  log/route.ts        (new)
  times/route.ts      (new)
  stats/route.ts      (new)

app/api/quran/
  progress/route.ts   (new)
  sessions/route.ts   (new)
  stats/route.ts      (new)
  tafsir/route.ts     (new)

components/modules/
  t1d/                (expand all)
  nutrition/          (expand all)
  activity/           (expand all)
  sleep/              (expand all)
  body/               (expand all)
  prayer/             (new directory)
```

### Other Person's Files (DO NOT TOUCH)

```
lib/
  search.ts           (new)
  notifications.ts    (new)
  runway.ts           (new)
  invoice.ts          (new)
  streaks.ts          (new)
  recurring-tasks.ts  (new)
  gpa.ts              (new)
  mood-correlation.ts (new)
  hijri.ts            (new)

app/api/finance/
  invoices/route.ts   (new)
  subscriptions/route.ts (new)
  runway/route.ts     (new)
  projection/route.ts  (new)
  dashboard/route.ts  (new)

app/api/crm/
  contacts/route.ts   (new)
  groups/route.ts     (new)
  dashboard/route.ts  (new)
  follow-ups/route.ts (new)

app/api/projects/
  route.ts            (expand)
  milestones/route.ts (new)
  mrr/route.ts        (new)
  dashboard/route.ts  (new)

app/api/productivity/
  tasks/subtasks/route.ts (new)
  tasks/recurring/route.ts (new)
  tasks/today/route.ts    (new)
  tasks/pipeline/route.ts (new)
  habits/streaks/route.ts  (new)
  habits/sessions/route.ts (new)
  journal/templates/route.ts (new)
  journal/stats/route.ts   (new)

app/api/calendar/
  blocks/route.ts     (new)
  today/route.ts      (new)
  compliance/route.ts (new)
  hijri/route.ts      (new)

app/api/education/
  courses/route.ts    (new)
  gpa/route.ts        (new)
  languages/route.ts  (new)

app/api/reading/
  books/route.ts      (new)

app/api/search/       (new)
app/api/notifications/ (new)

components/modules/
  finance/            (expand all)
  crm/                (new directory)
  projects/           (new directory)
  tasks/              (expand all)
  habits/             (expand all)
  journal/            (expand all)
  calendar/           (new directory)
  education/          (new directory)
  reading/            (new directory)
```

### Shared Files (Coordinate Before Editing)

```
prisma/schema.prisma            ← THE DANGER ZONE. Coordinate by message.
app/globals.css                 ← If adding new utility classes, tell the other person.
components/ui/                  ← If adding new UI primitives, tell the other person.
components/layout/shell.tsx     ← If adding new nav items, tell the other person.
app/layout.tsx                  ← If modifying, tell the other person.
app/page.tsx                    ← Dashboard. Both can add widgets to different sections.
docs/                           ← Read-only after Phase 0. Reference only.
```

---

## Work Order Within Each Stack

### Almonzer's Order (Health Stack)
1. T1D models + `lib/iob.ts` + `lib/bolus.ts` + `lib/tir.ts`
2. T1D API routes (glucose stats, insulin IOB, bolus calculator, carbs, ratios, targets, ketones, sites)
3. Nutrition model changes + API
4. T1D + Nutrition UI (bolus calculator, glucose chart with markers, carb-first logging)
5. Activity models + `lib/prs.ts` + `lib/training-load.ts`
6. Activity API + UI
7. Sleep models + `lib/sleep-compliance.ts` + `lib/sleep-debt.ts`
8. Sleep API + UI
9. Body Metrics models + API + UI
10. Prayer/Quran models + `lib/prayer-times.ts` + `lib/quran-projection.ts`
11. Prayer/Quran API + UI

### Other Person's Order (Operations Stack)
1. Finance models (Invoice, Subscription, etc.) + `lib/runway.ts`
2. Finance API routes + UI
3. CRM models + API + UI
4. Projects model expansion + API + UI
5. Habits model changes + `lib/streaks.ts` + API + UI
6. Tasks model changes + `lib/recurring-tasks.ts` + API + UI
7. Journal model changes + `lib/mood-correlation.ts` + API + UI
8. Calendar models + `lib/hijri.ts` + API + UI
9. Education models + `lib/gpa.ts` + API + UI
10. Reading models + API + UI

---

## Daily Coordination Checklist

- [ ] Did either of us change `prisma/schema.prisma`? → Run `prisma migrate dev` and push. The other pulls and re-runs migrate.
- [ ] Did either of us add a new npm package? → Tell the other person to `npm install`.
- [ ] Did either of us add a new nav item or page route? → Tell the other person (shell.tsx changes).
- [ ] Did either of us add a new event type? → Update `EventTypes` in `lib/events.ts` (already has all needed types — should be rare).
- [ ] Run `npm test` before pushing. All tests must pass.
- [ ] Run `npm run typecheck` before pushing. Zero type errors.

---

## Summary

| | Almonzer | Other Person |
|---|---|---|
| Modules | 7 (T1D, Nutrition, Activity, Sleep, Body, Prayer/Quran) | 8 (Finance, CRM, Projects, Tasks, Calendar, Habits, Journal, Education, Reading) |
| New Prisma models | ~25 | ~30 |
| New API routes | ~35 | ~35 |
| New lib files | ~12 | ~9 |
| Cross-person dependencies | Provides `prayer-times.ts` | Provides `hijri.ts` |

**Only two files can cause merge conflicts: `prisma/schema.prisma` and `app/globals.css`. Coordinate on those. Everything else is cleanly separated.**
