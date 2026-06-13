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
    <div className="premium-page">
      <div className="premium-header animate-fade-in">
        <div className="premium-kicker">Ritual Desk</div>
        <h1 className="premium-title">Habits Command</h1>
        <p className="premium-subtitle">Daily habits, streaks, and adherence</p>
      </div>

      <section className="premium-panel animate-fade-in">
        <CreateHabitForm />
      </section>

      <section className="premium-panel animate-fade-in">
        <div className="mb-3 flex items-center justify-between gap-3"><h2 className="premium-panel-title">Today</h2><span className="premium-panel-kicker">Live</span></div>
        {habits.length === 0 ? (
          <div className="premium-empty">No habits set up. Add your first habit above.</div>
        ) : (
          <div className="space-y-2 animate-stagger">
            {habits.map((h: { id: string; name: string; frequency: string; frequencyCount: number; timeOfDay: string | null; logs: { id: string; date: Date; completed: boolean }[] }) => (
              <HabitCard key={h.id} habit={h} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
