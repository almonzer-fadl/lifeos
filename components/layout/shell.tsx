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
    <Link href={item.href} className={`flex flex-col items-center gap-0.5 py-1 px-2 min-w-0 flex-1 transition-colors ${active ? "text-teal-600" : "text-stone-400 hover:text-stone-600"}`}>
      <SvgIcon d={item.icon} className="h-6 w-6" />
      <span className="text-[10px] font-medium leading-none truncate max-w-full">{item.label}</span>
    </Link>
  );
}

function SidebarItem({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
        active
          ? "bg-teal-50 text-teal-700 shadow-sm"
          : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"
      }`}
    >
      <SvgIcon d={item.icon} className={`h-5 w-5 shrink-0 ${active ? "text-teal-600" : ""}`} />
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
    <div className="flex h-dvh bg-[var(--bg)]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 border-r border-[var(--border)] bg-[var(--surface)] px-3 py-4 gap-5 overflow-y-auto">
        <Link href="/" className="flex items-center gap-2.5 px-3 py-1.5">
          <Image src="/lifeos-logo.png" alt="Life OS" width={32} height={32} className="rounded-lg" unoptimized />
          <span className="font-semibold text-base text-[var(--text)] tracking-tight">Life OS</span>
        </Link>

        <nav className="flex flex-col gap-0.5">
          {mainNav.map((item) => (
            <SidebarItem key={item.href} item={item} active={pathname === item.href} />
          ))}
        </nav>

        <div className="h-px bg-[var(--border-light)] mx-3" />

        <nav className="flex flex-col gap-0.5">
          <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-stone-400">
            Health
          </div>
          {healthNav.map((item) => (
            <SidebarItem key={item.href} item={item} active={pathname.startsWith(item.href)} />
          ))}
        </nav>

        <div className="h-px bg-[var(--border-light)] mx-3" />

        <nav className="flex flex-col gap-0.5">
          <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-stone-400">
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
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl pb-20 lg:pb-8">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-[var(--surface)] border-t border-[var(--border)] z-50 safe-area-bottom">
        <div className="flex items-center justify-around h-[3.75rem] px-1">
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
