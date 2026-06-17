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
  return (
    <motion.div
      className="fixed bottom-12 right-12 z-[51] hidden lg:block"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={href}
        aria-label={label || "Add"}
        className="group flex items-center gap-4 rounded-full bg-[var(--text)] px-8 py-5 text-[var(--bg)] shadow-2xl transition-all hover:bg-[var(--accent)] hover:text-white hover:-translate-y-2 active:scale-95"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 transition-transform group-hover:rotate-90"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
        <span className="font-serif text-lg lowercase italic opacity-0 max-w-0 overflow-hidden transition-all group-hover:opacity-100 group-hover:max-w-xs">
          {label || "new entry"}
        </span>
      </Link>
    </motion.div>
  );
}
