"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PageTransition } from "@/components/ui/page-transition";
import { Fab } from "@/components/ui/fab";

const subNav = [
  { label: "Dashboard", href: "/t1d" },
  { label: "Logbook", href: "/t1d/logbook" },
  { label: "Settings", href: "/t1d/settings" },
];

export default function T1DLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <PageTransition>
      <div className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface-deep)/0.95] backdrop-blur-xl">
        <div className="flex items-center gap-0.5 overflow-x-auto px-3 py-2 scrollbar-none sm:px-4 lg:px-6">
          {subNav.map((item) => {
            const active = item.href === "/t1d" ? pathname === "/t1d" : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-all ${active ? "bg-[var(--surface-hover)] text-[var(--text)]" : "text-[var(--text-tertiary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-secondary)]"}`}>
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
      {children}
      <Fab href="/t1d/log" icon="M12 4v16m8-8H4" label="Quick Log" />
    </PageTransition>
  );
}
