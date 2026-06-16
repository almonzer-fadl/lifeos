import { db } from "@/lib/db";
import { HabitCard } from "@/components/modules/habits/habit-actions";

export const dynamic = "force-dynamic";

export default async function HabitsPage() {
  const habits = await db.habit.findMany({ orderBy: { createdAt: "asc" }, include: { logs: { where: { date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } } } });

  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in">
        <div className="premium-kicker">Discipline Engine</div>
        <h1 className="premium-title">Habits</h1>
        <p className="premium-subtitle">{habits.length} habits tracked</p>
      </div>
      <section className="premium-panel animate-fade-in">
        {habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-sm text-[var(--text-tertiary)]">No habits yet</p>
            <p className="text-xs text-[var(--text-tertiary)]">Create your first habit to start tracking.</p>
          </div>
        ) : (
          <div className="space-y-2">{habits.map((h) => <HabitCard key={h.id} habit={h as any} />)}</div>
        )}
      </section>
    </div>
  );
}
