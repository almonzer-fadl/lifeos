# Life OS — Master Architecture Document

**Version:** 2.0  
**Author:** Almonzer Fadl  
**Date:** June 2026  
**Type:** BRD + SRS (combined)  
**Status:** Planning — Implementation Roadmap Phase

---

## 1. Executive Summary

### 1.1 Purpose

Life OS is a single-user, private, self-hosted personal operating system. It consolidates every life domain — health, finance, productivity, knowledge, relationships, spirituality — into a single application with cross-domain intelligence. It serves one person: Almonzer Fadl, a 19-year-old Sudanese student at Universiti Malaya managing Type 1 Diabetes while building a product studio (VantLaunch), training as a hybrid athlete, and executing a 10-year grand strategy for personal sovereignty.

### 1.2 Core Principle

**Every module must feed every other module.** The OS's value proposition is not that it has a task manager or a glucose tracker — it's that the glucose tracker warns the task manager to reschedule hard workouts, the sleep module correlates with next-day mood, and the finance module knows the budget impact of a new insulin prescription.

### 1.3 Current State

Life OS v0.1.0 exists as a functional Next.js 16 application with 25 Prisma models across 10 domains, 33 API routes, a custom dark-themed design system, and a partial mobile PWA. It is approximately **35% of the way to a complete personal OS** for this specific user.

### 1.4 Target State

A 15-module system where every module is complete for **this user's specific needs** — not for generic "big app" comparison, but for the documented life of Almonzer Fadl as captured in `/Fadl Company LTD/Vault/LifeOS/`.

---

## 2. Module Inventory & Ratings

Ratings are personalized — they measure completeness for Almonzer's actual life, not against commercial apps.

| # | Module | Current | Target | Priority | Document |
|---|---|---|---|---|---|
| 01 | T1D / Diabetes | 35% | 100% | P0 — Critical | `docs/01-t1d.md` |
| 02 | Finance | 50% | 100% | P0 — Critical | `docs/02-finance.md` |
| 03 | Activity / Exercise | 40% | 100% | P1 — High | `docs/03-activity.md` |
| 04 | Nutrition | 35% | 100% | P1 — High | `docs/04-nutrition.md` |
| 05 | Sleep | 30% | 100% | P2 — Medium | `docs/05-sleep.md` |
| 06 | Body Metrics | 25% | 100% | P2 — Medium | `docs/06-body-metrics.md` |
| 07 | Habits | 40% | 100% | P1 — High | `docs/07-habits.md` |
| 08 | Tasks / Projects | 25% | 100% | P2 — Medium | `docs/08-tasks.md` |
| 09 | Journal | 30% | 100% | P2 — Medium | `docs/09-journal.md` |
| 10 | Calendar | 15% | 100% | P2 — Medium | `docs/10-calendar.md` |
| 11 | Relationship CRM | 0% | 100% | P0 — Critical | `docs/11-crm.md` |
| 12 | Education Tracker | 0% | 100% | P1 — High | `docs/12-education.md` |
| 13 | Project Dashboard | 0% | 100% | P1 — High | `docs/13-projects.md` |
| 14 | Reading List | 0% | 100% | P3 — Low | `docs/14-reading.md` |
| 15 | Prayer / Quran | 0% | 100% | P1 — High | `docs/15-prayer-quran.md` |

---

## 3. Technical Architecture

### 3.1 Stack (Unchanged)

- **Framework:** Next.js 16 (App Router, standalone output)
- **Language:** TypeScript 5 (strict)
- **Database:** PostgreSQL 17 via Prisma 7.8
- **Styling:** Tailwind CSS v4 + CSS custom properties (dark-only)
- **Animation:** Framer Motion 12
- **Charts:** Recharts 3.8
- **Validation:** Zod 4.4
- **Testing:** Vitest 4.1

### 3.2 Architecture Decisions

| Decision | Rationale |
|---|---|
| **Single user, no auth** | This is a private terminal. Auth adds complexity with zero security gain for a single-user local app. If multi-user is ever needed, add it then. |
| **Direct Prisma in routes** | For a solo developer, a repository/service layer is premature abstraction. The DB proxy in `lib/db.ts` already provides graceful failure. Keep it simple until it hurts. |
| **CSS custom properties over Tailwind-only** | The `premium-*` class system is already built and consistent. Migrating to 100% Tailwind utility classes is a cosmetic change with no functional benefit. |
| **Integer cents for money** | Correct. Do not change. |
| **No ORM migrations in CI** | Prisma migrations run manually. This is a solo project. |
| **Service worker / PWA** | Already built. Expand for offline-first glucose logging and habit tracking. |

### 3.3 New Architecture Requirements

#### 3.3.1 Cross-Module Event Bus

Modules must communicate. When a glucose reading is logged, the sleep module should flag nocturnal hypo risk. When a habit is missed, the journal should prompt for reflection.

**Implementation:** A simple in-memory event emitter in `lib/events.ts`.

```typescript
// lib/events.ts
type EventHandler = (payload: unknown) => void | Promise<void>;
const listeners = new Map<string, Set<EventHandler>>();

export const events = {
  on(event: string, handler: EventHandler) { ... },
  off(event: string, handler: EventHandler) { ... },
  emit(event: string, payload: unknown) { ... },
};

// Predefined events:
// "glucose:reading"       → { value, timestamp, unit }
// "glucose:low"           → { value, timestamp }
// "glucose:high"          → { value, timestamp }
// "insulin:dose"          → { units, type, timestamp }
// "activity:completed"    → { type, duration, calories, distance }
// "sleep:session"         → { hours, quality, startTime }
// "habit:completed"       → { habitId, name, date }
// "habit:missed"          → { habitId, name, date }
// "task:completed"        → { taskId, title }
// "transaction:created"   → { amount, type, category }
// "budget:overspent"      → { category, amount, month }
// "prayer:completed"      → { prayer, time }
// "prayer:missed"         → { prayer, time }
```

#### 3.3.2 Cross-Module Insights Engine

The `components/modules/ai/insights-widget.tsx` already has a rule-based insights generator. This must be expanded to use the event bus and a persistent insights store so insights survive page navigation and accrue over time.

**New model: `Insight`**

```prisma
model Insight {
  id        String   @id @default(uuid())
  type      String   // glucose, sleep, habit, finance, task, activity, prayer, custom
  urgency   String   // high, medium, low
  headline  String
  body      String
  href      String?  // link to relevant module
  icon      String?
  dismissed Boolean  @default(false)
  actedOn   Boolean  @default(false)
  createdAt DateTime @default(now())
  expiresAt DateTime? // auto-cleanup old insights
  
  @@index([type])
  @@index([urgency])
  @@index([dismissed])
}
```

#### 3.3.3 Notification System

The service worker exists but has no trigger mechanism. Need a notification model that the insights engine can write to, and a polling mechanism that triggers browser notifications.

**New model: `Notification`**

```prisma
model Notification {
  id        String   @id @default(uuid())
  title     String
  body      String
  href      String?
  read      Boolean  @default(false)
  pushed    Boolean  @default(false) // sent to service worker
  createdAt DateTime @default(now())
  
  @@index([read])
  @@index([pushed])
}
```

#### 3.3.4 Search

No global search exists. All text-bearing models need a search index.

**Approach:** PostgreSQL full-text search with `tsvector` generated columns on key text fields (transaction descriptions, task titles, journal content, food names, habit names). A single `/api/search?q=` endpoint that searches across all modules.

---

## 4. Data Integration Map

How modules MUST feed each other:

```
Glucose ──────► Sleep (nocturnal hypo risk)
  │
  ├────────────► Activity (pre/post workout readings, insulin sensitivity)
  │
  ├────────────► Nutrition (post-meal glucose response per food)
  │
  └────────────► Body (HbA1c estimation from readings)

Activity ──────► Glucose (exercise impact on insulin sensitivity for 24-48h)
  │
  ├────────────► Sleep (training load → sleep quality correlation)
  │
  ├────────────► Body (weight, measurements trends vs training)
  │
  └────────────► Habits (gym attendance streak)

Sleep ─────────► Glucose (poor sleep → worse insulin sensitivity)
  │
  ├────────────► Activity (recovery score → training readiness)
  │
  ├────────────► Journal (mood correlation)
  │
  └────────────► Habits (sleep protocol compliance)

Nutrition ──────► Glucose (carbs → bolus → post-meal reading)
  │
  ├────────────► Finance (food cost tracking vs budget)
  │
  └────────────► Body (weight trend vs calorie intake)

Finance ───────► Nutrition (food budget)
  │
  └────────────► Projects (client income, MRR)

Habits ────────► Journal (mood correlation)
  │
  └────────────► Prayer (streak reinforcement)

Prayer ────────► Calendar (prayer time blocks)
  │
  └────────────► Habits (streak tracking)

Calendar ──────► Tasks (time block allocation)
  │
  └────────────► Prayer (prayer time calculation)

CRM ───────────► Finance (client payment status)
  │
  ├────────────► Projects (client pipeline)
  │
  └────────────► Tasks (follow-up reminders)

Education ─────► Tasks (assignment deadlines, study blocks)
  │
  └────────────► Calendar (class schedule)

Projects ──────► Finance (MRR, income tracking)
  │
  ├────────────► Tasks (project tasks)
  │
  └────────────► CRM (client relationships)
```

---

## 5. Database Strategy

### 5.1 Migration Approach

All new models and fields will be added to the existing `prisma/schema.prisma`. The schema will be organized by domain with clear comment separators.

### 5.2 New Models Required

| Model | Module | Purpose |
|---|---|---|
| CarbEntry | T1D | Meal carbohydrate recording |
| InsulinCarbRatio | T1D | Grams of carbs per unit of insulin |
| CorrectionFactor | T1D | mg/dL drop per unit of insulin |
| TargetRange | T1D | Glucose target per time-of-day segment |
| KetoneReading | T1D | Blood ketone measurements |
| InjectionSite | T1D | Injection/infusion site rotation tracking |
| PersonalRecord | Activity | Best performances by activity type + distance |
| TrainingBlock | Activity | Macro-cycle training phase |
| Race | Activity | Scheduled race/event with goals |
| ExerciseProgression | Activity | Calisthenics bodyweight progression tracking |
| HbA1cEstimate | T1D/Body | Calculated HbA1c from glucose readings |
| ThyroidPanel | Body | Grouped thyroid lab results |
| SkinCondition | Body | Eczema/hyperpigmentation tracking |
| Medication | Body | Prescription medication tracking |
| MedicationLog | Body | Medication adherence logging |
| Recipe | Nutrition | User-created meal recipes |
| RecipeIngredient | Nutrition | Recipe components with amounts |
| FrequentFood | Nutrition | User's commonly eaten foods with personal carb notes |
| FoodCost | Nutrition | Price tracking for budget-conscious eating |
| FastingSession | Nutrition | Intermittent fasting / Ramadan tracking |
| BedtimeRoutine | Sleep | Protocol compliance logging |
| SleepDebt | Sleep | Cumulative sleep deficit calculation |
| Invoice | Finance | Client billing (VantLaunch) |
| InvoiceLineItem | Finance | Billable items per invoice |
| PaymentReceived | Finance | Client payment tracking |
| RunwaySnapshot | Finance | Periodic savings/burn calculation |
| Subscription | Finance | Recurring subscription tracking |
| Subtask | Tasks | Nested task items |
| RecurringTask | Tasks | Template-based recurring tasks |
| TaskTimeBlock | Tasks | Task-to-calendar-block linking |
| ProjectMilestone | Projects | Major project checkpoints |
| JournalTemplate | Journal | Structured journal prompt configurations |
| Contact | CRM | People in user's life |
| Interaction | CRM | Meetings, calls, messages with contacts |
| ContactGroup | CRM | Grouping contacts (family, clients, friends) |
| Course | Education | University course tracking |
| Assignment | Education | Course assignments and grades |
| Exam | Education | Exam schedules and results |
| LanguageProgress | Education | Per-language learning tracking |
| LanguageSession | Education | Individual study sessions |
| QuranProgress | Prayer | Surah/page memorization tracking |
| QuranSession | Prayer | Individual memorization/revision sessions |
| PrayerLog | Prayer | Daily prayer compliance |
| Project | Projects | (Existing — expand significantly) |
| ProjectPipeline | Projects | Deal/status pipeline stages |
| Book | Reading | Reading queue and notes |
| BookNote | Reading | Notes and action items per book |
| Insight | Cross-domain | AI-generated cross-module insights |
| Notification | Cross-domain | User notification queue |
| EventLog | System | Cross-module event history |

### 5.3 Existing Models — Required Changes

| Model | Changes |
|---|---|
| GlucoseReading | Add `carbEntryId` FK, `insulinOnBoard` Float, `timeInRange` Boolean |
| InsulinDose | Add `carbEntryId` FK, `insulinOnBoardAfter` Float |
| BasalRate | Add `profileId` String, `profileName` String, `isWorkoutDay` Boolean |
| Activity | Add `trainingBlockId` FK, `perceivedExertion` Int (1-10), `routeData` Json, `isRace` Boolean, `raceId` FK |
| GymSet | Add `isWarmup` Boolean, `restSeconds` Int |
| SleepSession | Add `latency` Int (minutes to fall asleep), `restingHR` Int, `hrv` Float, `compliance` Float (0-1) |
| FoodDiaryEntry | Add `carbEstimate` Float, `bolusSuggested` Float, `bolusTaken` Float, `postMealGlucose` Float |
| FoodItem | Add `netCarbs` Float (computed: carbs - fiber), `isMalaysian` Boolean |
| BodyMeasurement | Add `bloodPressureSystolic` Int, `bloodPressureDiastolic` Int, `photoPath` String |
| LabResult | Add `panelGroup` String (e.g. "Thyroid", "CBC", "Lipid"), `panelOrder` Int |
| Account | Add `isFatherSupport` Boolean (track support transition) |
| Transaction | Add `invoiceId` FK, `clientId` FK |
| Habit | Add `targetCount` Int (for multi-per-day), `streakCount` Int (computed/cached), `isNonNegotiable` Boolean |
| HabitLog | Add `timeOfDay` String, `completedAt` DateTime? |
| Task | Add `energyLevel` String (deep/shallow/admin), `timeBlockStart` DateTime?, `pipelineStage` String? |
| JournalEntry | Add `entryType` String (morning_intention/evening_review/weekly_review/free), `photoPath` String |
| CalendarEvent | Add `isRecurringParent` Boolean, `recurringRule` String (RRULE), `isPrayerTime` Boolean, `isTimeBlock` Boolean |

---

## 6. API Design Standards

### 6.1 New Route Patterns

All new APIs will follow the existing convention:

- `GET /api/{module}/{resource}` — list with query params
- `POST /api/{module}/{resource}` — create
- `PATCH /api/{module}/{resource}` — update (with `id` in body)
- `DELETE /api/{module}/{resource}?id=` — delete
- `GET /api/{module}/{resource}/[id]` — single resource detail (new pattern)
- `GET /api/search?q=` — global search

### 6.2 Cross-Module Endpoints

| Endpoint | Purpose |
|---|---|
| `GET /api/context` | Aggregated context for AI insights (exists, expand) |
| `GET /api/search?q=` | Full-text search across all modules |
| `GET /api/insights` | List/dismiss insights |
| `GET /api/notifications` | List/read notifications |
| `POST /api/events` | Internal event bus webhook endpoint |

### 6.3 Shared Middleware

All routes must use:
1. `checkRateLimit(request, DEFAULTS.MUTATION)` for POST/PATCH/DELETE
2. `checkRateLimit(request, DEFAULTS.READ)` for GET
3. `logRequest(handler)` wrapper for observability
4. `validateBody(schemas.x, body)` for all mutations

---

## 7. UI/UX Standards

### 7.1 Page Structure

Every module page follows:

```
┌─────────────────────────────┐
│ premium-header              │  ← module name, kicker, primary stat
├─────────────────────────────┤
│ premium-page                │
│  ├── stat grid (2-4 cols)   │  ← key metrics for this module
│  ├── main content area      │  ← list, chart, or form
│  └── FAB (if applicable)    │  ← primary action for this module
└─────────────────────────────┘
```

### 7.2 Component Hierarchy

- **Page** (Server Component) — fetches data, renders layout
- **Section** (Server Component) — premium-panel with specific data
- **Interactive Element** (Client Component) — forms, buttons, swipeable rows
- **UI Primitive** — from `components/ui/`

### 7.3 Loading States

Every data-fetching component must have three states:
1. **Loading:** Skeleton matching the exact layout of the content
2. **Empty:** EmptyState component with CTA
3. **Error:** Inline error with retry button

### 7.4 Mobile-First

- All interactions must work on mobile (320px width minimum)
- Primary actions accessible via bottom tab bar (5 tabs max)
- Secondary actions via sheets/drawers (vaul)
- Swipe actions on all list rows
- Pull-to-refresh on all list pages

---

## 8. Testing Strategy

### 8.1 Test Pyramid

```
         /\
        /  \       E2E: Critical paths only (glucose log → insulin adjust → hypo warning)
       /    \
      /------\     Integration: API route tests with test DB
     /        \
    /----------\   Unit: Pure functions (money.ts, h1bc.ts, validate.ts)
   /            \
  /--------------\  Type: TypeScript strict mode (catches 80% of bugs)
```

### 8.2 Required Test Files

| File | Type | Tests |
|---|---|---|
| `__tests__/api/t1d.test.ts` | Integration | Glucose CRUD, insulin CRUD, carb-bolus calculation |
| `__tests__/api/finance.test.ts` | Integration | Transaction CRUD, transfer, split, budget math |
| `__tests__/api/habits.test.ts` | Integration | Habit CRUD, streak calculation, multi-per-day logging |
| `__tests__/api/tasks.test.ts` | Integration | Task CRUD, subtask cascade, recurring generation |
| `__tests__/lib/insights.test.ts` | Unit | Insight generation logic from context data |
| `__tests__/lib/events.test.ts` | Unit | Event bus emit/subscribe/unsubscribe |
| `__tests__/lib/h1bc.test.ts` | Unit | Already exists, expand for time-in-range |
| `__tests__/api/search.test.ts` | Integration | Cross-module full-text search |

---

## 9. Implementation Phases

### Phase 0 — Foundation (Weeks 1-2)
- Event bus (`lib/events.ts`)
- Insight model + engine expansion
- Notification model + service worker triggers
- Global search infrastructure (tsvector columns + `/api/search`)
- Test DB setup for integration tests

### Phase 1 — Critical Modules (Weeks 3-6)
- T1D model expansion (carbs, ratios, IOB, ketones) — `docs/01-t1d.md`
- Finance model expansion (invoicing, subscriptions, runway) — `docs/02-finance.md`
- CRM model (contacts, interactions) — `docs/11-crm.md`
- All corresponding API routes + integration tests

### Phase 2 — High Priority (Weeks 7-10)
- Activity model expansion (PRs, training blocks, races) — `docs/03-activity.md`
- Nutrition model expansion (carbs-first, Malaysian foods) — `docs/04-nutrition.md`
- Habits model expansion (streaks, multi/day) — `docs/07-habits.md`
- Education tracker — `docs/12-education.md`
- Project dashboard — `docs/13-projects.md`
- Prayer/Quran tracker — `docs/15-prayer-quran.md`

### Phase 3 — Medium Priority (Weeks 11-14)
- Sleep model expansion — `docs/05-sleep.md`
- Body metrics expansion — `docs/06-body-metrics.md`
- Tasks model expansion — `docs/08-tasks.md`
- Journal model expansion — `docs/09-journal.md`
- Calendar model expansion — `docs/10-calendar.md`

### Phase 4 — Polish (Weeks 15-16)
- Reading list — `docs/14-reading.md`
- Cross-module insights polish
- Chart visualizations for all trend data
- Pull-to-refresh on all list pages
- Swipe actions on all rows
- Offline support for critical flows (glucose, habits)

---

## 10. File Structure Target

```
lifeos/
├── app/
│   ├── api/
│   │   ├── finance/     (existing, expand)
│   │   ├── health/      (existing, expand)
│   │   ├── productivity/(existing, expand)
│   │   ├── crm/         (new)
│   │   ├── education/   (new)
│   │   ├── prayer/      (new)
│   │   ├── search/      (new)
│   │   ├── insights/    (new)
│   │   ├── notifications/(new)
│   │   └── events/      (new, internal)
│   ├── crm/             (new pages)
│   ├── education/       (new pages)
│   ├── prayer/          (new pages)
│   └── projects/        (expand existing tasks)
├── components/
│   ├── modules/
│   │   ├── crm/         (new)
│   │   ├── education/   (new)
│   │   ├── prayer/      (new)
│   │   └── projects/    (new)
│   └── ui/              (expand)
├── lib/
│   ├── events.ts        (new)
│   ├── insights.ts      (new)
│   ├── search.ts        (new)
│   ├── notifications.ts (new)
│   └── ... (existing)
├── prisma/
│   └── schema.prisma    (expand from 25 to ~60 models)
├── docs/                 (this directory)
└── __tests__/            (expand)
```

---

## 11. Non-Goals (Explicitly Out of Scope)

- Multi-user / authentication (single user only)
- Mobile native apps (PWA is sufficient)
- Bank integration / Plaid (manual entry only)
- CGM direct integration (manual entry or Nightscout bridge only)
- AI/LLM integration beyond the existing rule-based insights engine
- Third-party calendar sync beyond iCloud CalDAV
- Social features, sharing, collaboration
- Light mode / theme switching
- Internationalization (English only)
- Data export in formats beyond JSON
- Automatic database backups (Docker volume backup is sufficient)
- CI/CD pipeline (manual deploy is fine for solo dev)

---

## 12. Success Metrics

The OS is "complete" when:

1. **T1D:** Almonzer can log a meal, see carb count, get a bolus suggestion based on his configured ratio, and see post-meal glucose response correlated to that food — in under 15 seconds.
2. **Finance:** He can see exactly how many months of runway he has and what one VantLaunch client would do to that number.
3. **Activity:** He can see his pull-up progression toward 12+, his 5K time trend toward sub-22, and his upcoming race countdowns.
4. **Habits:** He never breaks a prayer or gym streak without the OS noticing and prompting reflection.
5. **Cross-domain:** A low glucose reading after a long run triggers a notification to check ketones and suggests reducing the next basal dose.
6. **Everything feeds everything.** No module is an island.
