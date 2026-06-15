"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PageTransition } from "@/components/ui/page-transition";
import { Fab } from "@/components/ui/fab";

const subNav = [
  { label: "Dashboard", href: "/finance" },
  { label: "Accounts", href: "/finance/accounts" },
  { label: "Assets", href: "/finance/assets" },
  { label: "Goals", href: "/finance/goals" },
  { label: "Bills", href: "/finance/recurring" },
];

const fabMap: Record<string, { href: string; icon: string; label: string }> = {
  "/finance": { href: "/finance/accounts", icon: "M12 4v16m8-8H4", label: "Add" },
  "/finance/accounts": { href: "/finance/accounts/new", icon: "M12 4v16m8-8H4", label: "Add Account" },
  "/finance/assets": { href: "/finance/assets/new", icon: "M12 4v16m8-8H4", label: "Add Asset" },
  "/finance/goals": { href: "/finance/goals/new", icon: "M12 4v16m8-8H4", label: "Set Goal" },
  "/finance/recurring": { href: "/finance/recurring/new", icon: "M12 4v16m8-8H4", label: "Add Bill" },
};

function getFab(pathname: string) {
  for (const [prefix, fab] of Object.entries(fabMap)) {
    if (pathname === prefix || (prefix !== "/finance" && pathname.startsWith(prefix))) {
      return fab;
    }
  }
  return fabMap["/finance"];
}

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const fab = getFab(pathname);

  return (
    <PageTransition>
      <div className="sticky top-0 z-30 border-b border-[var(--border)] bg-[rgba(3,4,5,0.92)] backdrop-blur-xl">
        <div className="flex items-center gap-0.5 overflow-x-auto px-3 py-2 scrollbar-none sm:px-4 lg:px-6">
          {subNav.map((item) => {
            const active =
              item.href === "/finance"
                ? pathname === "/finance"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-all ${
                  active
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "text-[var(--text-tertiary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-secondary)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
      {children}
      <Fab href={fab.href} icon={fab.icon} label={fab.label} />
    </PageTransition>
  );
}
