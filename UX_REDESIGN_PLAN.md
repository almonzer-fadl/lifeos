# UX Redesign Plan — Life OS

## Target

Premium iOS-intentional wealth/health command center. Every module must feel like a standalone polished app (Strava, MyFitnessPal, Apple Health, Things 3, YNAB, Day One) — not a database admin panel. The phone viewport is the primary surface. Desktop is richer but never a different workflow.

## Current State: 2/10 UX

Every module is a single page that simultaneously acts as:
- Dashboard / stats overview
- Creation form (always visible, inline)
- List / history display
- Delete UI (inline buttons on cards)

Zero dynamic routes. Zero separate create/detail/edit screens. Zero transitions. Zero loading states. Zero toast/notifications. Zero gestures. `window.confirm()` for deletion. `router.refresh()` as the universal "done" action. Forms and display content stacked vertically with no hierarchy.

## What "Premium" Means

Premium apps share these traits:

1. **One job per screen** — A screen either browses, creates, views detail, or edits. Never all at once.
2. **Progressive disclosure** — Show the most important thing first. Drill down for more.
3. **Dedicated entry flows** — Creating something is a focused, stepped experience, not an afterthought.
4. **Detail views** — Every entity has a dedicated screen showing everything about it.
5. **Confirmation is deliberate** — Delete/edit actions use sheets/modals, not browser `confirm()`.
6. **Undo, don't confirm** — Where possible, actions are reversible with an undo toast.
7. **Feedback is visible** — Toast notifications for success/error. Loading skeletons, not blank screens.
8. **Transitions have meaning** — Navigation communicates spatial relationship (push/pop, present/dismiss).
9. **Empty states invite action** — Not "No data yet" in a box. A prominent CTA to create the first item.
10. **Gestures feel native** — Swipe to act, pull to refresh, long-press for context.
11. **Numbers are alive** — Odometer counters, animated progress bars, spring-physics toggles.
12. **No AI-generic aesthetics** — No purple gradients, no default radii, no cookie-cutter cards. Every surface feels intentional.

---

## Part 1: Architecture Overhaul

### Route Restructuring

Every module gets a proper route hierarchy. Current flat structure → new nested structure:

```
app/
├── layout.tsx                          # Root shell
├── page.tsx                            # Today dashboard (widgets, at-a-glance)
│
├── finance/
│   ├── layout.tsx                      # Finance-specific shell (sub-nav, FAB)
│   ├── page.tsx                        # Wealth dashboard (net worth, exposure, quick stats)
│   ├── accounts/
│   │   ├── page.tsx                    # Account list
│   │   └── [id]/
│   │       ├── page.tsx                # Account register (transaction history, running balance)
│   │       └── transaction/
│   │           ├── new/page.tsx         # Add transaction (dedicated form)
│   │           └── [txId]/page.tsx      # Transaction detail/edit
│   ├── budget/
│   │   ├── page.tsx                    # Budget overview (current month)
│   │   └── [year-month]/page.tsx       # Specific month budget detail
│   ├── assets/
│   │   ├── page.tsx                    # Asset register
│   │   ├── new/page.tsx                # Add asset
│   │   └── [id]/
│   │       ├── page.tsx                # Asset detail
│   │       └── edit/page.tsx           # Edit asset
│   ├── debts/
│   │   ├── page.tsx                    # Debt overview / payoff planner
│   │   └── [id]/page.tsx               # Debt detail
│   ├── goals/
│   │   ├── page.tsx                    # Goals list
│   │   ├── new/page.tsx                # Create goal
│   │   └── [id]/page.tsx               # Goal detail / progress
│   ├── recurring/
│   │   ├── page.tsx                    # Scheduled transactions / calendar
│   │   └── new/page.tsx                # Create recurring
│   ├── reports/page.tsx                # Reports dashboard
│   └── import/page.tsx                 # Import workspace
│
├── activity/
│   ├── layout.tsx
│   ├── page.tsx                        # Activity feed / weekly stats
│   ├── log/
│   │   ├── page.tsx                    # Choose activity type
│   │   ├── cardio/page.tsx             # Log cardio
│   │   └── gym/page.tsx                # Log gym workout
│   ├── [id]/
│   │   ├── page.tsx                    # Activity detail
│   │   └── edit/page.tsx               # Edit activity
│   ├── workouts/
│   │   ├── page.tsx                    # Workout templates
│   │   └── [id]/page.tsx               # Template detail
│   └── trends/page.tsx                 # Trends, PRs
│
├── t1d/
│   ├── layout.tsx
│   ├── page.tsx                        # Glucose dashboard
│   ├── log/page.tsx                    # Quick log (glucose, insulin, carbs)
│   ├── logbook/
│   │   ├── page.tsx                    # Full logbook with filters
│   │   └── [id]/
│   │       ├── page.tsx                # Entry detail
│   │       └── edit/page.tsx           # Edit entry
│   └── settings/page.tsx               # Ratios, targets, basal
│
├── sleep/
│   ├── layout.tsx
│   ├── page.tsx                        # Sleep dashboard
│   ├── log/page.tsx                    # Log sleep session
│   ├── [id]/page.tsx                   # Sleep detail
│   └── trends/page.tsx                 # Trends
│
├── body/
│   ├── layout.tsx
│   ├── page.tsx                        # Body dashboard
│   ├── log/
│   │   ├── page.tsx                    # Log measurement
│   │   └── labs/page.tsx               # Log lab result
│   ├── measurements/page.tsx           # History
│   ├── labs/
│   │   ├── page.tsx                    # Lab results
│   │   └── [id]/page.tsx               # Lab detail
│   ├── supplements/page.tsx            # Supplement log
│   └── trends/page.tsx                 # Trends
│
├── nutrition/
│   ├── layout.tsx
│   ├── page.tsx                        # Today's diary
│   ├── log/page.tsx                    # Food search / entry
│   ├── meals/page.tsx                  # Saved meals / favorites
│   ├── water/page.tsx                  # Water tracker
│   └── trends/page.tsx                 # Macro trends
│
├── tasks/
│   ├── layout.tsx
│   ├── page.tsx                        # Today
│   ├── upcoming/page.tsx               # Scheduled / calendar
│   ├── projects/
│   │   ├── page.tsx                    # Projects list
│   │   └── [id]/page.tsx               # Project detail
│   └── [id]/
│       ├── page.tsx                    # Task detail
│       └── edit/page.tsx               # Edit task
│
├── habits/
│   ├── layout.tsx
│   ├── page.tsx                        # Today's habits
│   ├── new/page.tsx                    # Create habit
│   ├── [id]/
│   │   ├── page.tsx                    # Habit detail (calendar, streak, stats)
│   │   └── edit/page.tsx               # Edit habit
│   └── calendar/page.tsx               # Monthly view
│
├── journal/
│   ├── layout.tsx
│   ├── page.tsx                        # Timeline / feed
│   ├── new/page.tsx                    # Full-screen editor
│   ├── [id]/
│   │   ├── page.tsx                    # Entry detail
│   │   └── edit/page.tsx               # Edit entry
│   └── calendar/page.tsx               # Calendar browse
│
└── settings/                           # (keep as-is or expand)
    └── page.tsx
```

### Navigation Patterns

**Mobile (primary)**:
- Bottom tab bar: Today, Health (T1D), Activity, Finance, More
- Module sub-navigation: Top bar with back button + title + contextual action
- FAB (Floating Action Button): Primary create action per module, positioned bottom-right
- Swipe back: Native iOS gesture (Next.js App Router handles this on PWA)
- Bottom sheets: Quick actions, delete confirmations, category selection

**Desktop**:
- Sidebar with module sections (keep current)
- Module sub-nav as horizontal tabs or vertical sub-sidebar
- FAB becomes a prominent button in the header area
- Modals/overlays for create/edit/delete instead of sheets

### Shared UI Primitives Needed

These must exist before any module work:

| Primitive | Purpose | Implementation |
|---|---|---|
| Toast | Success/error/undo notifications | `sonner` or custom with framer-motion |
| Sheet | Bottom sheet for mobile quick actions | `vaul` or `@radix-ui/react-dialog` |
| Dialog | Confirmation modals, detail modals on desktop | `@radix-ui/react-dialog` |
| Skeleton | Loading placeholders | Custom CSS component (already have `.skeleton` class) |
| EmptyState | Inviting empty states with CTA | Custom component with illustration slot |
| Fab | Floating action button | Custom component, positioned fixed |
| SwipeAction | Swipe-to-reveal actions on list rows | framer-motion gesture or custom |
| Odometer | Animated number counting | framer-motion `useSpring` or custom hook |
| ProgressRing | Circular progress indicator | SVG with animated stroke-dashoffset |
| PageTransition | Animated page enter/exit | framer-motion `AnimatePresence` + layout animations |

---

## Part 2: Motion & Animation System

### Principles

1. **Spring physics over duration curves** — Default to spring animations (stiffness: 300, damping: 30) for UI elements. They feel native and responsive.
2. **Stagger, don't flood** — Lists animate in with 30-50ms stagger. Never all at once.
3. **Scale over opacity** — Buttons press to 0.97 scale with spring, not color change.
4. **Animate from origin** — Sheets slide up from bottom. Modals scale from center. Pages push from right.
5. **Numbers count, don't appear** — Money and stats use odometer-style counting on first load.
6. **Progress draws, doesn't jump** — Bars and rings animate to their value on mount.
7. **Exit is as important as enter** — Every animated entrance has a corresponding exit.
8. **Respect prefers-reduced-motion** — All animations disable when the OS setting is on.

### Animation Library

**Use `framer-motion`** (motion) — it's the standard for React animation, supports:
- Layout animations (animate layout changes automatically)
- Gesture support (drag, swipe, hover, tap)
- Spring physics
- AnimatePresence for exit animations
- Shared layout IDs for hero transitions
- `useSpring` / `useMotionValue` for imperative animations (odometer)

### Key Animations by Context

#### Page Transitions

```tsx
// Appear from bottom (push navigation)
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -8 }}
  transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
>
```

- Forward navigation (list → detail): Content enters from right, fades in
- Back navigation (detail → list): Content exits right
- Modal/Sheet: Scales up from center or slides up from bottom
- Tab switches: Crossfade (150ms)

#### List Stagger

```tsx
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    hidden: {},
    visible: { transition: { staggerChildren: 0.04 } }
  }}
>
  {items.map(item => (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
      }}
    >
      <ItemCard item={item} />
    </motion.div>
  ))}
</motion.div>
```

#### Button Press

```tsx
<motion.button
  whileTap={{ scale: 0.97 }}
  whileHover={{ scale: 1.01 }}
  transition={{ type: "spring", stiffness: 500, damping: 25 }}
>
```

#### Toggle / Checkbox

```tsx
<motion.div
  animate={{
    backgroundColor: isActive ? "var(--emerald)" : "var(--border)",
    scale: isActive ? 1 : 1
  }}
  transition={{ type: "spring", stiffness: 500, damping: 30 }}
>
  <motion.div
    animate={{ x: isActive ? 16 : 0 }}
    transition={{ type: "spring", stiffness: 500, damping: 30 }}
  />
</motion.div>
```

#### Odometer Counter (Net Worth, Stats)

```tsx
function Odometer({ value }: { value: number }) {
  const spring = useSpring(0, { stiffness: 100, damping: 30 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (v) => setDisplay(Math.round(v)));
    return unsubscribe;
  }, [spring]);

  return <span className="font-mono tabular-nums">{display.toLocaleString()}</span>;
}
```

#### Progress Bar / Ring

- Bars: `motion.div` with animated `width` or `scaleX` from 0 to progress value
- Rings: SVG circle with animated `stroke-dashoffset`, spring physics
- Both animate `onViewportEnter` (only when scrolled into view)

#### Sheet / Bottom Sheet

- Backdrop: `motion.div` with animated opacity (0 → 1)
- Sheet: `motion.div` with animated y (100% → 0), spring with damping
- Drag to dismiss: framer-motion `drag="y"` with `dragConstraints` and `onDragEnd` threshold
- Pull indicator: Small handle bar at top of sheet, animated on drag

#### Swipe Actions (Transaction List, Task List)

```tsx
<motion.div
  drag="x"
  dragConstraints={{ left: -120, right: 0 }}
  dragElastic={0.1}
  onDragEnd={(_, info) => {
    if (info.offset.x < -60) setRevealed(true);
    else setRevealed(false);
  }}
>
  <Row />
  <motion.div className="absolute right-0 top-0 bottom-0 flex">
    {/* Delete / Edit buttons revealed on swipe */}
  </motion.div>
</motion.div>
```

#### Empty State → First Item

- Empty state CTA pulses subtly
- After first item is created, it animates in with a spring entrance
- Empty state fades out simultaneously

#### Pull to Refresh

- Custom `motion.div` pulling down from top
- Animated spinner (gold, thin stroke)
- Spring back on release

#### Success/Confirmation

- Checkmark: SVG path with animated `stroke-dashoffset` (draw effect)
- Subtle scale bounce (1 → 1.1 → 1) on completion
- Fade out after 1.5s

#### Haptic Feedback

Use a `useHaptic` hook that calls `navigator.vibrate` on mobile:
- Light tap: `navigator.vibrate(10)` on button press
- Success: `navigator.vibrate([10, 50, 10])` on completion
- Warning: `navigator.vibrate([20, 30, 20])` on error
- Only triggers if device supports it and user hasn't disabled

### When NOT to Animate

- During rapid typing (form inputs)
- On every keystroke in search
- During scroll (no parallax junk)
- When `prefers-reduced-motion: reduce` is set
- On items far below the fold that won't be seen
- During data re-fetch (only animate initial load)

---

## Part 3: Avoiding AI-Generic Aesthetics

### What Makes UIs Look AI-Generated

- **Default rounded corners everywhere** — `rounded-lg` on every element
- **Purple-to-blue gradients** — The universal AI gradient
- **Uniform white cards with shadows** — Bootstrap/material default
- **Inter font at default weight** — No typographic personality
- **Equal padding on everything** — No rhythm, no negative space variation
- **Generic emoji icons** — No custom iconography
- **No distinctive detail** — Nothing that couldn't be generated from a prompt

### Life OS Anti-AI Rules

1. **No bright gradients as visual language** — Subtle radial gradients in background only. No gradient buttons.
2. **Border radius is deliberate**:
   - 4-6px: Form controls, chips, small elements
   - 8px: Cards, panels, stat boxes
   - 12px: Modals, sheets
   - 16px: Large featured cards only
   - Never: Full-rounded pills (too consumer)
3. **Typography has hierarchy**:
   - Uppercase micro-labels (9-10px, tracking 0.18em) for section headers
   - Mono for all numbers, dates, codes, IDs
   - Sans-serif body at 14px, never 16px default
   - No font-weight: 400 — minimum 450 for legibility on dark
4. **Cards have variation**:
   - Not every card is the same shape/size
   - Feature cards can be taller, wider, or rectangular
   - Stat cards are dense and compact
   - List rows are not cards (border-bottom separators, no elevation)
5. **Negative space is uneven**:
   - Tighter spacing in data-dense sections
   - More breathing room around primary metrics
   - Section gaps vary by importance (16px between related, 24px between sections)
6. **Color is semantic, not decorative**:
   - Gold: Only for primary accent (buttons, active nav, key metrics)
   - Emerald: Only for positive money/health values
   - Rose: Only for negative values, debt, warnings
   - Amber: Only for bills, due dates, scheduled items
   - Sky: Only for secondary data, links, info
   - No random color splashes for "visual interest"
7. **Icons are consistent**:
   - Inline SVG paths (no emoji, no icon font)
   - Same stroke width (1.5px)
   - Same visual density across all icons
8. **Surfaces have subtle texture**:
   - Inner highlights (1px white at 4-7% opacity, top edge)
   - Very subtle noise/grain on featured surfaces (optional, CSS only)
   - Hairline borders (1px, 7-10% white) — never 2px borders
9. **Shadows are minimal and dark**:
   - No colored shadows
   - Use `box-shadow` with black at 30-55% opacity
   - Inner shadow for pressed states
   - No floating/depth-heavy card shadows

### Current App Score on Anti-AI Rules

| Rule | Current | Target |
|---|---|---|
| No bright gradients | ✅ Good — subtle radials only | Keep |
| Deliberate radius | ⚠️ Mostly 0.625rem everywhere | Vary by element type |
| Typography hierarchy | ✅ Good — mono numbers, micro-labels | Keep, refine |
| Card variation | ❌ All cards same pattern | Add size/shape variation |
| Uneven negative space | ❌ Uniform gaps | Add rhythm variation |
| Semantic color | ✅ Good — colors have meaning | Keep |
| Icon consistency | ✅ Good — inline SVG | Keep |
| Surface texture | ✅ Good — inner highlights | Add very subtle grain |
| Shadow restraint | ✅ Good — dark, low shadows | Keep |

**Main gap**: Cards are too uniform. Need to introduce size variation — some wide, some tall, some dense grid, some standalone feature blocks.

---

## Part 4: Module-by-Module UX Flows

### 4.1 Finance (Priority: Critical — the money command center)

**Current**: One 305-line page. 5 inline forms + 8 display sections. No drill-down.

**Target flow**:

```
Finance Home (Wealth Dashboard)
├── Net worth: Large odometer number, gold
├── Exposure strip: Cash | Assets | Debts (horizontal chips)
├── Quick stats: Income 30D, Expenses 30D, Bills/Mo, Cashflow
├── Recent transactions: Last 5, with "View All →"
│
├── [Tap "Accounts"] → Account List
│   ├── Card per account (name, balance, currency, type)
│   ├── FAB: "Add Account" → Account Creation Flow
│   └── [Tap Account] → Account Register
│       ├── Header: Account name, balance, running total
│       ├── Transaction list (full history, paginated)
│       │   ├── Each row: date, description, category, amount (right-aligned)
│       │   ├── Swipe left: Edit / Delete
│       │   └── Tap row: Transaction Detail/Edit
│       ├── Filter bar: Date range, search, category, status
│       └── FAB: "Add Transaction" → Transaction Entry Flow
│           ├── Step 1: Type (expense/income/transfer) - chip select
│           ├── Step 2: Amount (large number pad input)
│           ├── Step 3: Category (searchable list)
│           ├── Step 4: Details (description, date, notes)
│           └── Step 5: Confirm (summary + "Save" button)
│
├── [Tap "Budget"] → Budget Dashboard
│   ├── Month picker (horizontal scroll, current month centered)
│   ├── "Available to Assign" card (prominent)
│   ├── Category groups with assigned/activity/available columns
│   └── [Tap Category] → Budget Category Detail
│       ├── Assigned this month
│       ├── Activity (transactions in this category)
│       ├── Available (remaining)
│       └── Quick assign: +10, +50, +100 buttons
│
├── [Tap "Assets"] → Asset Register
│   ├── Asset cards: name, current value, gain/loss, type badge
│   ├── Total asset value header
│   └── FAB: "Add Asset"
│
├── [Tap "Goals"] → Goals List
│   ├── Progress rings per goal
│   └── FAB: "Add Goal"
│
├── [Tap "Bills"] → Recurring Calendar
│   ├── Month view with bill dots
│   ├── Upcoming bills list below calendar
│   └── FAB: "Add Recurring"
│
├── [Tap "Debts"] → Debt Payoff Planner
│   ├── Debt snowball/avalanche visualization
│   └── Each debt: balance, APR, minimum, payoff date
│
└── [Tap "Reports"] → Reports Dashboard
    ├── Net worth over time (chart - phase 2)
    ├── Income vs expenses (chart)
    ├── Spending by category
    └── Export CSV
```

**Key UX details for Finance**:
- Transaction amounts use **mono tabular-nums** so columns align perfectly
- Running balance column in account register (rightmost, mono)
- Cleared/reconciled status on transactions: small dot indicator (green = cleared, gold = reconciled)
- When creating a transaction, after "Save": toast "Transaction saved — Undo" (3s undo window)
- Account balance odometer animation on register load
- Budget category quick-assign: tap + or - to adjust by $10, long-press for $100
- Import workspace: drag-and-drop CSV zone with preview table

### 4.2 Activity (Priority: High — closest to Strava premium)

**Current**: Weekly stats + cardio form + gym form + activities list + workouts list. All stacked.

**Target flow**:

```
Activity Feed
├── Weekly stats header: Sessions, Distance, Duration, Workouts
│   (tappable → expands to show comparison vs last week)
├── Recent activities list
│   ├── Card per activity: type icon, name, duration, distance, date
│   ├── Swipe left: Edit / Delete
│   └── Tap → Activity Detail
│       ├── Map/route (future)
│       ├── Stats: splits, pace, heart rate zones, elevation
│       ├── Edit button (top right)
│       └── Delete button (bottom, destructive)
│
├── [Tap "Log"] → Choose Activity Type
│   ├── Large tappable cards:
│   │   ├── "Cardio" (run, bike, swim, walk, etc.)
│   │   └── "Gym" (strength training)
│   ├── Recent activity types (quick-select row)
│   └── [Tap Cardio] → Log Cardio
│   │   ├── Type selector (horizontal scroll chips: Run, Bike, Swim, Walk, Other)
│   │   ├── Duration input (hours:minutes picker or simple number + unit)
│   │   ├── Distance input (if applicable)
│   │   ├── Notes textarea
│   │   ├── Date picker (defaults to today)
│   │   └── "Save" button → toast → redirect to feed
│   └── [Tap Gym] → Log Gym Workout
│       ├── Template selector or "Start Empty"
│       ├── Exercise search/add (search bar with autocomplete from exercise DB)
│       ├── Per exercise: sets with weight + reps input
│       │   ├── "Add Set" button per exercise
│       │   └── Set number, weight, reps fields in a row
│       ├── Rest timer (optional, tap to start/stop)
│       ├── Notes
│       └── "Complete Workout" → toast → redirect to feed
│
└── [Tap "Workouts"] → Workout Templates
    ├── Library of saved workout templates
    ├── Create template (same as logging gym but saves as template)
    └── Tap → Start workout from template
```

**Key UX details for Activity**:
- Duration picker: iOS-style scrolling picker or large tap-to-increment fields
- Exercise search: type to filter the exercise database, show muscle group badges
- Set logging: weight/reps inputs should auto-focus next field on enter/keyboard-next
- Rest timer: circular countdown ring, haptic buzz on completion
- Workout completion: subtle celebration animation (checkmark + stats summary)
- Cardio type chips animate selection with spring scale

### 4.3 T1D (Priority: High — health-critical, needs precision)

**Current**: Glucose chart + glucose form + insulin form + readings table. All stacked.

**Target flow**:

```
T1D Dashboard
├── Glucose chart (7-day, interactive)
│   ├── Time-in-range ring (prominent)
│   ├── Average glucose
│   ├── Standard deviation
│   └── [Tap chart] → expands to full-screen with tooltips
│
├── Quick-add bar (always visible, docked)
│   ├── "Glucose" button → glucose entry
│   ├── "Insulin" button → insulin entry
│   ├── "Meal" button → carb entry
│   └── Each opens a bottom sheet (not new page) for speed
│       ├── Large number input (keypad-style)
│       ├── Time picker (defaults to now)
│       ├── Notes (optional)
│       └── "Save" → toast + sheet dismisses
│
├── Logbook → Full logbook
│   ├── Filter: date range, type (all/glucose/insulin/carbs), time of day
│   ├── Table: time, type icon, value, notes
│   ├── Tap row → Entry detail/edit
│   └── Pattern detection: "You tend to go low after 3pm" (future)
│
└── Settings
    ├── Basal rates
    ├── Insulin-to-carb ratio
    ├── Correction factor
    ├── Target range (low/high)
    └── Units (mg/dL or mmol/L)
```

**Key UX details for T1D**:
- Glucose entry: Large numeric keypad, big display number (accessible for shaky hands)
- Time-in-range ring animates on dashboard load
- Chart: interactive — drag finger to scrub values, pinch to zoom date range
- Quick-add sheet: slides up in 200ms, can be dragged down to dismiss
- Readings list: color-coded dots (green = in range, amber = low, red = high, rose = critical)
- Insulin: separate basal vs bolus entry with different visual treatment

### 4.4 Sleep (Priority: Medium-High)

**Current**: Stats + form + history. Stacked.

**Target flow**:

```
Sleep Dashboard
├── Last night card (featured, large)
│   ├── Duration (large number)
│   ├── Bedtime → Wake time timeline bar
│   ├── Quality indicator (5-star or score badge)
│   └── [Tap] → Sleep Detail
│
├── Weekly stats row
│   ├── Avg duration, Avg quality, Sleep debt, Consistency %
│
├── Sleep history list
│   ├── Compact row per night: date, duration bar, quality dots
│   ├── [Tap] → Sleep Detail
│   │   ├── Duration breakdown (future: stages)
│   │   ├── Bedtime, wake time, time in bed, actual sleep
│   │   ├── Quality
│   │   ├── Notes
│   │   └── Edit / Delete
│
├── FAB: "Log Sleep" → Sleep Entry
│   ├── Date (defaults to last night / today)
│   ├── Bedtime picker (time only, large tappable fields)
│   ├── Wake time picker
│   ├── Quality selector (1-5, visual stars or simple tap-select)
│   ├── Notes
│   └── "Save" → toast → redirect to dashboard
│
└── Trends (future)
    ├── Duration trend chart
    ├── Consistency calendar heatmap
    └── Bedtime/wake time consistency
```

### 4.5 Body (Priority: Medium)

**Current**: 3 separate forms + 3 display sections. Most cluttered page.

**Target flow**:

```
Body Dashboard
├── Weight trend sparkline (mini chart, last 30 days)
├── Latest measurements tiles (2x2 grid)
│   ├── Weight, Body fat %, Waist, [custom]
│   ├── Each shows: current value, delta from last, date
│   └── [Tap] → Measurement history chart for that metric
│
├── FAB: "Log" → opens action sheet
│   ├── "Log Weight" (simplified: weight only, quick)
│   ├── "Full Measurement" (all fields)
│   └── "Log Lab Result"
│
├── Measurements History → table/chart
│   └── Date, Weight, BF%, etc. in columns
│
├── Lab Results → list
│   ├── Grouped by type (blood, urine, etc.)
│   ├── Each row: test name, result, reference range, date
│   ├── Flag icons: in-range (green), out-of-range high (red), low (amber)
│   └── [Tap] → Lab detail with trend
│
├── Supplements → today's log
│   ├── Checklist style: supplement name, dosage, taken? toggle
│   └── Add/edit supplements in settings-style screen
│
└── Trends (future)
    ├── Weight over time (line chart)
    ├── Body fat % trend
    └── Measurement comparisons
```

### 4.6 Nutrition (Priority: Medium)

**Current**: Macro cards + food form + water form + diary. Stacked.

**Target flow**:

```
Nutrition Diary (Today)
├── Macro summary bar (top, sticky)
│   ├── Calories: current / goal (progress ring)
│   ├── Protein / Carbs / Fat bars
│   └── Water tracker (inline, not separate form)
│       ├── Quick-add buttons: +250ml, +500ml, +1L
│       └── Visual water level indicator
│
├── Meal slots (Breakfast, Lunch, Dinner, Snacks)
│   ├── Each slot shows items logged or "+" to add
│   ├── [Tap slot] → Food entry for that meal
│   │   ├── Search bar (search saved foods, recent items)
│   │   ├── Recent/favorites grid above search results
│   │   ├── [Tap food] → Portion entry
│   │   │   ├── Serving size selector
│   │   │   ├── Macro preview updates live
│   │   │   └── "Add to [Meal]" button
│   │   └── [Scan barcode] (future)
│   │
│   └── Tap item in slot → Edit/remove portion
│
├── Saved Meals → common meals you log together
│
└── Trends (future)
    ├── Calorie trend
    ├── Macro split pie/donut
    └── Weekly averages
```

**Key UX details for Nutrition**:
- Water: tap the water indicator to add, not a separate form
- Meal slots: visual plates/progress per meal type
- Food search: autocomplete from existing foods + exercise DB entries
- Macro bars: animate width on each food addition
- Quick-add recent items: row of chips for last 5 logged foods

### 4.7 Tasks (Priority: Medium)

**Current**: Create form + 3-column kanban. No detail, no dates, no reorder.

**Target flow**:

```
Tasks - Today (default view)
├── Header: "Today — Wed, Jun 17" with date
├── Task list (grouped by priority or project)
│   ├── Each task: checkbox (animated toggle), title, project tag, due time
│   ├── Swipe right: Complete
│   ├── Swipe left: Schedule / Delete
│   ├── [Tap] → Task Detail
│   │   ├── Title (editable inline)
│   │   ├── Notes (textarea)
│   │   ├── Subtasks (checklist)
│   │   ├── Due date picker
│   │   ├── Priority selector
│   │   ├── Project selector
│   │   ├── Tags
│   │   └── Delete (bottom, destructive)
│   └── Drag to reorder tasks
│
├── Quick-add bar (bottom-docked on mobile)
│   ├── Text input: "What needs to be done?"
│   ├── Natural language: "Buy milk tomorrow at 5pm #groceries !high"
│   └── Enter key → creates task, input clears, stays focused
│
├── [Upcoming tab] → Calendar/scheduled view
│
├── [Projects tab] → Project list
│   └── [Tap] → Project detail (filtered task list)
│
└── [Kanban toggle] → Switch to kanban view (current 3-column)
    ├── Drag and drop between columns (framer-motion layout animations)
    └── Column counts: "3 Todo", "1 In Progress", "8 Done"
```

### 4.8 Habits (Priority: Medium)

**Current**: Create form + habit cards. Always-visible form, no calendar, no stats.

**Target flow**:

```
Habits - Today
├── Date header with left/right arrows to navigate days
├── Habit grid/list
│   ├── Each habit: name, streak fire emoji/number, tap to complete
│   ├── [Tap] → Mark complete (haptic + spring animation + streak increment)
│   ├── [Long press] → Habit Detail
│   │   ├── Calendar heatmap (year view, GitHub-style)
│   │   ├── Current streak, Best streak
│   │   ├── Completion rate (weekly, monthly)
│   │   ├── Frequency info
│   │   └── Edit / Delete
│   └── Completed habits move to bottom or get grayed/dimmed
│
├── FAB: "New Habit" → Create Habit Flow
│   ├── Step 1: Name (e.g., "Read 30 minutes")
│   ├── Step 2: Frequency (daily, weekly, specific days)
│   ├── Step 3: Time of day (morning, afternoon, evening, any)
│   ├── Step 4: Color/Icon (optional, for visual distinction)
│   └── "Create" → card animates into the grid
│
└── Calendar view → month grid with completion dots
```

### 4.9 Journal (Priority: Medium-Low)

**Current**: Textarea + entries list. Basic.

**Target flow**:

```
Journal - Timeline
├── Entries feed (reverse chronological)
│   ├── Each entry: date, time, first 3 lines preview, mood badge, tags
│   ├── [Tap] → Entry Detail
│   │   ├── Full content
│   │   ├── Mood, Tags
│   │   ├── Date/time
│   │   └── Edit / Delete buttons
│   └── Photos/attachments (future)
│
├── FAB: "New Entry" → Full-screen Editor
│   ├── Large textarea (full screen, no distractions)
│   ├── Toolbar (bottom, minimal):
│   │   ├── Mood selector (emoji row, tappable)
│   │   ├── Tags input (comma-separated or chip-add)
│   │   ├── Photo attach (future)
│   │   └── Date (defaults to today, can change)
│   ├── Character/word count
│   └── "Save" → spring transition back to timeline, entry appears at top
│
├── Calendar view → browse entries by date
│   └── Dots on dates that have entries
│
└── Search (future)
```

### 4.10 Home / Today Dashboard (Priority: Medium)

**Current**: Placeholder cards with "--". Greeting + navigation links.

**Target flow**:

```
Home - Today at a Glance
├── Greeting header: "Good morning, [Name]" with date
│
├── Widget grid (customizable, but default config):
│   ├── Finance widget: Net worth, today's spending
│   ├── Health widget: Latest glucose, time-in-range
│   ├── Activity widget: This week's sessions, today's workout?
│   ├── Tasks widget: Today's pending tasks (top 3)
│   ├── Habits widget: Today's habit completion ring
│   ├── Sleep widget: Last night's sleep duration
│   ├── Calendar widget: Upcoming events (future)
│   └── Weather widget (future, location-based)
│
├── Each widget: compact card
│   ├── Module icon + label (header)
│   ├── Key metric(s)
│   ├── Tap → navigates to that module
│   └── Pulls real data (not placeholders)
│
└── Widget reorder: long-press to enter edit mode, drag to rearrange
```

---

## Part 5: Component System

### 5.1 Toast System

Use `sonner` (lightweight, customizable, supports rich content + actions):

```tsx
import { Toaster, toast } from "sonner";

// Success with undo
toast.success("Transaction saved", {
  action: { label: "Undo", onClick: () => undoDelete(id) },
  duration: 4000,
});

// Error
toast.error("Failed to save. Check your connection.");

// Loading → success
const promise = saveData();
toast.promise(promise, {
  loading: "Saving...",
  success: "Saved",
  error: "Could not save",
});
```

Toast styling (dark):
- Background: `var(--surface-raised)`
- Border: `var(--border)`
- Text: `var(--text)`
- Accent line: left border in semantic color (gold=success, rose=error)
- Font: 13px, sans-serif
- Position: bottom-center on mobile, bottom-right on desktop

### 5.2 Sheet System

Use `vaul` (iOS-style bottom sheet) for mobile, standard dialog for desktop:

```tsx
import { Drawer } from "vaul";

<Drawer.Root>
  <Drawer.Trigger>Open</Drawer.Trigger>
  <Drawer.Portal>
    <Drawer.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
    <Drawer.Content className="fixed bottom-0 left-0 right-0 bg-[var(--surface-raised)] border-t border-[var(--border)] rounded-t-2xl max-h-[85vh]">
      <Drawer.Handle className="mx-auto mt-3 mb-2 w-10 h-1 rounded-full bg-[var(--border-strong)]" />
      {/* Content */}
    </Drawer.Content>
  </Drawer.Portal>
</Drawer.Root>
```

Sheet uses:
- Quick-add (glucose, transaction, task)
- Delete confirmation
- Filter/sort options
- Category/account selection
- Edit actions on mobile

### 5.3 Dialog System

Use `@radix-ui/react-dialog` for modals (desktop) and confirmations:

```tsx
<Dialog.Root>
  <Dialog.Trigger />
  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" />
    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--surface-raised)] border border-[var(--border)] rounded-xl shadow-[0_30px_90px_rgba(0,0,0,0.55)] p-6 max-w-md w-[calc(100%-2rem)] animate-in zoom-in-95 fade-in">
      <Dialog.Title />
      <Dialog.Description />
      {/* Content */}
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

### 5.4 Skeleton Loader

Already have `.skeleton` CSS class. Need to use it properly:

```tsx
function TransactionListSkeleton() {
  return (
    <div className="space-y-1">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-3 border-b border-[var(--border-light)]">
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-3 w-1/2" />
          </div>
          <div className="skeleton h-4 w-16" />
        </div>
      ))}
    </div>
  );
}
```

Every page needs a `loading.tsx` with skeleton.

### 5.5 Empty State

```tsx
function EmptyState({
  icon,        // SVG path
  title,       // "No accounts yet"
  description, // "Track your checking, savings, and credit cards in one place."
  action,      // { label: "Add Account", href: "/finance/accounts/new" }
}: {
  icon: string;
  title: string;
  description: string;
  action: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full border border-[var(--border)] bg-[var(--surface)] p-4 mb-4">
        <svg className="w-8 h-8 text-[var(--text-tertiary)]" ...>
          <path d={icon} />
        </svg>
      </div>
      <h3 className="text-sm font-semibold text-[var(--text)] mb-1">{title}</h3>
      <p className="text-xs text-[var(--text-tertiary)] max-w-xs mb-4">{description}</p>
      <Link href={action.href} className="premium-action">
        {action.label}
      </Link>
    </div>
  );
}
```

### 5.6 FAB (Floating Action Button)

```tsx
function Fab({ href, icon }: { href: string; icon: string }) {
  return (
    <Link
      href={href}
      className="fixed bottom-20 right-4 z-40 lg:bottom-8 lg:right-8 w-14 h-14 rounded-2xl bg-[linear-gradient(180deg,rgba(220,193,122,0.24),rgba(220,193,122,0.12))] border border-[rgba(220,193,122,0.4)] shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex items-center justify-center transition-all hover:scale-105 active:scale-95"
    >
      <svg className="w-6 h-6 text-[var(--accent)]" ...>
        <path d={icon} />
      </svg>
    </Link>
  );
}
```

Position adjusts for mobile bottom nav (bottom-20) vs desktop (bottom-8).

### 5.7 Swipeable Row

```tsx
function SwipeableRow({
  children,
  actions, // { label: string; icon: string; onPress: () => void; destructive?: boolean }[]
}: {
  children: React.ReactNode;
  actions: { label: string; icon: string; onPress: () => void; destructive?: boolean }[];
}) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="relative overflow-hidden">
      <motion.div
        drag="x"
        dragConstraints={{ left: -(actions.length * 72), right: 0 }}
        dragElastic={0.1}
        onDragEnd={(_, info) => {
          setRevealed(info.offset.x < -60);
        }}
        className="relative z-10 bg-[var(--bg)]"
      >
        {children}
      </motion.div>
      <div className="absolute inset-y-0 right-0 flex">
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={action.onPress}
            className={`w-[72px] flex items-center justify-center ${
              action.destructive
                ? "bg-[rgba(255,95,109,0.12)] text-[var(--rose)]"
                : "bg-[rgba(115,167,216,0.08)] text-[var(--sky)]"
            }`}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wide">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

## Part 6: Implementation Phases

### Phase 1: Foundation (2-3 weeks)

Infrastructure that everything else depends on:

1. **Install dependencies**:
   - `framer-motion` (animations)
   - `sonner` (toasts)
   - `vaul` (bottom sheets)
   - `@radix-ui/react-dialog` (modals)

2. **Create shared UI components**:
   - Toast provider + styled toasts
   - Sheet component (wrapping vaul)
   - Dialog component (wrapping radix)
   - EmptyState component
   - Fab component
   - Skeleton components per module
   - Page transition wrapper (AnimatePresence + motion.div)

3. **Create `loading.tsx` for every route** (skeleton states)

4. **Create module layout files**:
   - Each module gets a `layout.tsx` with:
     - Module sub-navigation (tab bar or header tabs)
     - FAB positioned correctly
     - Module-specific context if needed

5. **Refactor shell**:
   - Extract mobile bottom nav to be more configurable
   - Ensure back navigation works with nested routes

### Phase 2: Finance Module (2-3 weeks) — CRITICAL PATH

This is the flagship module. It sets the pattern for everything else.

1. **Create route structure** (all the [id] folders, new pages)
2. **Account list + detail** (register with running balance)
3. **Dedicated transaction entry flow** (stepped, not inline)
4. **Transaction detail/edit page**
5. **Delete with confirmation sheet** (not `window.confirm()`)
6. **Toast notifications** on all mutations
7. **Empty states with CTAs** for all sections
8. **Budget page** (new, envelope-style — core YNAB parity)
9. **Animations**: odometer for net worth, staggered transaction list, spring buttons
10. **Pull-to-refresh** on account register

### Phase 3: Health Modules (2-3 weeks)

Activity, T1D, Sleep, Body, Nutrition — in priority order.

Each module gets:
1. Proper route structure
2. Dedicated log flows (not inline forms)
3. Detail views
4. Edit capability
5. Delete confirmation sheets
6. Empty states
7. Toast notifications
8. Staggered list animations

### Phase 4: Life Modules (1-2 weeks)

Tasks, Habits, Journal.

Plus:
- Task drag-and-drop (kanban)
- Habit calendar heatmap
- Journal full-screen editor

### Phase 5: Home Dashboard + Polish (1-2 weeks)

1. Home page widgets pulling real data
2. Widget reorder
3. Cross-module data aggregation
4. Polish pass: refine all animations, ensure consistency
5. Accessibility audit (prefers-reduced-motion, keyboard nav, screen reader labels)
6. Performance: lazy load modules, optimize motion bundles

---

## Part 7: What Stays the Same

The current visual foundation is strong and should be preserved:

- **CSS design tokens** in `globals.css` — the palette, typography, spacing, shadows, and premium-* classes are solid
- **Shell layout** — sidebar (desktop) + bottom nav (mobile) pattern works
- **Form control styling** — dark inputs, thin borders, gold focus rings
- **Mono numeric values** — all money, dates, codes use font-mono
- **Uppercase micro-labels** — section headers and stat labels
- **Subtle background gradients** — the radial gold/blue atmospheric gradients
- **Inner highlight pseudo-elements** — the ::before hairline on panels
- **Custom scrollbar** styling
- **Safe area padding** for iPhone
- **Backdrop blur** on mobile nav

These create the "institutional dark terminal" aesthetic. The UX overhaul adds navigation flow, interaction depth, and motion on top of this foundation — it doesn't replace the visual language.

---

## Part 8: Success Criteria

Each module is 10/10 when:

- [ ] User can browse items in a clean list
- [ ] User can tap an item to see full detail
- [ ] User can edit any field of an existing item
- [ ] User can create a new item through a dedicated, focused flow (not inline)
- [ ] Delete requires confirmation via sheet/dialog (not browser confirm)
- [ ] Every action shows a toast (success/error/undo)
- [ ] Empty states show an inviting CTA to create the first item
- [ ] Lists animate in with stagger
- [ ] Buttons have spring press feedback
- [ ] Numbers count up on first load (odometer)
- [ ] Page transitions communicate spatial navigation
- [ ] Loading states use skeletons, not blank screens
- [ ] Pull-to-refresh works on scrollable lists
- [ ] Swipe actions work on list rows (where appropriate)
- [ ] Back navigation works intuitively
- [ ] FAB provides one-tap access to the primary create action
- [ ] No `window.confirm()` or `window.alert()` anywhere
- [ ] No inline forms below display content
- [ ] Mobile layout does not overlap or require horizontal scroll
- [ ] Desktop layout feels richer but same workflows
