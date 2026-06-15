"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
  icon: string;
  desktopLabel?: string;
};

const mainNav: NavItem[] = [
  { label: "Today", href: "/", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", desktopLabel: "Dashboard" },
];

const healthNav: NavItem[] = [
  { label: "T1D", href: "/t1d", icon: "M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81a.48.48 0 00-.45-.32h-3.84a.48.48 0 00-.45.32l-.36 2.54c-.59.24-1.13.55-1.62.93l-2.39-.96a.48.48 0 00-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.08.21.26.32.45.32h3.84c.19 0 .37-.11.45-.32l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61L19.14 12.94zM12 15.6a3.6 3.6 0 110-7.2 3.6 3.6 0 010 7.2z" },
  { label: "Activity", href: "/activity", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  { label: "Sleep", href: "/sleep", icon: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" },
  { label: "Body", href: "/body", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { label: "Nutrition", href: "/nutrition", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
];

const otherNav: NavItem[] = [
  { label: "Finance", href: "/finance", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { label: "Tasks", href: "/tasks", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
  { label: "Habits", href: "/habits", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { label: "Journal", href: "/journal", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
];

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
        active
          ? "text-blue-400"
          : "text-zinc-500 hover:text-zinc-300"
      }`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
      </svg>
      <span className="text-[10px] leading-none">{item.label}</span>
    </Link>
  );
}

function DesktopNavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
        active
          ? "bg-blue-400/10 text-blue-400"
          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
      }`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
      </svg>
      <span>{item.desktopLabel || item.label}</span>
    </Link>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-dvh bg-zinc-950 text-zinc-100">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-zinc-800 bg-zinc-950/80 backdrop-blur-xl p-4 gap-6 overflow-y-auto">
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="h-7 w-7 rounded-lg bg-blue-500 flex items-center justify-center text-xs font-bold text-white">
            OS
          </div>
          <span className="font-semibold text-sm">Life OS</span>
        </div>

        <nav className="flex flex-col gap-0.5">
          <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-600">
            Main
          </div>
          {mainNav.map((item) => (
            <DesktopNavLink key={item.href} item={item} active={pathname === item.href} />
          ))}
        </nav>

        <nav className="flex flex-col gap-0.5">
          <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-600">
            Health
          </div>
          {healthNav.map((item) => (
            <DesktopNavLink key={item.href} item={item} active={pathname.startsWith(item.href)} />
          ))}
        </nav>

        <nav className="flex flex-col gap-0.5">
          <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-600">
            Life
          </div>
          {otherNav.map((item) => (
            <DesktopNavLink key={item.href} item={item} active={pathname.startsWith(item.href)} />
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-zinc-800">
          <DesktopNavLink
            item={{ label: "Settings", href: "/settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z", desktopLabel: "Settings" }}
            active={pathname === "/settings"}
          />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-800 z-50">
        <div className="flex items-center justify-around h-14 px-1">
          {[...mainNav, ...healthNav.slice(0, 2), ...otherNav.slice(0, 1), {
            label: "More",
            href: "/settings",
            icon: "M4 6h16M4 12h16M4 18h16",
          } as NavItem].map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
              }
            />
          ))}
        </div>
      </nav>
    </div>
  );
}
