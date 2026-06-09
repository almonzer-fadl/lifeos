import { db } from "@/lib/db";
import { CreateHabitForm, HabitCard } from "@/components/modules/habits/habit-actions";

export const dynamic = "force-dynamic";

export default async function HabitsPage() {
  const habits = await db.habit.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      logs: {
        where: { date: { gte: new Date(new Date().setDate(new Date().getDate() - 14)) } },
        orderBy: { date: "desc" },
      },
    },
  });

  return (
    <div className="p-5 lg:p-8 space-y-5">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">Habits</h1>
        <p className="text-sm text-stone-500 mt-0.5">Daily habits and streaks</p>
      </div>

      <section className="rounded-2xl bg-white border border-[var(--border)] shadow-[var(--shadow-card)] p-4 animate-fade-in">
        <CreateHabitForm />
      </section>

      <section className="rounded-2xl bg-white border border-[var(--border)] shadow-[var(--shadow-card)] p-5 animate-fade-in">
        <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">Today</h2>
        {habits.length === 0 ? (
          <div className="py-8 text-center text-sm text-stone-400">No habits set up. Add your first habit above.</div>
        ) : (
          <div className="space-y-2 animate-stagger">
            {habits.map(h => (
              <HabitCard key={h.id} habit={h} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
