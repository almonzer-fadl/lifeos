# UX Implementation Checklist

Phase-by-phase, granular, executable tasks. Check off as completed.

---

## Phase 1: Foundation (Infrastructure)

### Dependencies
- [ ] Install `framer-motion` — `npm install framer-motion`
- [ ] Install `sonner` — `npm install sonner`
- [ ] Install `vaul` — `npm install vaul`
- [ ] Install `@radix-ui/react-dialog` — `npm install @radix-ui/react-dialog`

### Toast System
- [ ] Create `components/ui/toaster.tsx` — wrap `<Toaster>` from sonner with dark styling
- [ ] Add `<Toaster />` to `app/layout.tsx`
- [ ] Style toast: `var(--surface-raised)` bg, `var(--border)` border, 13px font, semantic left border (gold=success, rose=error, sky=info)
- [ ] Create `lib/toast.ts` — helper functions: `toast.success(msg, opts)`, `toast.error(msg)`, `toast.undo(msg, onUndo)`
- [ ] Replace all `window.confirm()` calls with toast + undo pattern where safe
- [ ] Replace all silent operations with toast feedback

### Sheet System
- [ ] Create `components/ui/sheet.tsx` — wraps vaul `Drawer` with dark styling
- [ ] Sheet overlay: `bg-black/50 backdrop-blur-sm`
- [ ] Sheet content: `var(--surface-raised)` bg, `border-t border-[var(--border)]`, `rounded-t-2xl`, max-h 85vh
- [ ] Sheet handle: centered `w-10 h-1 rounded-full bg-[var(--border-strong)]`
- [ ] Create `components/ui/confirm-sheet.tsx` — pre-built delete confirmation sheet
- [ ] Create `components/ui/action-sheet.tsx` — list of tappable actions

### Dialog System
- [ ] Create `components/ui/dialog.tsx` — wraps `@radix-ui/react-dialog` with dark styling
- [ ] Dialog overlay: `bg-black/60 backdrop-blur-sm`
- [ ] Dialog content: `var(--surface-raised)` bg, `border border-[var(--border)]`, rounded-xl, shadow-modal, max-w-md
- [ ] Animation: scale-in + fade-in on enter

### Shared Components
- [ ] Create `components/ui/fab.tsx` — floating action button
  - Fixed positioning, gold gradient bg, gold border
  - Icon slot, href prop
  - `bottom-20 lg:bottom-8 right-4 lg:right-8`
  - Hover scale 1.05, tap scale 0.95 (spring)
- [ ] Create `components/ui/empty-state.tsx` — icon + title + description + CTA link
- [ ] Create `components/ui/swipeable-row.tsx` — framer-motion drag row with revealed action buttons
- [ ] Create `components/ui/odometer.tsx` — animated number counter using `useSpring`
- [ ] Create `components/ui/progress-ring.tsx` — SVG circle with animated stroke-dashoffset

### Loading States
- [ ] Create `app/loading.tsx` — root loading skeleton
- [ ] Create `app/finance/loading.tsx` — finance skeleton (net worth + stats + transactions)
- [ ] Create `app/activity/loading.tsx`
- [ ] Create `app/t1d/loading.tsx`
- [ ] Create `app/sleep/loading.tsx`
- [ ] Create `app/body/loading.tsx`
- [ ] Create `app/nutrition/loading.tsx`
- [ ] Create `app/tasks/loading.tsx`
- [ ] Create `app/habits/loading.tsx`
- [ ] Create `app/journal/loading.tsx`

### Page Transition Wrapper
- [ ] Create `components/ui/page-transition.tsx` — AnimatePresence wrapper
  - Enter: opacity 0→1, y 8→0, duration 0.2s
  - Exit: opacity 1→0, y 0→-8, duration 0.15s

### Module Layouts
- [ ] Create `app/finance/layout.tsx` — sub-nav tabs: Dashboard | Accounts | Budget | Assets | Goals | Bills | Reports + FAB
- [ ] Create `app/activity/layout.tsx` — sub-nav: Feed | Log | Workouts | Trends + FAB
- [ ] Create `app/t1d/layout.tsx` — sub-nav: Dashboard | Logbook | Settings + quick-add bar
- [ ] Create `app/sleep/layout.tsx` — sub-nav: Dashboard | Trends + FAB
- [ ] Create `app/body/layout.tsx` — sub-nav: Dashboard | Measurements | Labs | Supplements | Trends + FAB
- [ ] Create `app/nutrition/layout.tsx` — sub-nav: Diary | Meals | Trends + quick-add
- [ ] Create `app/tasks/layout.tsx` — sub-nav: Today | Upcoming | Projects + kanban toggle + quick-add bar
- [ ] Create `app/habits/layout.tsx` — sub-nav: Today | Calendar + FAB
- [ ] Create `app/journal/layout.tsx` — sub-nav: Timeline | Calendar + FAB

---

## Phase 2: Finance (Flagship Module)

### Route Setup
- [ ] Create `app/finance/accounts/page.tsx` — Account list
- [ ] Create `app/finance/accounts/[id]/page.tsx` — Account register (transaction history, running balance)
- [ ] Create `app/finance/accounts/[id]/transaction/new/page.tsx` — Add transaction (dedicated form)
- [ ] Create `app/finance/accounts/[id]/transaction/[txId]/page.tsx` — Transaction detail/edit
- [ ] Create `app/finance/budget/page.tsx` — Budget overview
- [ ] Create `app/finance/budget/[year-month]/page.tsx` — Monthly budget detail
- [ ] Create `app/finance/assets/page.tsx` — Asset register
- [ ] Create `app/finance/assets/new/page.tsx` — Add asset
- [ ] Create `app/finance/assets/[id]/page.tsx` — Asset detail
- [ ] Create `app/finance/assets/[id]/edit/page.tsx` — Edit asset
- [ ] Create `app/finance/debts/page.tsx` — Debt overview
- [ ] Create `app/finance/debts/[id]/page.tsx` — Debt detail
- [ ] Create `app/finance/goals/page.tsx` — Goals list
- [ ] Create `app/finance/goals/new/page.tsx` — Create goal
- [ ] Create `app/finance/goals/[id]/page.tsx` — Goal detail
- [ ] Create `app/finance/recurring/page.tsx` — Recurring calendar
- [ ] Create `app/finance/recurring/new/page.tsx` — Add recurring
- [ ] Create `app/finance/reports/page.tsx` — Reports dashboard
- [ ] Create `app/finance/import/page.tsx` — Import workspace

### Finance Dashboard (refactor from current page.tsx)
- [ ] Remove all inline forms
- [ ] Keep: net worth hero (add odometer animation)
- [ ] Keep: exposure strip (Cash/Assets/Debts)
- [ ] Keep: quick stats (4 stat cards with odometer)
- [ ] Add: recent transactions (last 5, "View All →" link)
- [ ] Add: upcoming bills summary (next 3)
- [ ] Add: budget quick-glance (available to assign, top 3 category balances)
- [ ] Add: goal progress rings

### Account List
- [ ] Card per account: name, balance, currency badge, type label
- [ ] Balance in mono, color-coded (positive=emerald, negative=rose)
- [ ] Tap → navigate to account register
- [ ] Empty state: "No accounts yet" with CTA to create first account
- [ ] FAB: navigate to account creation

### Account Register
- [ ] Header: account name, current balance (odometer), currency
- [ ] Transaction list: date, description, category, amount (right-aligned mono), running balance
- [ ] Status indicator dot: pending (none), cleared (green), reconciled (gold)
- [ ] Staggered list animation on load
- [ ] SwipeableRow: swipe left → Edit / Delete
- [ ] Tap row → transaction detail
- [ ] Filter bar: date range, search, category dropdown, status filter
- [ ] Pull-to-refresh
- [ ] Pagination or infinite scroll
- [ ] FAB: "Add Transaction"

### Transaction Entry (stepped flow)
- [ ] Step 1: Type selector (expense / income / transfer), animated chip toggle
- [ ] Step 2: Amount input — large number pad-style entry, mono font
- [ ] Step 3: Category — searchable list, recent categories at top
- [ ] Step 4: Details — description, date picker, notes, account selector
- [ ] Step 5: Confirm — summary card, "Save" button
- [ ] Progress indicator at top (4 dots, current step highlighted)
- [ ] Back/Next navigation between steps
- [ ] On save: toast "Transaction saved — Undo" → redirect to account register

### Transaction Detail
- [ ] Full view: type, amount (large), category, account, date, description, notes
- [ ] Status: pending/cleared/reconciled with ability to change
- [ ] Edit button → inline edit or navigate to edit page
- [ ] Delete button → opens confirm sheet

### Account Creation
- [ ] Dedicated page (no longer inline form)
- [ ] Type selector (checking, savings, credit, etc.) — visual cards per type
- [ ] Name, currency, initial balance
- [ ] If debt type: interest rate, min payment, credit limit, due day (conditional reveal)
- [ ] Save → toast → redirect to account register

### Budget
- [ ] Month picker: horizontal scroll, current month centered, left/right arrows
- [ ] "Available to Assign" card (prominent, gold-accented)
- [ ] Category groups with: Assigned | Activity | Available columns
- [ ] Each row: category name, mono numbers for each column
- [ ] Tap category → budget category detail
- [ ] Quick assign: +/- buttons per category ($10 increments, long-press for $100)
- [ ] Overspending indicators (amber/rose)
- [ ] Progress bars for categories with targets

### Assets
- [ ] List: name, type badge, current value, gain/loss indicator
- [ ] Total asset value in header
- [ ] Tap → asset detail (valuation history table)
- [ ] Edit asset value
- [ ] Delete with confirm sheet

### Goals
- [ ] List: progress ring per goal, name, current/target
- [ ] Tap → goal detail (progress, timeline, linked account)
- [ ] Create goal: stepped form (name → target → current → linked account → date)
- [ ] Edit/delete with confirm

### Recurring / Bills
- [ ] Calendar view with bill dots on due dates
- [ ] Upcoming bills list below calendar
- [ ] Tap bill → detail (frequency, amount, next date, account)
- [ ] Create: stepped form
- [ ] Skip/approve upcoming occurrence

### Reports
- [ ] Net worth over time chart (defer chart library, use text-based for now)
- [ ] Income vs expenses summary
- [ ] Spending by category breakdown
- [ ] Export CSV button

### Import
- [ ] Drag-and-drop zone or file picker
- [ ] Column mapping UI
- [ ] Preview table with matched/unmatched indicators
- [ ] Duplicate detection warnings
- [ ] "Import X transactions" confirm button

---

## Phase 3: Activity

### Route Setup
- [ ] `app/activity/log/page.tsx` — Choose activity type
- [ ] `app/activity/log/cardio/page.tsx` — Log cardio
- [ ] `app/activity/log/gym/page.tsx` — Log gym workout
- [ ] `app/activity/[id]/page.tsx` — Activity detail
- [ ] `app/activity/[id]/edit/page.tsx` — Edit activity
- [ ] `app/activity/workouts/page.tsx` — Workout templates
- [ ] `app/activity/workouts/[id]/page.tsx` — Template detail
- [ ] `app/activity/trends/page.tsx` — Trends

### Activity Feed
- [ ] Weekly stats header: sessions, distance, duration, workouts
- [ ] Activity cards: icon, name, duration, distance, date
- [ ] Staggered list entrance
- [ ] Swipe: edit / delete
- [ ] Tap → detail

### Choose Activity Type
- [ ] Two large tappable cards: "Cardio" and "Gym"
- [ ] Icon per type, brief description
- [ ] Recent activity types quick-select row

### Log Cardio
- [ ] Type selector: horizontal scroll chips (Run, Bike, Swim, Walk, Other)
- [ ] Duration: hours:minutes fields, large tappable
- [ ] Distance field (conditional on type)
- [ ] Notes, date picker
- [ ] Save → toast → redirect to feed

### Log Gym Workout
- [ ] Template selector or "Start Empty"
- [ ] Exercise search with autocomplete from database
- [ ] Per exercise: name, sets list
- [ ] Per set: weight + reps inputs, auto-focus next
- [ ] "Add Set" button per exercise
- [ ] "Add Exercise" button
- [ ] Rest timer (circular countdown, haptic)
- [ ] Complete → celebration animation → toast → feed

### Activity Detail
- [ ] Cardio: type, duration, distance, pace, notes, date
- [ ] Gym: exercise list with sets, reps, weights
- [ ] Edit / delete buttons

---

## Phase 4: T1D

### Route Setup
- [ ] `app/t1d/log/page.tsx` — Quick log
- [ ] `app/t1d/logbook/page.tsx` — Full logbook
- [ ] `app/t1d/logbook/[id]/page.tsx` — Entry detail
- [ ] `app/t1d/logbook/[id]/edit/page.tsx` — Edit entry
- [ ] `app/t1d/settings/page.tsx` — Settings

### Dashboard
- [ ] Glucose chart: interactive (scrub, pinch-zoom), 7-day default
- [ ] Time-in-range ring (large, animated on load)
- [ ] Average glucose, standard deviation, readings count
- [ ] Quick-add bar (docked at bottom): Glucose / Insulin / Meal buttons
- [ ] Each opens a bottom sheet for rapid entry

### Quick-Add Sheet
- [ ] Large numeric input with keypad layout
- [ ] Time picker (defaults to now)
- [ ] Notes (optional)
- [ ] Save → toast + sheet dismisses with spring

### Logbook
- [ ] Filter: date range, type, time of day
- [ ] Table: time, type icon, value, notes, color-coded dot
- [ ] Tap → detail/edit

### Entry Detail
- [ ] Value, type, time, notes
- [ ] Edit / delete

### Settings
- [ ] Basal rates, I:C ratio, correction factor
- [ ] Target range (low/high)
- [ ] Units (mg/dL or mmol/L)

---

## Phase 5: Sleep

### Route Setup
- [ ] `app/sleep/log/page.tsx` — Log sleep
- [ ] `app/sleep/[id]/page.tsx` — Sleep detail
- [ ] `app/sleep/trends/page.tsx` — Trends

### Dashboard
- [ ] Featured last-night card: duration, timeline bar, quality
- [ ] Weekly stats: avg duration, avg quality, sleep debt, consistency
- [ ] History list: compact rows with duration bar, quality dots

### Log Sleep
- [ ] Date (defaults to yesterday)
- [ ] Bedtime + wake time pickers (large fields)
- [ ] Quality selector (1-5 tap stars)
- [ ] Notes
- [ ] Save → toast → dashboard

---

## Phase 6: Body

### Route Setup
- [ ] `app/body/log/page.tsx` — Log measurement (simplified weight-first)
- [ ] `app/body/log/labs/page.tsx` — Log lab result
- [ ] `app/body/measurements/page.tsx` — History table
- [ ] `app/body/labs/page.tsx` — Lab results
- [ ] `app/body/labs/[id]/page.tsx` — Lab detail
- [ ] `app/body/supplements/page.tsx` — Supplement log
- [ ] `app/body/trends/page.tsx` — Trends

### Dashboard
- [ ] Weight sparkline + latest tiles (2x2 grid)
- [ ] Each tile: metric name, value, delta from last
- [ ] FAB "Log" opens action sheet: Weight, Full Measurement, Lab Result

---

## Phase 7: Nutrition

### Route Setup
- [ ] `app/nutrition/log/page.tsx` — Food search/entry
- [ ] `app/nutrition/meals/page.tsx` — Saved meals
- [ ] `app/nutrition/water/page.tsx` — Water tracker (inline on diary, dedicated for history)
- [ ] `app/nutrition/trends/page.tsx` — Trends

### Diary
- [ ] Macro summary bar (sticky): calories ring + P/C/F bars, all animated
- [ ] Water tracker: inline quick-add buttons (+250, +500, +1000 ml) with visual indicator
- [ ] Meal slots: Breakfast, Lunch, Dinner, Snacks with logged items

### Food Entry
- [ ] Search with autocomplete from saved foods
- [ ] Recent/favorites grid
- [ ] Tap food → portion entry → macro preview → "Add to [Meal]"
- [ ] Tap item in meal slot → edit portion / remove

---

## Phase 8: Tasks

### Route Setup
- [ ] `app/tasks/upcoming/page.tsx` — Calendar view
- [ ] `app/tasks/projects/page.tsx` — Project list
- [ ] `app/tasks/projects/[id]/page.tsx` — Project detail
- [ ] `app/tasks/[id]/page.tsx` — Task detail
- [ ] `app/tasks/[id]/edit/page.tsx` — Edit task

### Today View
- [ ] Task list with animated checkbox toggle
- [ ] Each task: title, project tag, due time
- [ ] Swipe right: complete; swipe left: schedule / delete
- [ ] Tap → detail
- [ ] Quick-add bar docked at bottom (natural language input)
- [ ] Drag to reorder (framer-motion layout animations)

### Task Detail
- [ ] Editable title
- [ ] Notes textarea
- [ ] Subtasks checklist
- [ ] Due date picker
- [ ] Priority selector
- [ ] Project selector
- [ ] Delete button

### Kanban View
- [ ] Toggle between list and kanban
- [ ] Columns: Todo, In Progress, Done with counts
- [ ] Drag-and-drop between columns

---

## Phase 9: Habits

### Route Setup
- [ ] `app/habits/new/page.tsx` — Create habit
- [ ] `app/habits/[id]/page.tsx` — Habit detail
- [ ] `app/habits/[id]/edit/page.tsx` — Edit habit
- [ ] `app/habits/calendar/page.tsx` — Monthly view

### Today View
- [ ] Date header with day navigation arrows
- [ ] Habit grid: name, streak, tap to complete
- [ ] Spring + haptic on completion
- [ ] Completed habits dimmed / sorted to bottom
- [ ] FAB: "New Habit"

### Habit Detail
- [ ] Calendar heatmap (year, GitHub-style)
- [ ] Current streak, best streak
- [ ] Completion rate (weekly, monthly)
- [ ] Edit / delete

### Create Habit
- [ ] Stepped: Name → Frequency → Time of day → Color/icon
- [ ] Create → card animates into grid

---

## Phase 10: Journal

### Route Setup
- [ ] `app/journal/new/page.tsx` — Full-screen editor
- [ ] `app/journal/[id]/page.tsx` — Entry detail
- [ ] `app/journal/[id]/edit/page.tsx` — Edit entry
- [ ] `app/journal/calendar/page.tsx` — Calendar browse

### Timeline
- [ ] Entry previews: date, time, first 3 lines, mood, tags
- [ ] Tap → detail

### Editor
- [ ] Full-screen, minimal chrome
- [ ] Large textarea
- [ ] Bottom toolbar: mood emoji row, tags chips, date, photo (future)
- [ ] Word/character count
- [ ] Save → spring transition to timeline, new entry at top

---

## Phase 11: Home Dashboard

- [ ] Widget grid with real data
- [ ] Finance widget: net worth, today's spending
- [ ] Health widget: latest glucose, TIR
- [ ] Activity widget: weekly sessions
- [ ] Tasks widget: today's top 3
- [ ] Habits widget: today's completion ring
- [ ] Sleep widget: last night
- [ ] Widget reorder (long-press, drag)
- [ ] Tap widget → navigate to module

---

## Phase 12: Polish & QA

- [ ] Audit: zero `window.confirm()` anywhere
- [ ] Audit: zero `window.alert()` anywhere
- [ ] Audit: no inline forms below display content
- [ ] Every mutation shows a toast
- [ ] Every route has a loading.tsx
- [ ] Every route has an error.tsx boundary
- [ ] All motion respects `prefers-reduced-motion`
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Screen reader labels on interactive elements
- [ ] Mobile: no horizontal scroll, no overlapping elements
- [ ] Mobile: FAB doesn't cover content
- [ ] Desktop: layouts feel richer but same workflows
- [ ] `npm run build` passes
- [ ] Visual regression check: compare screenshots to design plan
