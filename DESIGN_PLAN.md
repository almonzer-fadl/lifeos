# Design Plan

Visual design system for Life OS. Dark-only, institutional terminal aesthetic.

## Design tokens

Already defined in `app/globals.css` `:root`. Ship what's there — no new colors needed.

```
--bg, --surface, --surface-raised, --surface-hover, --surface-elite,
--surface-deep, --surface-alt
--border, --border-light, --border-strong
--text, --text-secondary, --text-tertiary
--accent (gold #c8a85b), --accent-soft, --accent-hover
--amber, --rose, --emerald, --sky, --violet, --orange, --indigo (semantic)
--shadow-card, --shadow-card-hover, --shadow-modal
--radius-sm (6), --radius-md (10), --radius-lg (14), --radius-xl (18)
```

## Typography

- Sans: Geist Sans (400–700) via `next/font/google`
- Mono: Geist Mono (400–500) for numbers, amounts, codes
- All financial figures: `font-mono tabular-nums`
- Hierarchy: 10px overlines → 13px body → 15px subhead → 20px titles
- No font sizes above 24px in content

## Spacing scale

```
4, 6, 8, 10, 12, 16, 20, 24, 28, 32, 40, 48, 56, 64
```
Use the scale. No arbitrary values.

## Component conventions

### Cards
- `premium-panel` class: `bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-4`
- Hover: add `shadow-[var(--shadow-card-hover)]` and `border-[var(--border-strong)]`
- Never use `bg-white`, `bg-gray-*`, or Tailwind color classes — override in CSS already exists

### Buttons
- Primary: `bg-[var(--accent)] text-black font-semibold rounded-lg px-4 py-2`
- Secondary: `border border-[var(--border)] text-[var(--text)] rounded-lg px-4 py-2`
- Danger: `bg-[var(--rose-soft)] text-[var(--rose)] border border-[var(--rose)]/20`
- Ghost: `text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]`
- All: `transition-all duration-150` minimum

### Inputs
- `bg-[var(--surface-deep)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm`
- Focus: `border-[var(--accent)] ring-1 ring-[var(--ring)]`
- Placeholder: `text-[var(--text-tertiary)]`
- Labels: `text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]`

### Tables
- `premium-table` class: full width, `border-collapse`
- Header: `text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] border-b border-[var(--border)]`
- Row: `border-b border-[var(--border-light)] hover:bg-[var(--surface-hover)]`
- Cell: `px-4 py-2.5 text-sm`

### Semantic colors (non-negotiable)
- Positive (gains, credits, in-range): `var(--emerald)`
- Negative (losses, debits, out-of-range): `var(--rose)`
- Warning (pending, borderline): `var(--amber)`
- Info (neutral, secondary): `var(--sky)`
- Never swap these. Red = bad, green = good, everywhere.

## Motion

Library: `framer-motion` (already installed, `lib/motion.ts` has `useRespectMotion`).

### Spring presets
```
snappy:  { stiffness: 500, damping: 30 }   // buttons, toggles
smooth:  { stiffness: 300, damping: 28 }   // cards, sheets, modals
bouncy:  { stiffness: 250, damping: 22 }   // celebration, emphasis
heavy:   { stiffness: 150, damping: 20 }   // page transitions
```

### Where to animate
- Page transitions: `AnimatePresence` with fade+slideUp on route change
- List items: stagger children by 40ms on mount
- FAB: spring scale on press, rotate 45° when sheet open
- Sheets/modals: scale from 0.95 + fade
- Odometer: `useSpring` for number roll (already built)
- Progress rings: SVG stroke-dashoffset spring

### Where NOT to animate
- Table rows, body text, static labels, dense data grids
- Any element inside `prefers-reduced-motion` (use `useRespectMotion`)

## PWA / mobile

- `viewport-fit: cover` for notched phones
- Bottom nav: `safe-area-bottom` padding
- Content: `pb-[5.25rem]` to clear bottom nav
- Touch targets: minimum 44×44px for interactive elements on mobile
- No hover-dependent UI on mobile

## What to fix now

1. Remove the Tailwind `!important` override block in globals.css — it's a brittle hack. Every `bg-white`/`bg-gray-*` class in existing components should be replaced with `premium-*` classes directly.
2. No hardcoded hex values in components — use CSS variables only.
3. No light mode escape hatches. The app is dark-only. Don't add `dark:` prefix hacks.
