"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
  icon: string;
};

const mainNav: NavItem[] = [
  { label: "Today", href: "/", icon: "M2 12h1m4 0h10m4 0h1M4 6h1m4 0h6m4 0h1M4 18h1m4 0h6m4 0h1M6 4v16M18 4v16" },
];

const healthNav: NavItem[] = [
  { label: "T1D", href: "/t1d", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
  { label: "Activity", href: "/activity", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  { label: "Sleep", href: "/sleep", icon: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" },
  { label: "Body", href: "/body", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { label: "Nutrition", href: "/nutrition", icon: "M4 6h16M4 10h16M4 14h16M4 18h16" },
];

const lifeNav: NavItem[] = [
  { label: "Finance", href: "/finance", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { label: "Tasks", href: "/tasks", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
  { label: "Habits", href: "/habits", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { label: "Journal", href: "/journal", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
];

function SvgIcon({ d, className }: { d: string; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

function MobileTab({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link href={item.href} className={`flex h-14 flex-col items-center justify-center gap-1 min-w-0 flex-1 transition-colors ${active ? "text-[var(--accent)]" : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"}`}>
      <SvgIcon d={item.icon} className="h-5 w-5" />
      <span className="max-w-full truncate text-[10px] font-semibold uppercase leading-none tracking-wide">{item.label}</span>
    </Link>
  );
}

function SidebarItem({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
        active
          ? "border-[rgba(215,181,109,0.32)] bg-[rgba(215,181,109,0.1)] text-[var(--accent)] shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]"
          : "border-transparent text-[var(--text-tertiary)] hover:border-[var(--border)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
      }`}
    >
      <SvgIcon d={item.icon} className="h-[18px] w-[18px] shrink-0" />
      <span>{item.label}</span>
    </Link>
  );
}

const mobileTabs: NavItem[] = [
  mainNav[0],
  healthNav[0], // T1D — most critical
  healthNav[1], // Activity
  lifeNav[0],   // Finance
  { label: "More", href: "/tasks", icon: "M4 6h16M4 12h16M4 18h16" },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-dvh bg-[var(--bg)] text-[var(--text)]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex h-dvh w-64 shrink-0 flex-col gap-5 overflow-y-auto border-r border-[var(--border)] bg-[linear-gradient(180deg,#080b0f,#030405)] px-3 py-4 shadow-[22px_0_70px_rgba(0,0,0,0.28)]">
        <Link href="/" className="flex items-center gap-3 rounded-lg border border-[var(--border-light)] bg-[rgba(255,255,255,0.02)] px-3 py-2 hover:border-[var(--border)] hover:bg-[var(--surface-hover)]">
          <Image src="/lifeos-logo.png" alt="Life OS" width={28} height={28} className="rounded-md" unoptimized />
          <div className="min-w-0">
            <span className="block text-sm font-semibold tracking-tight text-[var(--text)]">Life OS</span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">Private Terminal</span>
          </div>
        </Link>

        <nav className="flex flex-col gap-0.5">
          {mainNav.map((item) => (
            <SidebarItem key={item.href} item={item} active={pathname === item.href} />
          ))}
        </nav>

        <div className="mx-3 h-px bg-[var(--border-light)]" />

        <nav className="flex flex-col gap-0.5">
          <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-tertiary)]">
            Health
          </div>
          {healthNav.map((item) => (
            <SidebarItem key={item.href} item={item} active={pathname.startsWith(item.href)} />
          ))}
        </nav>

        <div className="mx-3 h-px bg-[var(--border-light)]" />

        <nav className="flex flex-col gap-0.5">
          <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-tertiary)]">
            Life
          </div>
          {lifeNav.map((item) => (
            <SidebarItem key={item.href} item={item} active={pathname.startsWith(item.href)} />
          ))}
        </nav>

        <div className="mt-auto">
          <SidebarItem
            item={{ label: "Settings", href: "/settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" }}
            active={pathname === "/settings"}
          />
        </div>
      </aside>

      {/* Main content */}
      <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-[linear-gradient(180deg,rgba(255,255,255,0.018),transparent_9rem),radial-gradient(circle_at_top_right,rgba(220,193,122,0.065),transparent_34rem),radial-gradient(circle_at_bottom_left,rgba(115,167,216,0.035),transparent_30rem),var(--bg)]">
        <div className="mx-auto w-full max-w-7xl pb-[5.25rem] lg:pb-8">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="safe-area-bottom fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border)] bg-[rgba(3,4,5,0.94)] shadow-[0_-18px_54px_rgba(0,0,0,0.58)] backdrop-blur-xl lg:hidden">
        <div className="flex h-16 items-center justify-around px-1">
          {mobileTabs.map((item) => (
            <MobileTab
              key={item.href}
              item={item}
              active={
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href)
              }
            />
          ))}
        </div>
      </nav>
    </div>
  );
}
