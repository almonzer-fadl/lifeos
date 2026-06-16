# Motion Design Guide — Life OS

Reference for all animations, transitions, and micro-interactions. Uses `framer-motion` exclusively.

---

## Installation

```bash
npm install framer-motion
```

## Animation Tokens

```css
/* Spring presets */
--spring-snappy: stiffness 500, damping 30;     /* Buttons, toggles, small UI */
--spring-smooth: stiffness 300, damping 28;     /* Cards, sheets, modals */
--spring-bouncy: stiffness 250, damping 22;     /* Celebration, emphasis */
--spring-heavy: stiffness 150, damping 20;      /* Large elements, page transitions */

/* Duration presets (for non-spring where needed) */
--duration-instant: 0.1s;
--duration-fast: 0.15s;
--duration-normal: 0.2s;
--duration-slow: 0.35s;
--duration-glacial: 0.5s;

/* Easing */
--ease-out: cubic-bezier(0.25, 0.1, 0.25, 1);
--ease-in-out: cubic-bezier(0.42, 0, 0.58, 1);
--ease-spring-out: cubic-bezier(0.34, 1.56, 0.64, 1); /* Overshoot for celebration */
```

---

## 1. Page Transitions

Every page entrance/exit. Wrap content in a transition component.

```tsx
// components/ui/page-transition.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

Usage in module layout:
```tsx
// app/finance/layout.tsx
import { PageTransition } from "@/components/ui/page-transition";

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageTransition>
      {/* sub-nav, FAB, etc. */}
      {children}
    </PageTransition>
  );
}
```

### Push vs Present Transitions

- **Push** (list → detail, default): content enters from right (x: 16 → 0), exits left (x: 0 → -16)
- **Present** (sheet/modal): overlays above, previous content stays, backdrop fades in

For push navigation, use a variant:
```tsx
<motion.div
  initial={{ opacity: 0, x: 16 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: -16 }}
  transition={{ type: "spring", stiffness: 300, damping: 30 }}
/>
```

---

## 2. List Stagger

Lists animate items in sequence, 40ms apart.

```tsx
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 400, damping: 30 },
  },
};

export function StaggeredList({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={container} initial="hidden" animate="visible">
      {children}
    </motion.div>
  );
}

export function StaggeredItem({ children }: { children: React.ReactNode }) {
  return <motion.div variants={item}>{children}</motion.div>;
}
```

Usage:
```tsx
<StaggeredList>
  {transactions.map((tx) => (
    <StaggeredItem key={tx.id}>
      <TransactionRow tx={tx} />
    </StaggeredItem>
  ))}
</StaggeredList>
```

DO NOT stagger on every re-render. Only on initial load. Use `initial="hidden" animate="visible"` (not `whileInView` for lists — they'll animate every time you scroll).

---

## 3. Button Press (Spring)

Every interactive button gets press feedback.

```tsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.97 }}
  transition={{ type: "spring", stiffness: 500, damping: 25 }}
  className="..."
>
  {label}
</motion.button>
```

For FAB (more pronounced):
```tsx
whileHover={{ scale: 1.06 }}
whileTap={{ scale: 0.94 }}
transition={{ type: "spring", stiffness: 400, damping: 20 }}
```

For destructive actions (delete buttons):
```tsx
whileHover={{ scale: 1.02, backgroundColor: "rgba(255,95,109,0.14)" }}
whileTap={{ scale: 0.97 }}
```

### Button variants to use everywhere:

```tsx
// Primary action (gold)
const primaryButtonSpring = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.97 },
  transition: { type: "spring", stiffness: 500, damping: 25 },
};

// Secondary action (steel/sky)
const secondaryButtonSpring = {
  whileHover: { scale: 1.01 },
  whileTap: { scale: 0.98 },
  transition: { type: "spring", stiffness: 500, damping: 30 },
};

// Destructive (rose)
const destructiveButtonSpring = {
  whileHover: { scale: 1.01 },
  whileTap: { scale: 0.97 },
  transition: { type: "spring", stiffness: 500, damping: 25 },
};

// Toggle / chip
const toggleSpring = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: { type: "spring", stiffness: 600, damping: 28 },
};
```

---

## 4. Toggle / Switch

Animated checkbox/switch with spring physics.

```tsx
function Toggle({
  value,
  onChange,
  size = "md",
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  size?: "sm" | "md";
}) {
  const dims = size === "sm" ? { w: 36, h: 20, knob: 14, offset: 2 } : { w: 44, h: 24, knob: 18, offset: 3 };

  return (
    <motion.button
      onClick={() => onChange(!value)}
      className="relative rounded-full transition-colors"
      style={{ width: dims.w, height: dims.h }}
      animate={{
        backgroundColor: value ? "var(--emerald)" : "var(--border-strong)",
      }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="absolute rounded-full bg-white"
        style={{ width: dims.knob, height: dims.knob, top: dims.offset }}
        animate={{ left: value ? dims.w - dims.knob - dims.offset : dims.offset }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </motion.button>
  );
}
```

For habit completion (checkmark):
```tsx
<motion.button
  onClick={toggle}
  className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
  animate={{
    borderColor: completed ? "var(--emerald)" : "var(--border-strong)",
    backgroundColor: completed ? "var(--emerald)" : "transparent",
    scale: completed ? [1, 1.15, 1] : 1,
  }}
  transition={{ type: "spring", stiffness: 500, damping: 25 }}
  whileTap={{ scale: 0.9 }}
>
  {completed && (
    <motion.svg
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="w-3.5 h-3.5 text-[var(--bg)]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
    >
      <motion.path
        d="M5 13l4 4L19 7"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.25, ease: "easeOut", delay: 0.05 }}
      />
    </motion.svg>
  )}
</motion.button>
```

---

## 5. Odometer (Animated Number Counter)

For net worth, account balances, stats — any financial number.

```tsx
"use client";

import { useEffect, useState } from "react";
import { useSpring, animated } from "framer-motion";

interface OdometerProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function Odometer({ value, decimals = 0, prefix = "", suffix = "", className = "" }: OdometerProps) {
  const spring = useSpring(0, { stiffness: 80, damping: 25, mass: 0.5 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (v) => {
      setDisplay(v);
    });
    return unsubscribe;
  }, [spring]);

  const formatted = decimals > 0
    ? display.toFixed(decimals)
    : Math.round(display).toLocaleString();

  return (
    <animated.span className={className}>
      {prefix}{formatted}{suffix}
    </animated.span>
  );
}
```

Usage:
```tsx
<Odometer value={netWorth} prefix="$" className="font-mono text-5xl font-semibold text-[var(--text)]" />
<Odometer value={accountBalance} decimals={2} className="font-mono text-xl font-semibold text-[var(--emerald)]" />
```

### Odometer variants:

**Fast counter** (stats, small numbers):
```tsx
const spring = useSpring(0, { stiffness: 150, damping: 20 });
```

**Slow counter** (net worth, large numbers — feels more dramatic):
```tsx
const spring = useSpring(0, { stiffness: 60, damping: 20, mass: 0.8 });
```

**Tabular numbers** (critical for column alignment):
```tsx
className="font-mono tabular-nums"
```

---

## 6. Progress Bar

Animated width fill on scroll-into-view.

```tsx
import { motion } from "framer-motion";

function ProgressBar({ value, max, colorVar = "var(--emerald)" }: { value: number; max: number; colorVar?: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;

  return (
    <div className="h-1.5 rounded-full bg-[var(--border-light)] overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: colorVar }}
        initial={{ width: 0 }}
        whileInView={{ width: `${Math.min(pct, 100)}%` }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
      />
    </div>
  );
}
```

---

## 7. Progress Ring

SVG circle with animated draw.

```tsx
function ProgressRing({
  value,
  max,
  size = 64,
  strokeWidth = 4,
  colorVar = "var(--emerald)",
}: {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  colorVar?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circumference - pct * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border-light)"
          strokeWidth={strokeWidth}
        />
        {/* Animated foreground */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colorVar}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: offset }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-semibold text-[var(--text)]">{Math.round(pct * 100)}%</span>
      </div>
    </div>
  );
}
```

---

## 8. Sheet / Bottom Sheet

iOS-style bottom sheet with drag-to-dismiss.

```tsx
// Using vaul library for the sheet structure, framer-motion for internal animations

import { Drawer } from "vaul";

export function Sheet({
  open,
  onOpenChange,
  children,
  trigger,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  trigger?: React.ReactNode;
}) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>}
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--surface-raised)] border-t border-[var(--border)] rounded-t-2xl max-h-[85vh] focus:outline-none">
          <div className="mx-auto mt-3 mb-2 w-10 h-1 rounded-full bg-[var(--border-strong)]" />
          <div className="px-4 pb-8 pt-2 overflow-y-auto max-h-[calc(85vh-3rem)]">
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
```

Usage:
```tsx
<Sheet trigger={<button>Quick Add</button>}>
  <h3 className="text-sm font-semibold text-[var(--text)] mb-4">Add Transaction</h3>
  {/* Form content */}
  <button
    onClick={() => {
      save();
      onOpenChange?.(false);
    }}
    className="premium-action w-full mt-4"
  >
    Save
  </button>
</Sheet>
```

---

## 9. Swipeable Row

Swipe left to reveal action buttons.

```tsx
"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";

interface SwipeAction {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

export function SwipeableRow({
  children,
  actions,
  className = "",
}: {
  children: React.ReactNode;
  actions: SwipeAction[];
  className?: string;
}) {
  const [revealed, setRevealed] = useState(false);
  const constraintsRef = useRef(null);

  return (
    <div className={`relative overflow-hidden ${className}`} ref={constraintsRef}>
      {/* Action buttons behind the row */}
      <div className="absolute inset-y-0 right-0 flex z-0">
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={() => {
              action.onPress();
              setRevealed(false);
            }}
            className={`w-[72px] flex items-center justify-center text-[10px] font-semibold uppercase tracking-wide transition-colors ${
              action.destructive
                ? "bg-[rgba(255,95,109,0.12)] text-[var(--rose)] hover:bg-[rgba(255,95,109,0.2)]"
                : "bg-[rgba(115,167,216,0.08)] text-[var(--sky)] hover:bg-[rgba(115,167,216,0.14)]"
            }`}
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Sliding row */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -(actions.length * 72), right: 0 }}
        dragElastic={0.08}
        className="relative z-10 bg-[var(--bg)]"
        animate={{ x: revealed ? -(actions.length * 72) : 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        onDragEnd={(_, info) => {
          const threshold = actions.length * 36;
          setRevealed(info.offset.x < -threshold);
        }}
        style={{ touchAction: "pan-y" }}
      >
        {children}
      </motion.div>
    </div>
  );
}
```

---

## 10. Dialog / Modal

Center-screen modal with scale + fade.

```tsx
// Using @radix-ui/react-dialog

import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  trigger,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  trigger?: React.ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[var(--surface-raised)] border border-[var(--border)] rounded-xl shadow-[0_30px_90px_rgba(0,0,0,0.55)] p-6 max-w-md w-[calc(100%-2rem)] focus:outline-none"
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                {title && <Dialog.Title className="text-sm font-semibold text-[var(--text)] mb-1">{title}</Dialog.Title>}
                {description && <Dialog.Description className="text-xs text-[var(--text-tertiary)] mb-4">{description}</Dialog.Description>}
                {children}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
```

---

## 11. Card Entrance

For cards appearing on a dashboard (non-list contexts).

```tsx
<motion.div
  initial={{ opacity: 0, y: 16, scale: 0.98 }}
  whileInView={{ opacity: 1, y: 0, scale: 1 }}
  viewport={{ once: true, margin: "-50px" }}
  transition={{ type: "spring", stiffness: 300, damping: 28 }}
  className="premium-stat"
>
  {/* card content */}
</motion.div>
```

For multiple cards, stagger them:
```tsx
<div className="grid grid-cols-2 gap-2">
  {stats.map((stat, i) => (
    <motion.div
      key={stat.label}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.06, type: "spring", stiffness: 400, damping: 28 }}
      className="premium-stat"
    >
      {/* stat content */}
    </motion.div>
  ))}
</div>
```

---

## 12. Chip / Segmented Control Selection

Animated pill indicator sliding between options.

```tsx
function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  const [layout, setLayout] = useState<Record<string, DOMRect>>({});

  return (
    <div className="relative grid grid-cols-2 gap-1 rounded-lg border border-[var(--border-light)] bg-[#07090b] p-1">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          ref={(el) => {
            if (el && !layout[opt]) {
              setLayout((prev) => ({ ...prev, [opt]: el.getBoundingClientRect() }));
            }
          }}
          className={`relative z-10 rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
            value === opt ? "text-[var(--accent)]" : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
          }`}
        >
          {opt}
        </button>
      ))}
      <motion.div
        className="absolute top-1 bottom-1 left-1 rounded-md bg-[var(--accent-soft)] z-0"
        layoutId="segmented-indicator"
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        style={{ width: layout[value] ? layout[value].width - 8 : 0 }}
        animate={{ x: (() => {
          const idx = options.indexOf(value);
          // Calculate position based on layout measurements
          const items = Object.values(layout);
          if (items.length === 0) return 0;
          // Simple approach: use the index
          const totalWidth = items.reduce((s, r) => s + r.width, 0);
          const segmentWidth = totalWidth / items.length;
          return idx * segmentWidth;
        })() }}
      />
    </div>
  );
}
```

---

## 13. Skeleton Loading

Already have `.skeleton` CSS class. Animate entrance, not just shimmer.

```tsx
function SkeletonBlock({ className }: { className?: string }) {
  return (
    <motion.div
      className={`skeleton ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    />
  );
}

// Usage in loading.tsx:
function TransactionListSkeleton() {
  return (
    <div className="space-y-1">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <motion.div
          key={i}
          className="flex items-center gap-3 px-3 py-3 border-b border-[var(--border-light)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.03 }}
        >
          <div className="flex-1 space-y-2">
            <SkeletonBlock className="h-4 w-3/4" />
            <SkeletonBlock className="h-3 w-1/2" />
          </div>
          <SkeletonBlock className="h-4 w-16" />
        </motion.div>
      ))}
    </div>
  );
}
```

---

## 14. Pull-to-Refresh

Custom pull indicator for scrollable lists.

```tsx
"use client";

import { useState, useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [refreshing, setRefreshing] = useState(false);
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, 60], [0, 1]);
  const scale = useTransform(y, [0, 60], [0.5, 1]);
  const pullDistance = 80;

  async function handleDragEnd() {
    if (y.get() > pullDistance && !refreshing) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
    y.set(0); // Spring back
  }

  return {
    dragProps: { y, onDragEnd: handleDragEnd },
    indicator: (
      <motion.div
        style={{ opacity, scale }}
        className="absolute top-4 left-1/2 -translate-x-1/2"
      >
        {refreshing ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
            className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full"
          />
        ) : (
          <svg className="w-5 h-5 text-[var(--text-tertiary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path d="M12 4v12m0 0l-4-4m4 4l4-4M4 12a8 8 0 0116 0" />
          </svg>
        )}
      </motion.div>
    ),
    refreshing,
  };
}
```

---

## 15. Empty State → First Item Celebration

When user creates their first item, celebrate subtly.

```tsx
function FirstItemCelebration({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: [0.9, 1.03, 1] }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
        times: [0, 0.6, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
```

---

## 16. Haptic Feedback Hook

Simple vibration wrapper for mobile.

```tsx
"use client";

export function useHaptic() {
  const light = () => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(10);
    }
  };

  const medium = () => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([15, 20, 15]);
    }
  };

  const heavy = () => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([20, 30, 20]);
    }
  };

  const success = () => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([10, 50, 10, 50, 10]);
    }
  };

  return { light, medium, heavy, success };
}
```

Usage:
```tsx
const haptic = useHaptic();

<button onClick={() => {
  haptic.light();
  completeHabit();
}}>
  Done
</button>
```

---

## 17. Reduced Motion

Respect the OS setting.

```tsx
// lib/motion.ts
import { useReducedMotion } from "framer-motion";

export function useRespectMotion() {
  const prefersReduced = useReducedMotion();

  const spring = prefersReduced
    ? { type: "tween" as const, duration: 0 }
    : { type: "spring" as const, stiffness: 500, damping: 25 };

  const fade = prefersReduced
    ? { duration: 0 }
    : { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] as const };

  return { spring, fade, prefersReduced };
}
```

All components should use this hook. When reduced motion is preferred:
- Skip all spring animations (use duration: 0)
- Skip stagger delays
- Skip odometer counting (show final value immediately)
- Skip drag/swipe animations

---

## 18. Number Formatting (tabular-nums)

Always use `tabular-nums` for financial data alignment:

```css
.font-mono-tabular {
  font-family: var(--font-geist-mono), ui-monospace, SFMono-Regular, monospace;
  font-variant-numeric: tabular-nums;
}
```

Apply to all amount columns, date columns, and stat values.

---

## 19. DO NOT Animate

Explicit list of things never to animate:
- Form input values (as user types)
- Search query text changes
- Scroll position (no parallax)
- Background colors (change instantly)
- Items far below viewport fold
- During data refetch / `router.refresh()`
- When `prefers-reduced-motion` is enabled
- Empty state → after first render (only animate the first time)

---

## 20. Animation Checklist Per Screen

Before marking a screen "done", verify:

- [ ] Page entrance animation works (fade + slight slide)
- [ ] Page exit animation works (if navigating away)
- [ ] List items stagger on first load (not on re-render)
- [ ] Buttons have spring press (whileTap scale)
- [ ] Toggles animate between states
- [ ] Numbers count up (initial load only)
- [ ] Progress bars/rings animate on viewport enter
- [ ] Sheet/dialog has open/close animation
- [ ] Swipeable rows have drag physics
- [ ] Empty state CTA has subtle pulse
- [ ] First item created has celebration entrance
- [ ] Loading states use skeleton (not blank)
- [ ] Skeleton fades out as content fades in
- [ ] Reduced motion respected throughout
- [ ] No jank or flicker on rapid navigation
- [ ] Mobile: 60fps on target device
- [ ] Desktop: smooth at all viewport sizes
