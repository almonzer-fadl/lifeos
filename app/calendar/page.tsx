import { db } from "@/lib/db";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, isSameDay } from "date-fns";

export const dynamic = "force-dynamic";

// Day cell component
function DayCell({ day, events }: { day: Date; events: { title: string; startTime: Date; id: string }[] }) {
  const isCurrentDay = isToday(day);
  const dayEvents = events.filter((e) => isSameDay(new Date(e.startTime), day));

  return (
    <div
      className={`min-h-[72px] rounded-lg border p-2 transition-colors ${
        isCurrentDay
          ? "border-[var(--accent)] bg-[var(--accent-soft)]"
          : "border-[var(--border-light)] hover:border-[var(--border)] hover:bg-[var(--surface-hover)]"
      }`}
    >
      <div
        className={`text-[10px] font-semibold mb-1 ${
          isCurrentDay
            ? "text-[var(--accent)]"
            : "text-[var(--text-tertiary)]"
        }`}
      >
        {format(day, "d")}
      </div>
      <div className="space-y-0.5">
        {dayEvents.slice(0, 3).map((event) => (
          <div
            key={event.id}
            className="truncate rounded bg-[var(--surface-hover)] px-1.5 py-0.5 text-[9px] font-medium text-[var(--text-secondary)]"
            title={event.title}
          >
            {format(new Date(event.startTime), "HH:mm")} {event.title}
          </div>
        ))}
        {dayEvents.length > 3 && (
          <div className="text-[9px] text-[var(--text-tertiary)] pl-1.5">
            +{dayEvents.length - 3} more
          </div>
        )}
      </div>
    </div>
  );
}

export default async function CalendarPage() {
  const month = new Date();
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);

  // Build 42-day grid (6 weeks)
  const startDay = getDay(monthStart);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const grid: (Date | null)[] = [];
  for (let i = 0; i < startDay; i++) grid.push(null); // padding
  for (const d of days) grid.push(d);
  while (grid.length < 42) grid.push(null);

  // Fetch events
  let events: { id: string; title: string; startTime: Date; endTime: Date }[] = [];
  try {
    events = await db.calendarEvent.findMany({
      where: {
        startTime: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      orderBy: { startTime: "asc" },
    });
  } catch {
    // No events or table doesn't exist yet
  }

  // For demo: also show tasks with due dates
  let tasks: { id: string; title: string; dueDate: Date }[] = [];
  try {
    tasks = (await db.task.findMany({
      where: {
        dueDate: {
          gte: monthStart,
          lte: monthEnd,
        },
        status: { not: "done" },
      },
      orderBy: { dueDate: "asc" },
      select: { id: true, title: true, dueDate: true },
    })).filter((t): t is { id: string; title: string; dueDate: Date } => t.dueDate != null);
  } catch {
    // No tasks
  }

  const allEvents = [
    ...events.map((e) => ({ id: e.id, title: e.title, startTime: new Date(e.startTime) })),
    ...tasks.map((t) => ({ id: t.id, title: `📋 ${t.title}`, startTime: new Date(t.dueDate) })),
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="premium-page animate-fade-in">
      <div className="premium-header animate-fade-in flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="premium-kicker">Time Command</div>
          <h1 className="premium-title">{format(month, "MMMM yyyy")}</h1>
          <p className="premium-subtitle">
            {events.length} events · {tasks.length} tasks due
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-right">
          <div className="rounded-md border border-[var(--border)] bg-[rgba(255,255,255,0.025)] px-2 py-1.5">
            <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Source</div>
            <div className="font-mono text-xs font-semibold text-[var(--text)]">{events.length > 0 ? "CalDAV" : "Local"}</div>
          </div>
          <div className="rounded-md border border-[var(--border)] bg-[rgba(255,255,255,0.025)] px-2 py-1.5">
            <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Tasks</div>
            <div className="font-mono text-xs font-semibold text-[var(--amber)]">{tasks.length}</div>
          </div>
          <div className="rounded-md border border-[var(--border)] bg-[rgba(255,255,255,0.025)] px-2 py-1.5">
            <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Status</div>
            <div className="font-mono text-xs font-semibold text-[var(--emerald)]">Active</div>
          </div>
        </div>
      </div>

      {/* Month grid */}
      <section className="premium-panel animate-fade-in">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-1">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1 animate-stagger">
          {grid.map((day, i) => (
            <DayCell
              key={i}
              day={day || new Date(0)}
              events={day ? allEvents : []}
            />
          ))}
        </div>
      </section>

      {/* Upcoming events list */}
      <section className="premium-panel animate-fade-in">
        <h2 className="text-sm font-semibold text-[var(--text)] mb-3">Upcoming Events</h2>
        {allEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-[var(--text-tertiary)]">No events this month</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              Sync your iCloud calendar or add tasks with due dates.
            </p>
          </div>
        ) : (
          <div className="space-y-1 animate-stagger">
            {[...allEvents]
              .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
              .slice(0, 15)
              .map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-[var(--surface-hover)]"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-[var(--text)]">
                      {event.title}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)]">
                      {format(new Date(event.startTime), "EEE, MMM d · HH:mm")}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>

      {/* CalDAV sync section */}
      <section className="premium-panel animate-fade-in">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text)]">Calendar Sync</h2>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              Connect your iCloud calendar via CalDAV to sync events automatically.
            </p>
          </div>
          <form action="/api/calendar/sync" method="POST">
            <button
              type="submit"
              className="premium-action text-xs"
            >
              Sync Now
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
