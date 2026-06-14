"use client";

import { useEffect, useState } from "react";
import { useSpring, motion } from "framer-motion";

interface OdometerProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function Odometer({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
}: OdometerProps) {
  const spring = useSpring(0, { stiffness: 80, damping: 25, mass: 0.5 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (latest) => {
      setDisplay(latest);
    });
    return unsubscribe;
  }, [spring]);

  const formatted =
    decimals > 0
      ? display.toFixed(decimals)
      : Math.round(display).toLocaleString();

  return (
    <motion.span className={className}>
      {prefix}
      {formatted}
      {suffix}
    </motion.span>
  );
}
