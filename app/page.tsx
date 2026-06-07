"use client";

import Link from "next/link";

function Greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return <>Good morning</>;
  if (hour < 18) return <>Good afternoon</>;
  return <>Good evening</>;
}

export default function Home() {
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="p-5 lg:p-8 space-y-6">
      <div className="animate-slide-up">
        <p className="text-sm font-medium text-stone-500">{dateStr}</p>
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 mt-0.5">
          <Greeting />
        </h1>
      </div>

      {/* Quick-actions row */}
      <div className="grid grid-cols-4 gap-2 animate-stagger">
        {[
          { label: "Glucose", href: "/t1d", color: "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100" },
          { label: "Activity", href: "/activity", color: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" },
          { label: "Sleep", href: "/sleep", color: "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100" },
          { label: "Finance", href: "/finance", color: "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100" },
        ].map((q) => (
          <Link
            key={q.label}
            href={q.href}
            className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border transition-all duration-200 ${q.color} hover:shadow-sm active:scale-95`}
          >
            <span className="text-xs font-semibold">{q.label}</span>
          </Link>
        ))}
      </div>

      {/* Main metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-stagger">
        <MetricCard
          title="Glucose"
          value="-- mg/dL"
          subtitle="No readings today"
          href="/t1d"
          color="teal"
        />
        <MetricCard
          title="Activity"
          value="-- min"
          subtitle="No activity logged"
          href="/activity"
          color="amber"
        />
        <MetricCard
          title="Sleep"
          value="-- hrs"
          subtitle="No sleep data"
          href="/sleep"
          color="indigo"
        />
        <MetricCard
          title="Nutrition"
          value="-- cal"
          subtitle="Nothing logged today"
          href="/nutrition"
          color="orange"
        />
        <MetricCard
          title="Net Worth"
          value="--"
          subtitle="No accounts set up"
          href="/finance"
          color="sky"
        />
        <MetricCard
          title="Tasks"
          value="--"
          subtitle="No pending tasks"
          href="/tasks"
          color="violet"
        />
      </div>

      {/* Upcoming / recent section */}
      <div className="rounded-2xl bg-white border border-[var(--border)] p-5 shadow-[var(--shadow-card)] animate-slide-up">
        <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-wider mb-4">
          Quick Links
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { label: "Log Glucose", href: "/t1d" },
            { label: "Start Workout", href: "/activity" },
            { label: "Log Meal", href: "/nutrition" },
            { label: "Add Transaction", href: "/finance" },
            { label: "New Task", href: "/tasks" },
            { label: "Journal Entry", href: "/journal" },
          ].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-[var(--border-light)] text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-50 hover:border-stone-300 transition-all duration-150"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500 shrink-0" />
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  href,
  color,
}: {
  title: string;
  value: string;
  subtitle: string;
  href: string;
  color: "teal" | "amber" | "indigo" | "orange" | "sky" | "violet";
}) {
  const colors: Record<string, { border: string; bg: string; text: string }> = {
    teal:   { border: "border-l-teal-500", bg: "bg-teal-50/50", text: "text-teal-700" },
    amber:  { border: "border-l-amber-500", bg: "bg-amber-50/50", text: "text-amber-700" },
    indigo: { border: "border-l-indigo-500", bg: "bg-indigo-50/50", text: "text-indigo-700" },
    orange: { border: "border-l-orange-500", bg: "bg-orange-50/50", text: "text-orange-700" },
    sky:    { border: "border-l-sky-500", bg: "bg-sky-50/50", text: "text-sky-700" },
    violet: { border: "border-l-violet-500", bg: "bg-violet-50/50", text: "text-violet-700" },
  };
  const c = colors[color];

  return (
    <Link
      href={href}
      className={`block p-5 rounded-2xl bg-white border border-[var(--border)] border-l-[3px] ${c.border} shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">{title}</span>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
          Today
        </span>
      </div>
      <div className="text-[1.75rem] font-bold tracking-tight text-stone-900">{value}</div>
      <div className="text-xs text-stone-400 mt-1.5">{subtitle}</div>
    </Link>
  );
}
