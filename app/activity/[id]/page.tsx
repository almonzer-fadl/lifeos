import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { DeleteButton } from "@/components/ui/delete-button";

export const dynamic = "force-dynamic";

function fmtDuration(m: number): string {
  const h = Math.floor(m / 60);
  const min = Math.floor(m % 60);
  return h > 0 ? `${h}h ${min}m` : `${min}m`;
}

export default async function ActivityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [activity, workout] = await Promise.all([
    db.activity.findUnique({ where: { id }, include: { splits: true } }),
    db.gymWorkout.findUnique({ where: { id }, include: { sets: { include: { exercise: true }, orderBy: { setNumber: "asc" } } } }),
  ]);

  if (!activity && !workout) notFound();

  if (activity) {
    const dur = activity.endTime ? Math.round((new Date(activity.endTime).getTime() - new Date(activity.startTime).getTime()) / 60000) : null;
    const pace = activity.distance && dur ? (dur * 60) / (activity.distance / 1000) : null;

    return (
      <div className="premium-page animate-fade-in">
        <div className="premium-header animate-fade-in flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/activity" className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </Link>
              <div className="premium-kicker capitalize">{activity.type}</div>
            </div>
            <h1 className="premium-title capitalize">{activity.type} Session</h1>
            <p className="premium-subtitle">{format(new Date(activity.startTime), "EEEE, MMMM d · HH:mm")}</p>
          </div>
          <DeleteButton url={`/api/health/activity?id=${activity.id}`} itemName="activity" />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {dur != null && <Stat l="Duration" v={fmtDuration(dur)} />}
          {activity.distance && <Stat l="Distance" v={`${(activity.distance / 1000).toFixed(2)}`} u="km" />}
          {pace && <Stat l="Pace" v={`${Math.floor(pace / 60)}:${Math.floor(pace % 60).toString().padStart(2, "0")}`} u="/km" />}
          {activity.heartRateAvg && <Stat l="Heart Rate" v={`${activity.heartRateAvg}`} u="bpm" />}
          {activity.calories && <Stat l="Calories" v={`${activity.calories}`} u="kcal" />}
        </div>

        {activity.notes && (
          <section className="premium-panel animate-fade-in">
            <h2 className="premium-panel-title mb-2">Notes</h2>
            <p className="text-sm text-[var(--text-secondary)]">{activity.notes}</p>
          </section>
        )}
      </div>
    );
  }

  if (workout) {
    return (
      <div className="premium-page animate-fade-in">
        <div className="premium-header animate-fade-in flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/activity" className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </Link>
              <div className="premium-kicker">Gym</div>
            </div>
            <h1 className="premium-title">{workout.name}</h1>
            <p className="premium-subtitle">{format(new Date(workout.date), "EEEE, MMMM d")}{workout.duration ? ` · ${workout.duration} min` : ""}</p>
          </div>
          <DeleteButton url={`/api/health/workouts?id=${workout.id}`} itemName="workout" />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Stat l="Exercises" v={`${workout.sets.length}`} u="sets" />
          {workout.duration && <Stat l="Duration" v={`${workout.duration}`} u="min" />}
        </div>

        <section className="premium-panel animate-fade-in">
          <h2 className="premium-panel-title mb-3">Exercises</h2>
          <div className="space-y-2">
            {workout.sets.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-[var(--border-light)] bg-[var(--surface)] px-3 py-2.5">
                <div>
                  <div className="text-sm font-medium text-[var(--text)]">{s.exercise.name}</div>
                  <div className="text-xs text-[var(--text-tertiary)]">Set {s.setNumber}</div>
                </div>
                <span className="font-mono text-sm text-[var(--text-secondary)]">
                  {s.weight ? `${s.weight}kg` : "—"}{s.reps ? ` × ${s.reps}` : ""}{s.rpe ? ` @ RPE ${s.rpe}` : ""}
                </span>
              </div>
            ))}
          </div>
        </section>

        {workout.notes && (
          <section className="premium-panel animate-fade-in">
            <h2 className="premium-panel-title mb-2">Notes</h2>
            <p className="text-sm text-[var(--text-secondary)]">{workout.notes}</p>
          </section>
        )}
      </div>
    );
  }

  notFound();
}

function Stat({ l, v, u }: { l: string; v: string; u?: string }) {
  return (
    <div className="premium-stat">
      <div className="premium-label">{l}</div>
      <div className="premium-value">{v}</div>
      {u && <div className="mt-1 text-xs text-[var(--text-tertiary)]">{u}</div>}
    </div>
  );
}
