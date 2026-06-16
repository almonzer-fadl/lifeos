"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PageTransition } from "@/components/ui/page-transition";

const subNav = [
  { label: "Diary", href: "/nutrition" },
  { label: "Meals", href: "/nutrition/meals" },
  { label: "Water", href: "/nutrition/water" },
];

export default function NutritionLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <PageTransition>
      <div className="sticky top-0 z-30 border-b border-[var(--border)] bg-[rgba(3,4,5,0.92)] backdrop-blur-xl">
        <div className="flex items-center gap-0.5 overflow-x-auto px-3 py-2 scrollbar-none sm:px-4 lg:px-6">
          {subNav.map((item) => {
            const active = item.href === "/nutrition" ? pathname === "/nutrition" : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-all ${active ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--text-tertiary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-secondary)]"}`}>
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
      {children}
    </PageTransition>
  );
}
