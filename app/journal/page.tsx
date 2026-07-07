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
    ...events.map(e => ({ id: e.id, title: e.title, startTime: new Date(e.startTime), type: 'event' })),
    ...tasks.map(t => ({ id: t.id, title: t.title, startTime: new Date(t.dueDate), type: 'task' })),
  ];

  // Map entries to dates for calendar dots
  const entriesByDate = new Map<string, boolean>();
  for (const e of entries) {
    entriesByDate.set(format(new Date(e.createdAt), "yyyy-MM-dd"), true);
  }

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="premium-page animate-fade-in">
      <div className="premium-header flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="premium-kicker">Personal Chronicle</div>
          <h1 className="premium-title">{format(month, "MMMM yyyy")}</h1>
          <p className="premium-subtitle italic">
            Your private log currently contains {entries.length} chronicles for this period.
          </p>
        </div>
        <Link href="/journal/new" className="premium-action text-xs">
          New Entry
        </Link>
      </div>

      {/* Mini Calendar */}
      <section className="premium-panel overflow-hidden p-8 shadow-xl">
        <div className="grid grid-cols-7 mb-6 border-b border-[var(--border-light)] pb-4">
          {weekDays.map(d => (
            <div key={d} className="text-center text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-tertiary)]">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {grid.map((day, i) => {
            if (!day) return <div key={i} className="aspect-square" />;
            const dayStr = format(day, "yyyy-MM-dd");
            const hasEntry = entriesByDate.has(dayStr);
            const dayEvents = allEvents.filter(e => isSameDay(e.startTime, day));
            const current = isToday(day);

            return (
              <Link
                key={i}
                href={hasEntry ? `/journal?date=${dayStr}` : "/journal/new"}
                className={`relative flex aspect-square flex-col items-center justify-center rounded-2xl transition-all ${
                  current
                    ? "bg-[var(--text)] text-[var(--bg)] shadow-lg"
                    : "hover:bg-[var(--bg)]"
                }`}
              >
                <span className={`text-sm font-serif ${
                  current ? "" : "text-[var(--text-secondary)]"
                }`}>
                  {format(day, "d")}
                </span>
                <div className="absolute bottom-3 flex gap-1">
                  {hasEntry && (
                    <span className={`h-1 w-1 rounded-full ${current ? "bg-[var(--bg)]" : "bg-[var(--accent)]"}`} />
                  )}
                  {dayEvents.length > 0 && (
                    <span className={`h-1 w-1 rounded-full ${current ? "bg-[var(--accent)]" : "bg-[var(--sky)]"}`} />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif text-[var(--text)]">Schedule</h2>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-tertiary)] mt-1">Upcoming items</p>
              </div>
            </div>
            <div className="space-y-1">
              {[...allEvents]
                .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
                .slice(0, 8)
                .map(e => (
                  <div key={e.id} className="group flex items-start gap-4 rounded-2xl p-4 transition-all hover:bg-white hover:shadow-md">
                    <div className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${e.type === 'task' ? "bg-[var(--accent)]" : "bg-[var(--sky)]"}`} />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-[var(--text)] leading-tight">{e.title}</div>
                      <div className="text-[9px] uppercase tracking-widest text-[var(--text-tertiary)] mt-1">
                        {format(new Date(e.startTime), "EEE, MMM d · HH:mm")}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-8">
          <section className="space-y-8">
            <div>
              <h2 className="text-xl font-serif text-[var(--text)]">Recent Manuscripts</h2>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-tertiary)] mt-1">Personal entries</p>
            </div>
            {entries.length === 0 ? (
              <div className="rounded-[40px] bg-white p-16 text-center shadow-lg">
                <div className="mb-6 flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg)] text-[var(--text-tertiary)]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm font-medium text-[var(--text-secondary)]">The chronicle is empty.</p>
                <Link href="/journal/new" className="premium-action mt-6 text-xs">Write Entry</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {entries.map(e => (
                  <Link
                    key={e.id}
                    href={`/journal/${e.id}`}
                    className="block rounded-[32px] bg-white p-8 transition-all hover:shadow-xl hover:-translate-y-1"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--accent)]">
                        {format(new Date(e.createdAt), "EEEE, MMMM d")}
                      </span>
                      {e.mood && (
                        <span className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[var(--bg)] text-[var(--text-tertiary)]">
                          {e.mood}
                        </span>
                      )}
                    </div>
                    <p className="font-serif text-lg text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
                      {e.content}
                    </p>
                    {e.tags && (
                      <div className="mt-6 flex flex-wrap gap-2">
                        {e.tags.split(",").map((t: string) => (
                          <span key={t} className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">#{t.trim()}</span>
                        ))}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

    </div>
  );
}
