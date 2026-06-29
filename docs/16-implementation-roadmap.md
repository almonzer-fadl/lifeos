# 16 — Implementation Roadmap

**Version:** 2.0  
**Author:** Almonzer Fadl  
**Date:** June 2026  
**Status:** Planning  

---

## 1. Roadmap Philosophy

Build in **capability layers**, not features. Each phase delivers a complete, usable increment. The OS should work at every stage — never be "under construction." Ship the module that most improves daily life first.

### The Rule

> **If you could only build ONE module, which would change your life the most this week?**

Answer: **T1D + Nutrition integration.** Every day, you make insulin dosing decisions that affect your immediate safety and long-term health. A bolus calculator that knows your IOB, ratios, and recent exercise would prevent hypos and improve glucose control starting day one.

---

## 2. Phase 0 — Foundation (Week 1-2)

**Goal:** Infrastructure that every other phase builds on.

### Deliverables

| # | Item | Effort | Priority |
|---|---|---|---|
| 0.1 | Event bus (`lib/events.ts`) | 2h | Must |
| 0.2 | Insight model + storage (`Insight`, engine expansion) | 3h | Must |
| 0.3 | Notification model + service worker triggers | 4h | Must |
| 0.4 | Global search infrastructure (tsvector + `/api/search`) | 4h | Should |
| 0.5 | Test DB setup + first integration test | 2h | Should |
| 0.6 | `docs/` directory committed, AGENTS.md updated | 1h | Must |

### Why This Order
- Event bus enables cross-module communication (glucose reading → sleep warning, activity → insulin sensitivity flag)
- Insights and notifications give the OS "intelligence" — it can now tell you things
- Search makes everything findable as models grow from 25 to 60
- Tests prevent regressions as you add 30+ models

---

## 3. Phase 1 — Critical (Week 3-6)

**Goal:** The modules that affect your safety, survival, and income.

### Week 3-4: T1D + Nutrition

| # | Item | Effort | Depends On |
|---|---|---|---|
| 1.1 | T1D models: CarbEntry, ICR, CF, TargetRange, KetoneReading, InjectionSite | 3h | — |
| 1.2 | T1D model changes: GlucoseReading, InsulinDose, BasalRate new fields | 1h | — |
| 1.3 | `lib/iob.ts` — IOB exponential decay calculation | 2h | — |
| 1.4 | `lib/bolus.ts` — bolus calculator with exercise reduction | 2h | 1.3 |
| 1.5 | `lib/tir.ts` — time-in-range statistics | 2h | — |
| 1.6 | API: `/api/health/glucose/stats`, `/api/health/insulin/iob`, `/api/health/bolus-calculator` | 3h | 1.2, 1.3, 1.4 |
| 1.7 | API: `/api/health/carbs`, `/api/health/ratios`, `/api/health/targets`, `/api/health/ketones`, `/api/health/sites` | 3h | 1.1 |
| 1.8 | Nutrition: FoodDiaryEntry new fields (carbEstimate, bolus, postMealGlucose), FrequentFood, FoodCost | 2h | — |
| 1.9 | Nutrition API: recipes, frequent foods, costs, fasting, stats | 3h | 1.8 |
| 1.10 | UI: Bolus calculator screen | 4h | 1.6 |
| 1.11 | UI: Glucose chart with meal/insulin/exercise markers | 3h | 1.6 |
| 1.12 | UI: T1D stats bar (TIR, HbA1c, IOB) | 2h | 1.5 |
| 1.13 | UI: Carb-first nutrition logging | 3h | 1.9 |
| 1.14 | UI: Frequent foods with glucose response ratings | 2h | 1.9 |
| 1.15 | Integration tests: T1D (glucose → IOB → bolus) | 2h | 1.6 |

**Milestone:** You can log a meal, see carb count, get a bolus suggestion based on your configured ratio and current IOB, and log the dose. Post-meal glucose is linked to the meal.

### Week 5-6: Finance + CRM

| # | Item | Effort | Depends On |
|---|---|---|---|
| 1.16 | Finance models: Invoice, InvoiceLineItem, PaymentReceived, RunwaySnapshot, Subscription | 2h | — |
| 1.17 | Finance model changes: Account, Transaction new fields | 1h | — |
| 1.18 | `lib/runway.ts` — runway calculation | 2h | — |
| 1.19 | API: `/api/finance/invoices`, `/api/finance/subscriptions`, `/api/finance/runway`, `/api/finance/dashboard` | 4h | 1.16 |
| 1.20 | UI: Finance dashboard redesign (runway, invoices, subscriptions) | 4h | 1.19 |
| 1.21 | UI: Invoice creation + send + mark paid flow | 3h | 1.19 |
| 1.22 | UI: Subscription tracker | 2h | 1.19 |
| 1.23 | CRM models: Contact, Interaction, ContactGroup | 2h | — |
| 1.24 | API: `/api/crm/contacts`, `/api/crm/interactions`, `/api/crm/dashboard` | 3h | 1.23 |
| 1.25 | UI: CRM dashboard + contact profiles | 4h | 1.24 |
| 1.26 | UI: Interaction logger | 2h | 1.24 |
| 1.27 | Seed data: Melek, Father, Aunt, Jumana from vault | 1h | 1.23 |
| 1.28 | Integration tests: Finance (invoice → payment → transaction) | 2h | 1.19 |

**Milestone:** Dashboard shows your runway in months, subscription costs, and client invoice status. CRM has your key relationships tracked with interaction history.

---

## 4. Phase 2 — High Priority (Week 7-10)

**Goal:** Modules that drive daily discipline, growth, and project momentum.

### Week 7-8: Habits + Prayer + Activity

| # | Item | Effort | Depends On |
|---|---|---|---|
| 2.1 | Habits: HabitStreak, HabitSession models + Habit/HabitLog new fields | 2h | — |
| 2.2 | `lib/streaks.ts` — streak calculation | 2h | — |
| 2.3 | API: habits streaks, sessions, stats, today view | 3h | 2.1 |
| 2.4 | UI: Habits dashboard with streaks, daily checklist, weekly targets | 4h | 2.3 |
| 2.5 | Seed: default habits (prayers, gym, study, sleep) | 1h | — |
| 2.6 | Prayer: PrayerLog, QuranProgress, QuranSession, TafsirEntry models | 2h | — |
| 2.7 | `lib/prayer-times.ts` (shared with Calendar) | 3h | — |
| 2.8 | `lib/quran-projection.ts` | 1h | — |
| 2.9 | API: prayer log, prayer times, quran progress, quran sessions, tafsir | 3h | 2.6, 2.7 |
| 2.10 | UI: Faith dashboard (prayers + quran) | 4h | 2.9 |
| 2.11 | Activity: PersonalRecord, TrainingBlock, Race, ExerciseProgression models | 2h | — |
| 2.12 | `lib/prs.ts`, `lib/training-load.ts` | 2h | — |
| 2.13 | API: activity stats, PRs, races, training blocks, progressions | 3h | 2.11 |
| 2.14 | UI: Activity dashboard with PR board, race countdown, weekly schedule | 4h | 2.13 |
| 2.15 | UI: Workout logger with templates, rest timer, progression | 3h | 2.13 |
| 2.16 | Integration: exercise → T1D sensitivity warning | 1h | 0.1, 1.6 |

**Milestone:** You start your day with a habit checklist (prayers + gym + study), see your streaks, log Quran sessions, and track workout progress toward PRs. The OS warns you about post-exercise insulin sensitivity.

### Week 9-10: Education + Projects

| # | Item | Effort | Depends On |
|---|---|---|---|
| 2.17 | Education: Course, Assignment, Exam, GPASnapshot, LanguageProgress, LanguageSession models | 2h | — |
| 2.18 | `lib/gpa.ts` — GPA calculation | 1h | — |
| 2.19 | API: courses, assignments, exams, GPA, languages | 3h | 2.17 |
| 2.20 | UI: Education dashboard + language progress | 4h | 2.19 |
| 2.21 | Seed: current courses from vault (WIA2004, WIX1001, Java, Malay) | 1h | — |
| 2.22 | Projects: expand Project model + ProjectMilestone, MRRSnapshot | 2h | — |
| 2.23 | API: projects (expanded), milestones, MRR, dashboard | 3h | 2.22 |
| 2.24 | UI: Project dashboard with pipeline Kanban + milestones | 5h | 2.23 |
| 2.25 | Seed: VantLaunch, Gari, SpeakBill, The Firm, TeraMotors | 1h | — |
| 2.26 | Integration: project milestones → task generation | 1h | — |

**Milestone:** You can see all your active projects with pipeline stages, MRR, and next actions. University courses tracked with GPA projection. Language learning progress visible.

---

## 5. Phase 3 — Medium Priority (Week 11-14)

**Goal:** Complete the remaining existing modules and add correlations.

### Week 11-12: Sleep + Body Metrics + Journal

| # | Item | Effort | Depends On |
|---|---|---|---|
| 3.1 | Sleep: BedtimeRoutine, SleepDebt models + SleepSession new fields | 1h | — |
| 3.2 | `lib/sleep-compliance.ts`, `lib/sleep-debt.ts` | 2h | — |
| 3.3 | API: sleep routine, debt, stats, correlation | 2h | 3.1 |
| 3.4 | UI: Sleep dashboard with compliance + glucose correlation | 3h | 3.3 |
| 3.5 | Body: HbA1cRecord, ThyroidPanel, SkinCondition, Medication, MedicationLog | 2h | — |
| 3.6 | Body: LabResult, BodyMeasurement new fields | 1h | — |
| 3.7 | API: hba1c, thyroid, skin, medications | 3h | 3.5 |
| 3.8 | UI: Body dashboard (HbA1c trend, thyroid panel, skin log) | 3h | 3.7 |
| 3.9 | Journal: JournalTemplate model + JournalEntry new fields | 1h | — |
| 3.10 | `lib/mood-correlation.ts` | 2h | — |
| 3.11 | API: journal templates, stats, correlation | 2h | 3.9 |
| 3.12 | UI: Structured journal forms (morning/evening/weekly) + mood chart | 4h | 3.11 |
| 3.13 | Seed: default journal templates | 1h | — |

**Milestone:** Morning intention + evening 3-line review + Sunday weekly reflection all have structured forms. Sleep compliance tracked. HbA1c trend visible.

### Week 13-14: Tasks + Calendar

| # | Item | Effort | Depends On |
|---|---|---|---|
| 3.14 | Tasks: Subtask, RecurringTaskTemplate, TaskTimeBlock models + Task/Project new fields | 2h | — |
| 3.15 | `lib/recurring-tasks.ts` — daily generation | 2h | — |
| 3.16 | API: subtasks, recurring, today view, pipeline, quick capture | 3h | 3.14 |
| 3.17 | UI: Time-block organized today view + Kanban pipeline view + quick capture | 5h | 3.16 |
| 3.18 | Calendar: TimeBlockTemplate, BlockCompliance models + CalendarEvent new fields | 2h | — |
| 3.19 | `lib/hijri.ts` | 1h | — |
| 3.20 | API: blocks, today schedule, compliance, hijri | 3h | 3.18 |
| 3.21 | UI: Timeline view with blocks + prayers + tasks | 4h | 3.20 |
| 3.22 | UI: Block compliance check-in | 2h | 3.20 |
| 3.23 | Seed: default time blocks | 1h | — |
| 3.24 | Daily schedule generator (runs on first login) | 2h | 3.20 |

**Milestone:** Your entire day is visible as a timeline with time blocks, prayer times, and scheduled tasks. You can log block compliance. Tasks auto-generate from templates.

---

## 6. Phase 4 — Polish (Week 15-16)

**Goal:** Cross-module intelligence, visualization, and UX polish.

### Week 15: Cross-Module Intelligence

| # | Item | Effort |
|---|---|---|
| 4.1 | Expand insights engine: add all module event listeners | 4h |
| 4.2 | Cross-module correlations: sleep → glucose, exercise → glucose, habits → mood | 4h |
| 4.3 | Notification scheduling: prayer times, medication reminders, journal prompts | 3h |
| 4.4 | Reading list: Book, BookNote models + API + UI | 4h |

### Week 16: UI/UX Polish

| # | Item | Effort |
|---|---|---|
| 4.5 | Chart visualizations: sleep trend, activity volume, HbA1c trend, mood trend | 5h |
| 4.6 | Pull-to-refresh on all list pages | 3h |
| 4.7 | Swipe actions on all list rows | 3h |
| 4.8 | Offline support: glucose logging, habit completion (service worker cache) | 4h |
| 4.9 | Search UI: `/api/search` results page | 2h |
| 4.10 | Celebration animations: PR achieved, streak milestone, habit perfect day | 2h |
| 4.11 | Final integration test suite: end-to-end critical flows | 3h |

---

## 7. Total Effort Estimate

| Phase | Weeks | Total Hours | Modules Shipped |
|---|---|---|---|
| Phase 0 — Foundation | 2 | 16h | Event bus, insights, notifications, search |
| Phase 1 — Critical | 4 | 57h | T1D, Nutrition, Finance, CRM |
| Phase 2 — High Priority | 4 | 59h | Habits, Prayer, Activity, Education, Projects |
| Phase 3 — Medium | 4 | 54h | Sleep, Body, Journal, Tasks, Calendar |
| Phase 4 — Polish | 2 | 30h | Cross-module intelligence, charts, UX |
| **Total** | **16 weeks** | **~216 hours** | **15 modules complete** |

At 20 hours/week (your available dev time around university): **~11 weeks** for full implementation.

---

## 8. What to Build First — Decision Matrix

| Module | Life Impact | Effort | Dependency Chain | **Priority Score** |
|---|---|---|---|---|
| T1D + Nutrition | 🔴 Safety-critical (daily) | High | Foundation | **1** |
| Finance + CRM | 🔴 Income + relationships | High | Foundation | **2** |
| Habits + Prayer | 🟡 Daily discipline + faith | Medium | Foundation | **3** |
| Activity | 🟡 Athletic goals + T1D integration | Medium | T1D | **4** |
| Projects | 🟡 Business momentum | Medium | CRM, Tasks | **5** |
| Education | 🟡 Academic performance | Medium | — | **6** |
| Sleep | 🟢 Recovery + correlation | Low | T1D, Activity | **7** |
| Body Metrics | 🟢 Long-term health | Low | T1D | **8** |
| Journal | 🟢 Reflection + mood | Low | Habits, Sleep | **9** |
| Tasks | 🟢 Organization | Medium | Calendar | **10** |
| Calendar | 🟢 Schedule | Medium | Prayer, Tasks | **11** |
| Reading | 🟢 Growth | Low | — | **12** |

---

## 9. Success Criteria — "The OS Is Complete"

The Life OS is declared complete when all 15 modules pass their acceptance criteria as defined in their respective docs. Specifically:

1. **T1D:** Bolus calculator with IOB, carb ratios, exercise reduction. Post-meal glucose correlation per food.
2. **Finance:** Runway widget, client invoicing, subscription tracker, father support transition.
3. **Activity:** PR board, race countdowns, workout templates, progression tracking.
4. **Nutrition:** Carb-first logging with Malaysian foods, bolus suggestion integration.
5. **Habits:** Streaks, daily checklist, multi-per-day support, celebration animations.
6. **Sleep:** Protocol compliance, debt calculation, glucose correlation.
7. **Body:** HbA1c trend, thyroid panel, medication reminders, skin log.
8. **Tasks:** Time-block organized, recurring generation, Kanban pipeline, quick capture.
9. **Journal:** Structured morning/evening/weekly forms, mood correlation.
10. **Calendar:** Time blocks + prayer times timeline, block compliance.
11. **CRM:** Key relationship tracking, interaction logging, follow-up reminders.
12. **Education:** Course tracking, GPA projection, language progress.
13. **Projects:** Multi-project dashboard, pipeline Kanban, MRR tracking.
14. **Reading:** Book queue, notes, reading progress.
15. **Prayer/Quran:** Prayer compliance, Quran memorization velocity, tafsir journal.

And the meta-criterion:

> **Every module feeds every other module.** A glucose reading after a long run triggers an insulin sensitivity warning. A missed gym session appears in the evening journal prompt. A client payment updates runway and project MRR simultaneously. The OS is not a collection of apps — it is one system that knows you.
