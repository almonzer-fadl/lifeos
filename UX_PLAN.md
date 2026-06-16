# UX — 6/10 → 10/10

## Current state
- One-job-per-screen enforced across all modules
- FAB on home, finance, T1D, activity
- Skeleton loading on 41 routes
- Page transitions with reduced-motion respect
- Toast on every mutation, confirm sheets on deletes
- Empty states with CTAs on all sections

## What blocks 10/10

### 1. No pull-to-refresh
Every list/dashboard needs a manual navigation or button press to see new data. This is the single biggest UX gap on mobile.
- Add `touch` event handling or use a library (e.g., `react-use` has `useTouch`)
- Pull down from top → spinner → refetch data
- Already have `router.refresh()` pattern — just need the gesture trigger
- Apply to: /finance, /t1d, /activity, /sleep, /body, /nutrition, /habits, /journal, /tasks

### 2. No optimistic UI
Every mutation shows a saving spinner then a toast. Premium apps update the UI immediately and roll back on error.
- Apply to: habit toggle (check mark appears instantly), task status move (card jumps to next column), transaction delete (row disappears)
- On error: toast the error and revert the UI
- This makes the app feel local-first and instant

### 3. No swipe actions on list rows
`swipeable-row.tsx` exists in the component library but isn't used on any page. This is the primary mobile interaction pattern (Mail, Things, Spark).
- Swipe left → reveal delete button
- Swipe right → reveal primary action (complete habit, mark transaction cleared)
- Apply to: transaction ledger rows, habit cards, task cards, journal entries

### 4. No search/filter on list pages
Account register shows all transactions unfiltered. Habits page shows all habits. No way to narrow down.
- Add search bar to: /finance/accounts/[id] (transaction search), /habits, /journal, /tasks
- Simple client-side filter: text input → filter array by title/description match
- Debounce 200ms

### 5. No keyboard shortcuts
Desktop power users expect this. Things 3, Linear, Superhuman all have it.
- `Cmd+K` → command palette (navigate anywhere)
- `N` → new transaction (on finance pages)
- `Space` → toggle habit/task completion
- `Esc` → close sheet/dialog
- `Cmd+Z` → undo last action (leverages undo toast pattern)

### 6. No detail/edit screens for some entities
Transactions show in a ledger table but can't be clicked to view detail. Habits show in a grid but can't be edited in-place.
- Transaction detail: click row → sheet with all fields, edit/delete buttons
- Habit edit: long-press or tap → sheet with name, frequency, time-of-day editable
- Task detail: click card → full page with description, due date, project, notes

### 7. No date-range picker on dashboards
Finance dashboard shows "30D" hardcoded. No way to change the window.
- Add segmented control: 7D | 30D | 90D | YTD | All
- Persist selection in URL params
- Apply to: finance page (income/expense stats), activity page, sleep page

### 8. No bulk actions
Can't select multiple transactions to categorize, delete, or mark cleared in one action.
- Add checkbox column to transaction ledger
- Select all / deselect all
- Bulk actions bar appears: "Mark Cleared", "Delete Selected", "Set Category"

## Priority order
1. Pull-to-refresh (mobile feel baseline)
2. Optimistic UI on habit toggle + task move (responsiveness perception)
3. Swipe actions on list rows (mobile interaction baseline)
4. Search/filter on list pages (usability for real data volumes)
5. Transaction detail sheet (missing screen)
6. Date-range picker on dashboards (data exploration)
7. Keyboard shortcuts (power user)
8. Bulk actions (scale)
