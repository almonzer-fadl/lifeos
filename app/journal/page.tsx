import Link from "next/link";
import { db } from "@/lib/db";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, isSameDay, isWeekend } from "date-fns";

export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const month = new Date();
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const entries = await db.journalEntry.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  // Calendar events
  let events: { id: string; title: string; startTime: Date }[] = [];
  try {
    events = await db.calendarEvent.findMany({
      where: { startTime: { gte: monthStart, lte: monthEnd } },
      orderBy: { startTime: "asc" },
    });
  } catch {}

  // Tasks with due dates
  let tasks: { id: string; title: string; dueDate: Date }[] = [];
  try {
    const raw = await db.task.findMany({
      where: { dueDate: { gte: monthStart, lte: monthEnd }, status: { not: "done" } },
      orderBy: { dueDate: "asc" },
      select: { id: true, title: true, dueDate: true },
    });
    tasks = raw.filter((t): t is { id: string; title: string; dueDate: Date } => t.dueDate != null);
  } catch {}

  // Build calendar grid
  const startDay = getDay(monthStart);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const grid: (Date | null)[] = [];
  for (let i = 0; i < startDay; i++) grid.push(null);
  for (const d of days) grid.push(d);
  while (grid.length < 42) grid.push(null);

  const allEvents = [
    ...events.map(e => ({ id: e.id, title: e.title, startTime: new Date(e.startTime) })),
    ...tasks.map(t => ({ id: t.id, title: `📋 ${t.title}`, startTime: new Date(t.dueDate) })),
  ];

  // Map entries to dates for calendar dots
  const entriesByDate = new Map<string, boolean>();
  for (const e of entries) {
    entriesByDate.set(format(new Date(e.createdAt), "yyyy-MM-dd"), true);
  }

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="premium-page animate-fade-in">
      <div className="premium-header animate-fade-in flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="premium-kicker">Personal Log</div>
          <h1 className="premium-title">{format(month, "MMMM yyyy")}</h1>
          <p className="premium-subtitle">
            {entries.length} entries · {events.length} events · {tasks.length} deadlines
          </p>
        </div>
        <Link href="/journal/new" className="premium-action text-xs">
          + New Entry
        </Link>
      </div>

      {/* Mini Calendar */}
      <section className="premium-panel animate-fade-in overflow-hidden !p-3">
        <div className="grid grid-cols-7 mb-1">
          {weekDays.map(d => (
            <div key={d} className="text-center py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px">
          {grid.map((day, i) => {
            if (!day) return <div key={i} className="aspect-square" />;
            const dayStr = format(day, "yyyy-MM-dd");
            const hasEntry = entriesByDate.has(dayStr);
            const dayEvents = allEvents.filter(e => isSameDay(e.startTime, day));
            const current = isToday(day);
            const weekend = isWeekend(day);

            return (
              <Link
                key={i}
                href={hasEntry ? `/journal?date=${dayStr}` : "/journal/new"}
                className={`relative flex flex-col items-center rounded-md p-1 transition-all ${
                  current
                    ? "bg-[var(--accent-soft)] ring-1 ring-[var(--accent)]/30"
                    : weekend
                    ? "hover:bg-[var(--surface-hover)]/50"
                    : "hover:bg-[var(--surface-hover)]"
                }`}
              >
                <span className={`text-[10px] font-semibold ${
                  current ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"
                }`}>
                  {format(day, "d")}
                </span>
                <div className="flex gap-0.5 mt-0.5">
                  {hasEntry && (
                    <span className="h-1 w-1 rounded-full bg-[var(--emerald)]" title="Journal entry" />
                  )}
                  {dayEvents.length > 0 && (
                    <span className="h-1 w-1 rounded-full bg-[var(--sky)]" title={`${dayEvents.length} events`} />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Upcoming events + deadlines */}
      {allEvents.length > 0 && (
        <section className="premium-panel animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[var(--text)]">This Month</h2>
            <span className="premium-chip">{allEvents.length} items</span>
          </div>
          <div className="space-y-1 animate-stagger">
            {[...allEvents]
              .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
              .slice(0, 10)
              .map(e => (
                <div key={e.id} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-[var(--surface-hover)]">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-[var(--text)]">{e.title}</div>
                    <div className="text-xs text-[var(--text-tertiary)]">
                      {format(new Date(e.startTime), "EEE, MMM d · HH:mm")}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Journal entries */}
      <section className="premium-panel animate-fade-in">
        <h2 className="text-sm font-semibold text-[var(--text)] mb-3">Recent Entries</h2>
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <p className="text-sm text-[var(--text-tertiary)]">No journal entries yet</p>
            <Link href="/journal/new" className="premium-action mt-3 text-xs">Write First Entry</Link>
          </div>
        ) : (
          <div className="space-y-3 animate-stagger">
            {entries.map(e => (
              <Link
                key={e.id}
                href={`/journal/${e.id}`}
                className="block rounded-lg border border-[var(--border-light)] bg-[var(--surface-raised)] p-4 transition-all hover:border-[var(--border)] hover:bg-[var(--surface-hover)] hover:translate-x-[2px]"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs text-[var(--text-tertiary)]">
                    {format(new Date(e.createdAt), "EEE, MMM d · HH:mm")}
                  </span>
                  {e.mood && (
                    <span className="text-sm px-2 py-0.5 rounded-full bg-[var(--surface-hover)]">
                      {e.mood}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
                  {e.content}
                </p>
                {e.tags && (
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {e.tags.split(",").map((t: string) => (
                      <span key={t} className="premium-chip">{t.trim()}</span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
