import { db } from "@/lib/db";
import { format, startOfToday } from "date-fns";

export const dynamic = "force-dynamic";

export default async function HabitsPage() {
  const habits = await db.habit.findMany({
    orderBy: { createdAt: "asc" },
    include: { logs: { where: { date: { gte: new Date(new Date().setDate(new Date().getDate() - 14)) } }, orderBy: { date: "desc" } } },
  });

  const today = startOfToday();

  return (
    <div className="p-5 lg:p-8 space-y-5">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">Habits</h1>
        <p className="text-sm text-stone-500 mt-0.5">Daily habits and streaks</p>
      </div>

      <Section title="Today">
        {habits.length === 0 ? <Empty msg="No habits set up. Add your first habit to start tracking." /> : (
          <div className="space-y-2 animate-stagger">
            {habits.map(h => {
              const todayLog = h.logs.find(l => format(new Date(l.date), "yyyy-MM-dd") === format(today, "yyyy-MM-dd"));
              const isDone = todayLog?.completed ?? false;
              let streak = 0;
              const sorted = [...h.logs].filter(l => l.completed).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
              for (let i = 0; i < sorted.length; i++) {
                const d = new Date(today); d.setDate(d.getDate() - i);
                if (format(new Date(sorted[i].date), "yyyy-MM-dd") === format(d, "yyyy-MM-dd")) streak++;
                else break;
              }
              return (
                <div key={h.id} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${isDone ? "bg-emerald-50/50 border-emerald-200" : "bg-white border-[var(--border)] shadow-[var(--shadow-card)]"}`}>
                  <div className={`h-7 w-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${isDone ? "bg-emerald-500 border-emerald-500" : "border-stone-300"}`}>
                    {isDone && <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold ${isDone ? "text-emerald-700" : "text-stone-700"}`}>{h.name}</div>
                    <div className="text-xs text-stone-400">{h.frequency === "daily" ? "Daily" : `${h.frequencyCount}x ${h.frequency}`}{h.timeOfDay ? ` · ${h.timeOfDay}` : ""}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-lg font-bold text-stone-700 font-mono">{streak > 0 ? streak : "—"}</div>
                    <div className="text-[10px] text-stone-400 font-medium">streak</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl bg-white border border-[var(--border)] shadow-[var(--shadow-card)] p-5 animate-fade-in"><h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">{title}</h2>{children}</section>;
}

function Empty({ msg }: { msg: string }) {
  return <div className="py-8 text-center text-sm text-stone-400">{msg}</div>;
}
