"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useRespectMotion } from "@/lib/motion";

interface FabProps {
  href: string;
  icon: string;
  label?: string;
}

export function Fab({ href, icon, label }: FabProps) {
  const { spring } = useRespectMotion();

  return (
    <motion.div
      className="fixed bottom-20 right-4 z-[51] lg:bottom-8 lg:right-8"
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      transition={spring}
    >
      <Link
        href={href}
        aria-label={label || "Add"}
        className="w-14 h-14 rounded-2xl bg-[var(--surface)] border border-[var(--border-strong)] shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex items-center justify-center transition-all hover:border-[var(--accent)]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-[var(--accent)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </Link>
    </motion.div>
  );
}
