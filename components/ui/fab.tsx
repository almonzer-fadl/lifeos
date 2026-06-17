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
    <div className="fixed bottom-12 right-12 z-[51] hidden lg:block">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <Link
          href={href}
          aria-label={label || "New Registry"}
          className="group relative flex h-16 items-center justify-center overflow-hidden rounded-full bg-[var(--text)] px-8 shadow-2xl transition-all hover:bg-[var(--accent)] hover:px-12 active:scale-95"
        >
          <div className="relative z-10 flex items-center gap-4 text-[var(--bg)] group-hover:text-white transition-colors duration-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 transition-transform duration-500 group-hover:rotate-90"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
            </svg>
            <span className="font-serif text-lg lowercase italic opacity-0 max-w-0 overflow-hidden transition-all duration-500 group-hover:opacity-100 group-hover:max-w-xs">
              {label || "new registry"}
            </span>
          </div>
          
          {/* Animated Background Aura */}
          <div className="absolute inset-0 z-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        </Link>
      </motion.div>
    </div>
  );
}
