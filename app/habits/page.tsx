import { db } from "@/lib/db";
import { format, startOfToday } from "date-fns";

export const dynamic = "force-dynamic";

export default async function HabitsPage() {
  const habits = await db.habit.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      logs: {
        where: {
          date: { gte: new Date(new Date().setDate(new Date().getDate() - 14)) },
        },
        orderBy: { date: "desc" },
      },
    },
  });

  const today = startOfToday();

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Habits</h1>
        <p className="text-zinc-500 text-sm mt-1">Daily habits and streaks</p>
      </div>

      {/* Today's habits */}
      <section className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          Today
        </h2>
        {habits.length === 0 ? (
          <div className="text-zinc-600 text-sm py-4 text-center">
            No habits set up. Add your first habit to start tracking.
          </div>
        ) : (
          <div className="space-y-2">
            {habits.map((h) => {
              const todayLog = h.logs.find(
                (l) => format(new Date(l.date), "yyyy-MM-dd") === format(today, "yyyy-MM-dd")
              );
              const isDone = todayLog?.completed ?? false;

              // Calculate streak
              let streak = 0;
              const sortedLogs = [...h.logs]
                .filter((l) => l.completed)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
              for (let i = 0; i < sortedLogs.length; i++) {
                const logDate = format(new Date(sortedLogs[i].date), "yyyy-MM-dd");
                const expected = new Date(today);
                expected.setDate(expected.getDate() - i);
                if (logDate === format(expected, "yyyy-MM-dd")) {
                  streak++;
                } else {
                  break;
                }
              }

              return (
                <div
                  key={h.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    isDone
                      ? "bg-green-900/10 border-green-800/30"
                      : "bg-zinc-800/30 border-zinc-800/50"
                  }`}
                >
                  <button
                    className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isDone
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-zinc-600 hover:border-zinc-400"
                    }`}
                    title={isDone ? "Done" : "Mark done"}
                  >
                    {isDone && (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${isDone ? "text-green-400" : "text-zinc-200"}`}>
                      {h.name}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {h.frequency === "daily" ? "Daily" : `${h.frequencyCount}x ${h.frequency}`}
                      {h.timeOfDay && ` · ${h.timeOfDay}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-zinc-300">
                      {streak > 0 && `${streak}d`}
                    </div>
                    <div className="text-xs text-zinc-600">streak</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
