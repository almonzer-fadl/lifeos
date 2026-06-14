"use client";

import { useReducedMotion } from "framer-motion";

export function useRespectMotion() {
  const prefersReduced = useReducedMotion();

  const spring = prefersReduced
    ? ({ type: "tween" as const, duration: 0 })
    : ({ type: "spring" as const, stiffness: 500, damping: 25 });

  const fade = prefersReduced
    ? ({ duration: 0 })
    : ({ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] as const });

  const stagger = prefersReduced ? 0 : 0.04;

  return { spring, fade, stagger, prefersReduced };
}
