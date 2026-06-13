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
    <div className="premium-page">
      <div className="premium-header animate-slide-up">
        <p className="premium-kicker">{dateStr}</p>
        <h1 className="premium-title">
          <Greeting />
        </h1>
        <p className="premium-subtitle">Private health, wealth, and execution command center</p>
      </div>

      {/* Quick-actions row */}
      <div className="grid grid-cols-2 gap-2 animate-stagger sm:grid-cols-4">
        {[
          { label: "Glucose", href: "/t1d", color: "text-[var(--emerald)]" },
          { label: "Activity", href: "/activity", color: "text-[var(--amber)]" },
          { label: "Sleep", href: "/sleep", color: "text-[var(--indigo)]" },
          { label: "Finance", href: "/finance", color: "text-[var(--accent)]" },
        ].map((q) => (
          <Link
            key={q.label}
            href={q.href}
            className={`rounded-lg border border-[var(--border)] bg-[linear-gradient(180deg,rgba(18,25,34,0.98),rgba(8,11,14,0.98))] px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide shadow-[var(--shadow-card)] transition-all duration-200 hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] active:scale-[0.98] ${q.color}`}
          >
            {q.label}
          </Link>
        ))}
      </div>

      {/* Main metric cards */}
      <div className="grid grid-cols-1 gap-3 animate-stagger sm:grid-cols-2 xl:grid-cols-3">
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
      <div className="premium-panel animate-slide-up">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="premium-panel-title">Quick Links</h2>
          <span className="premium-panel-kicker">Launch</span>
        </div>
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
              className="flex items-center gap-2 rounded-md border border-[var(--border-light)] bg-[rgba(255,255,255,0.025)] p-2.5 text-sm font-medium text-[var(--text-secondary)] transition-all duration-150 hover:border-[var(--border)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
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
    teal:   { border: "border-l-[var(--emerald)]", bg: "bg-[var(--emerald-soft)]", text: "text-[var(--emerald)]" },
    amber:  { border: "border-l-[var(--amber)]", bg: "bg-[var(--amber-soft)]", text: "text-[var(--amber)]" },
    indigo: { border: "border-l-[var(--indigo)]", bg: "bg-[var(--indigo-soft)]", text: "text-[var(--indigo)]" },
    orange: { border: "border-l-[var(--orange)]", bg: "bg-[var(--orange-soft)]", text: "text-[var(--orange)]" },
    sky:    { border: "border-l-[var(--sky)]", bg: "bg-[var(--sky-soft)]", text: "text-[var(--sky)]" },
    violet: { border: "border-l-[var(--violet)]", bg: "bg-[var(--violet-soft)]", text: "text-[var(--violet)]" },
  };
  const c = colors[color];

  return (
    <Link
      href={href}
      className={`block rounded-lg border border-[var(--border)] border-l-[3px] bg-[linear-gradient(180deg,rgba(18,25,34,0.98),rgba(8,11,14,0.98))] p-4 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-card-hover)] active:scale-[0.98] ${c.border}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">{title}</span>
        <span className={`rounded border border-[var(--border-light)] px-2 py-0.5 text-[10px] font-semibold uppercase ${c.bg} ${c.text}`}>
          Today
        </span>
      </div>
      <div className="font-mono text-[1.65rem] font-semibold tracking-tight text-[var(--text)]">{value}</div>
      <div className="mt-1.5 text-xs text-[var(--text-tertiary)]">{subtitle}</div>
    </Link>
  );
}
