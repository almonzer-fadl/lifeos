# UX Plan

User experience architecture for Life OS. Mobile-first, single-user, local-first.

## Current state

Every module page (`/finance`, `/t1d`, `/activity`, etc.) is a single `page.tsx` that does everything: dashboard stats, create form, list display, delete UI. No dedicated screens. No transitions. No loading states. `router.refresh()` as the universal "done" action.

This is the problem to solve.

## Navigation architecture

### Desktop (≥1024px)
- Fixed left sidebar (256px): Today, Health group, Life group, Settings
- Active state: `border-[var(--border-strong)] bg-[var(--surface-hover)]`
- Section headers: 10px uppercase overlines with dividers

### Mobile (<1024px)
- Fixed bottom tab bar (5 tabs): Today, T1D, Activity, Finance, More
- `backdrop-blur-xl` on semi-transparent `surface-deep` background
- Active tab: `var(--accent)` color, inactive: `var(--text-tertiary)`

### Route hierarchy (what needs building)

Each module gets a proper folder structure:

```
app/
├── finance/
│   ├── page.tsx              # Dashboard (balances, recent, budget overview)
│   ├── accounts/
│   │   ├── page.tsx          # Account list
│   │   └── [id]/
│   │       ├── page.tsx      # Account detail + register (transactions)
│   │       └── edit/page.tsx # Edit account
│   ├── transactions/
│   │   ├── page.tsx          # Transaction list (all accounts, searchable)
│   │   ├── new/page.tsx      # New transaction
│   │   └── [id]/edit/page.tsx
│   ├── budget/
│   │   └── page.tsx          # Monthly budget view
│   ├── assets/page.tsx
│   ├── goals/page.tsx
│   └── reports/page.tsx
```

Same pattern for health modules:

```
app/
├── t1d/
│   ├── page.tsx              # Dashboard (chart, stats)
│   ├── log/page.tsx          # Log glucose/insulin
│   └── history/page.tsx      # Full history
├── activity/
│   ├── page.tsx              # Feed + stats
│   ├── new/page.tsx          # Log activity
│   └── workouts/
│       ├── page.tsx          # Workout history
│       ├── new/page.tsx      # Start workout
│       └── [id]/page.tsx     # Workout detail
├── sleep/
│   ├── page.tsx              # Sleep dashboard
│   └── log/page.tsx          # Log sleep
├── body/
│   ├── page.tsx              # Body dashboard
│   ├── measurements/page.tsx
│   └── labs/page.tsx
├── nutrition/
│   ├── page.tsx              # Nutrition dashboard
│   ├── log/page.tsx          # Log meal
│   └── diary/page.tsx        # Full diary
```

### Layout composition

Use Next.js layout nesting, not a flat `Shell` wrapper:

```
app/
├── layout.tsx                    # Root: fonts, metadata
├── (shell)/
│   ├── layout.tsx               # Shell layout (sidebar + bottom nav)
│   ├── page.tsx                 # / (Today)
│   ├── finance/layout.tsx       # Finance section header
│   ├── t1d/layout.tsx           # T1D section header
│   └── ...
```

The `(shell)` route group wraps all authenticated/functional pages.

## Screen patterns

### 1. Dashboard screen
- Page header: icon + title + subtitle
- Widget grid: stat cards (value + label + delta)
- "Quick add" FAB or floating action
- Recent activity list at bottom

### 2. List screen
- Header with count and filter/sort
- Searchable/filterable list
- Empty state with CTA ("Add your first X")
- Each row tappable → detail
- Swipe to delete/archive (mobile)

### 3. Create / Edit screen
- Dedicated screen, not an inline form
- Form fields in logical order
- Validation on submit, errors shown inline
- Submit button fixed at bottom (mobile) or inline (desktop)
- On success: toast + navigate back

### 4. Detail screen
- Full entity view — all fields visible
- Edit button → edit screen
- Delete button → confirm sheet
- Related data below (e.g., transactions for an account)

### 5. Empty state
- Large icon or illustration
- Title: "No X yet"
- Subtitle: "Start tracking your X to see it here"
- Prominent CTA button: "Add first X"
- Never show "No data" as a dead string

## Interaction patterns

### Data entry
- Forms use controlled inputs with local state
- Submit via `fetch` to API routes, not server actions
- On success: `toast.success("X saved")` + `router.push()` or `router.back()`
- On error: `toast.error(response.error)` — show the actual error

### Deletion
- Never use `window.confirm()`
- Use `confirm-sheet.tsx` component (already built)
- On success: `toast.undo("X deleted", () => restoreX())`
- Toast auto-dismiss 5s, undo reverts

### Loading states
- Use `skeleton.tsx` (already built) for initial load
- Use `router.push()` with Next.js loading.tsx for page transitions
- Spinner for button submissions (`isPending` state)

### Feedback
- Every mutation: toast
- Every delete: undo toast
- Every error: error toast with message
- Empty lists: empty state component
- Zero data: stat shows "—" not "0" (distinguish zero from null)

## Mobile-specific

- Bottom sheets for create/edit on mobile (vaul `Drawer`)
- Dialogs for desktop (Radix `Dialog`)
- Same component, different container based on viewport
- FAB always visible on mobile list/dashboard screens
- Pull-to-refresh on list screens

## Anti-patterns to eliminate

- Inline forms on dashboard pages → dedicated screens
- `window.confirm()` → confirm sheet + undo toast
- `router.refresh()` as the only post-mutation action → toast + navigate
- Dense walls of form fields on one page → stepped or grouped
- "No data yet" as a paragraph → empty state component
- Mixing create + list + detail on one page → separate routes
