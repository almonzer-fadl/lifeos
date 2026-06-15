"use client";

import Link from "next/link";

interface FabProps {
  href: string;
  icon: string;
  label?: string;
}

export function Fab({ href, icon, label }: FabProps) {
  return (
    <Link
      href={href}
      aria-label={label || "Add"}
      className="fixed bottom-20 right-4 z-[51] lg:bottom-8 lg:right-8 w-14 h-14 rounded-2xl bg-[linear-gradient(180deg,rgba(220,193,122,0.24),rgba(220,193,122,0.12))] border border-[rgba(220,193,122,0.4)] shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex items-center justify-center transition-all hover:scale-105 active:scale-95"
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
  );
}
