# Design — 6/10 → 10/10

## Current state
- Dark-only premium terminal aesthetic, consistent across the app
- Design tokens as CSS custom properties in `:root`
- `premium-*` class naming convention (panel, stat, row, chip, action, table, etc.)
- Geist Sans + Geist Mono via `next/font`
- Custom scrollbar, selection colors, input/select/textarea base styles
- Motion respects `prefers-reduced-motion`
- Spring presets in `lib/motion.ts`, FAB + PageTransition use them
- Semantic color system: emerald=positive, rose=negative, amber=warning, sky=info

## What blocks 10/10

### 1. No micro-interactions on interactive elements
Buttons have `active:scale-[0.97]` which is CSS, not spring physics. Cards and rows have no hover transition depth.
- Add `motion.button` with `whileTap={{ scale: 0.97 }}` spring to all primary buttons
- Card hover: subtle `translateY(-1px)` + shadow increase via framer-motion
- Row hover: background transition with 150ms duration (already have this via CSS)
- Toggle/checkbox: spring bounce on state change

### 2. No staggered list entry animations
The `animate-stagger` CSS class exists but is barely used. Lists should cascade in with 40ms delays.
- Apply `animate-stagger` to every list: transaction ledger, habit grid, task kanban columns, journal timeline, activity feed
- Animate each row: `initial={{ opacity: 0, y: 8 }}` → `animate={{ opacity: 1, y: 0 }}`
- Works with the existing CSS stagger — just add `className="animate-stagger"` to the container

### 3. No celebration/confirmation animations
Creating something feels anti-climactic — just a toast. Premium apps make you feel good about completing actions.
- Habit completion: checkmark spring-bounces in
- Task moving to "done": card pulses emerald and fades slightly
- Goal reaching 100%: progress bar pulses gold
- Transaction added: the amount in the register animates in (odometer roll)

### 4. No skeleton-to-content transition
Skeletons appear then disappear abruptly. There's no morph from skeleton to real content.
- Wrap skeleton + content in `AnimatePresence`
- Skeleton exits with `opacity: 0, scale: 0.98`
- Content enters with `opacity: 0 → 1, y: 4 → 0`
- Creates a seamless "data arriving" feel

### 5. No number-counting animation for stats
The `odometer.tsx` component exists but is only used on the net worth number. Every stat should animate in.
- Apply `Odometer` to all stat values on dashboards: income, expenses, account balances, glucose avg, sleep hours, habit streaks
- Duration: 600ms for small numbers, 1000ms for large numbers
- Spring-based easing via `useSpring`

### 6. No chart animations
The T1D glucose chart uses recharts but has no entry animation. Health dashboards feel static.
- Animate chart lines drawing in (stroke-dasharray trick or recharts animation prop)
- Bar charts: bars grow from 0 height with stagger
- This applies to: glucose chart (T1D), any future spending/trend charts

### 7. Inconsistent border-radius usage
Some cards use `rounded-lg` (10px), some use `rounded-md` (6px), forms use no radius. Radii should be systematic.
- `var(--radius-sm)` = 6px: inputs, buttons, chips
- `var(--radius-md)` = 10px: cards, panels, stat tiles
- `var(--radius-lg)` = 14px: sheets, modals, FAB
- Audit every component — replace hardcoded `rounded-*` with the token value

### 8. No dark mode persistence or flash prevention
The app is dark-only but there's no loading state that matches. On slow connections, there's a white flash before CSS loads.
- Add `<script>` in `<head>` that sets `document.documentElement.style.background = '#080a0c'` before any render
- Or use `color-scheme: dark` meta tag (already have theme-color meta, just add this)
- This is 1 line: `<meta name="color-scheme" content="dark" />`

## Priority order
1. Staggered list animations (biggest visual impact, mostly adding className)
2. Micro-interactions on buttons/cards (responsiveness feel)
3. Skeleton-to-content transition (loading polish)
4. Odometer on all stats (dashboard polish)
5. Celebration animations on completion actions (emotional design)
6. Dark mode flash prevention (1 line fix)
7. Consistent border-radius audit (systematic polish)
8. Chart animations (nice-to-have)
