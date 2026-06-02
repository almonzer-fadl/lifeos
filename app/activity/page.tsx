import { db } from "@/lib/db";
import { ActivityForm } from "@/components/modules/activity/activity-form";
import { WorkoutLogger } from "@/components/modules/activity/workout-logger";
import { format, subDays } from "date-fns";

export const dynamic = "force-dynamic";

function formatDuration(minutes: number | null): string {
  if (!minutes) return "--";
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatPace(distanceM: number, durationS: number): string {
  if (!distanceM || !durationS) return "--";
  const paceSecondsPerKm = durationS / (distanceM / 1000);
  const min = Math.floor(paceSecondsPerKm / 60);
  const sec = Math.floor(paceSecondsPerKm % 60);
  return `${min}:${sec.toString().padStart(2, "0")} /km`;
}

export default async function ActivityPage() {
  const sevenDaysAgo = subDays(new Date(), 7);

  const [activities, workouts] = await Promise.all([
    db.activity.findMany({
      where: { startTime: { gte: sevenDaysAgo } },
      orderBy: { startTime: "desc" },
      take: 50,
      include: { splits: true },
    }),
    db.gymWorkout.findMany({
      where: { date: { gte: sevenDaysAgo } },
      orderBy: { date: "desc" },
      take: 20,
      include: {
        sets: {
          include: { exercise: true },
          orderBy: { setNumber: "asc" },
        },
      },
    }),
  ]);

  // Stats
  const totalActivities = activities.length;
  const totalDistance = activities
    .filter((a) => a.type !== "other")
    .reduce((sum, a) => sum + (a.distance || 0), 0);
  const totalDuration = activities.reduce((sum, a) => {
    if (!a.endTime) return sum;
    return sum + (new Date(a.endTime).getTime() - new Date(a.startTime).getTime()) / 60000;
  }, 0);
  const totalWorkouts = workouts.length;

  // Group gym sets by workout
  const gymActivities = workouts.flatMap((w) =>
    w.sets.map((s) => ({
      id: s.id,
      workout: w,
      exercise: s.exercise,
      weight: s.weight,
      reps: s.reps,
      rpe: s.rpe,
    }))
  );

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Activity</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Running, swimming, cycling, and gym workouts
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Activities (7d)"
          value={`${totalActivities}`}
          unit="sessions"
        />
        <StatCard
          label="Distance"
          value={`${(totalDistance / 1000).toFixed(1)}`}
          unit="km"
        />
        <StatCard
          label="Duration"
          value={formatDuration(totalDuration)}
          unit=""
        />
        <StatCard label="Workouts" value={`${totalWorkouts}`} unit="sessions" />
      </div>

      {/* Quick add: cardio */}
      <section className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          Log Cardio
        </h2>
        <ActivityForm />
      </section>

      {/* Gym workout logger */}
      <section className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          Log Gym Workout
        </h2>
        <WorkoutLogger />
      </section>

      {/* Recent activities */}
      <section className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          Recent Activities
        </h2>
        {activities.length === 0 ? (
          <p className="text-zinc-600 text-sm py-4 text-center">
            No activities logged this week. Go move!
          </p>
        ) : (
          <div className="space-y-2">
            {activities.map((a) => {
              const duration =
                a.endTime
                  ? Math.round(
                      (new Date(a.endTime).getTime() -
                        new Date(a.startTime).getTime()) /
                        60000
                    )
                  : null;
              const pace =
                a.distance && duration
                  ? formatPace(a.distance, duration * 60)
                  : null;

              return (
                <div
                  key={a.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/30 border border-zinc-800/50"
                >
                  <div className="text-2xl">
                    {a.type === "run"
                      ? "🏃"
                      : a.type === "swim"
                        ? "🏊"
                        : a.type === "bike"
                          ? "🚴"
                          : a.type === "walk"
                            ? "🚶"
                            : a.type === "hike"
                              ? "🥾"
                              : "💪"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium capitalize">
                      {a.type}
                      {a.distance &&
                        ` · ${(a.distance / 1000).toFixed(1)} km`}
                      {pace && ` · ${pace}`}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {format(new Date(a.startTime), "EEE, MMM d · HH:mm")}
                      {duration && ` · ${formatDuration(duration)}`}
                      {a.heartRateAvg && ` · ${a.heartRateAvg} bpm`}
                    </div>
                    {a.notes && (
                      <div className="text-xs text-zinc-600 mt-0.5 truncate">
                        {a.notes}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-600 uppercase">
                    {a.source}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent gym workouts */}
      {workouts.length > 0 && (
        <section className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            Recent Workouts
          </h2>
          <div className="space-y-3">
            {workouts.map((w) => (
              <div
                key={w.id}
                className="p-3 rounded-lg bg-zinc-800/30 border border-zinc-800/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-sm font-medium">{w.name}</div>
                    <div className="text-xs text-zinc-500">
                      {format(new Date(w.date), "EEE, MMM d")}
                      {w.duration && ` · ${w.duration} min`}
                    </div>
                  </div>
                  <span className="text-xs text-zinc-600">
                    {w.sets.length} sets
                  </span>
                </div>
                <div className="space-y-1">
                  {w.sets.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between text-sm py-1 border-b border-zinc-800/50 last:border-0"
                    >
                      <span className="text-zinc-300">{s.exercise.name}</span>
                      <span className="text-zinc-500 text-xs">
                        {s.weight && `${s.weight}kg`}
                        {s.reps && ` × ${s.reps}`}
                        {s.rpe && ` @ RPE ${s.rpe}`}
                      </span>
                    </div>
                  ))}
                </div>
                {w.notes && (
                  <div className="text-xs text-zinc-600 mt-2">{w.notes}</div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="text-2xl font-bold mt-1 text-green-400">{value}</div>
      <div className="text-xs text-zinc-600">{unit}</div>
    </div>
  );
}
