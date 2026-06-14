"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";

interface SwipeAction {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

interface SwipeableRowProps {
  children: React.ReactNode;
  actions: SwipeAction[];
  className?: string;
}

export function SwipeableRow({
  children,
  actions,
  className = "",
}: SwipeableRowProps) {
  const [revealed, setRevealed] = useState(false);
  const constraintsRef = useRef<HTMLDivElement>(null);

  const actionsWidth = actions.length * 72;

  return (
    <div className={`relative overflow-hidden ${className}`} ref={constraintsRef}>
      <div className="absolute inset-y-0 right-0 z-0 flex">
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={() => {
              action.onPress();
              setRevealed(false);
            }}
            className={`flex w-[72px] items-center justify-center text-[10px] font-semibold uppercase tracking-wide transition-colors ${
              action.destructive
                ? "bg-[rgba(255,95,109,0.12)] text-[var(--rose)] hover:bg-[rgba(255,95,109,0.2)]"
                : "bg-[rgba(115,167,216,0.08)] text-[var(--sky)] hover:bg-[rgba(115,167,216,0.14)]"
            }`}
          >
            {action.label}
          </button>
        ))}
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -actionsWidth, right: 0 }}
        dragElastic={0.08}
        className="relative z-10 bg-[var(--bg)]"
        animate={{ x: revealed ? -actionsWidth : 0 }}
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
