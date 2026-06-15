import { db } from "@/lib/db";
import { ActivityForm } from "@/components/modules/activity/activity-form";
import { WorkoutLogger } from "@/components/modules/activity/workout-logger";
import { DeleteButton } from "@/components/ui/delete-button";
import { format, subDays } from "date-fns";

export const dynamic = "force-dynamic";

function fmtDuration(m: number | null): string {
  if (!m) return "--";
  const h = Math.floor(m / 60);
  const min = Math.floor(m % 60);
  return h > 0 ? `${h}h ${min}m` : `${min}m`;
}

function fmtPace(distM: number, durS: number): string {
  if (!distM || !durS) return "";
  const pace = durS / (distM / 1000);
  const min = Math.floor(pace / 60);
  const sec = Math.floor(pace % 60);
  return `${min}:${sec.toString().padStart(2, "0")} /km`;
}

const TYPE_EMOJI: Record<string, string> = { run: "🏃", swim: "🏊", bike: "🚴", walk: "🚶", hike: "🥾", other: "💪" };

export default async function ActivityPage() {
  const sevenDaysAgo = subDays(new Date(), 7);
  const [activities, workouts] = await Promise.all([
    db.activity.findMany({ where: { startTime: { gte: sevenDaysAgo } }, orderBy: { startTime: "desc" }, take: 50, include: { splits: true } }),
    db.gymWorkout.findMany({ where: { date: { gte: sevenDaysAgo } }, orderBy: { date: "desc" }, take: 20, include: { sets: { include: { exercise: true }, orderBy: { setNumber: "asc" } } } }),
  ]);

  const totalDist = activities.filter((a: { type: string; distance: number | null }) => a.type !== "other").reduce((s: number, a: { distance: number | null }) => s + (a.distance || 0), 0);
  const totalDur = activities.reduce((s: number, a: { endTime: Date | null; startTime: Date }) => {
    if (!a.endTime) return s;
    return s + (new Date(a.endTime).getTime() - new Date(a.startTime).getTime()) / 60000;
  }, 0);

  return (
    <div className="p-5 lg:p-8 space-y-5">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">Activity</h1>
        <p className="text-sm text-stone-500 mt-0.5">Running, swimming, cycling, and gym</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-stagger">
        {[{ l: "Sessions (7d)", v: `${activities.length}`, u: "" },
          { l: "Distance", v: `${(totalDist / 1000).toFixed(1)}`, u: "km" },
          { l: "Duration", v: fmtDuration(totalDur), u: "" },
          { l: "Workouts", v: `${workouts.length}`, u: "sessions" },
        ].map(s => (
          <div key={s.l} className="p-4 rounded-2xl bg-white border border-[var(--border)] shadow-[var(--shadow-card)]">
            <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">{s.l}</div>
            <div className="text-[1.75rem] font-bold tracking-tight mt-1 text-amber-600 font-mono">{s.v}</div>
            <div className="text-xs text-stone-400 mt-0.5">{s.u}</div>
          </div>
        ))}
      </div>

      <Section title="Log Cardio"><ActivityForm /></Section>
      <Section title="Log Gym Workout"><WorkoutLogger /></Section>

      {/* Recent activities */}
      <Section title="Recent">
        {activities.length === 0 ? (
          <Empty message="No activities logged this week." />
        ) : (
          <div className="space-y-2">
            {activities.map((a: { id: string; type: string; distance: number | null; endTime: Date | null; startTime: Date; heartRateAvg: number | null; notes: string | null; source: string }) => {
              const dur = a.endTime ? Math.round((new Date(a.endTime).getTime() - new Date(a.startTime).getTime()) / 60000) : null;
              const pace = a.distance && dur ? fmtPace(a.distance, dur * 60) : null;
              return (
                <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-[var(--border-light)] hover:bg-stone-100/50 transition-colors">
                  <span className="text-2xl">{TYPE_EMOJI[a.type] || "💪"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold capitalize text-stone-700">
                      {a.type}{a.distance ? ` · ${(a.distance / 1000).toFixed(1)} km` : ""}{pace ? ` · ${pace}` : ""}
                    </div>
                    <div className="text-xs text-stone-400">
                      {format(new Date(a.startTime), "EEE, MMM d · HH:mm")}
                      {dur ? ` · ${fmtDuration(dur)}` : ""}
                      {a.heartRateAvg ? ` · ${a.heartRateAvg} bpm` : ""}
                    </div>
                    {a.notes && <div className="text-xs text-stone-400 mt-0.5 truncate">{a.notes}</div>}
                  </div>
                  <span className="text-[10px] text-stone-300 uppercase font-medium">{a.source}</span>
                  <DeleteButton url={`/api/health/activity?id=${a.id}`} />
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {/* Workouts */}
      {workouts.length > 0 && (
        <Section title="Recent Workouts">
          <div className="space-y-3">
            {workouts.map((w: { id: string; name: string; date: Date; duration: number | null; notes: string | null; sets: { id: string; weight: number | null; reps: number | null; rpe: number | null; exercise: { name: string } }[] }) => (
              <div key={w.id} className="p-4 rounded-xl bg-stone-50 border border-[var(--border-light)]">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm font-semibold text-stone-700">{w.name}</div>
                    <div className="text-xs text-stone-400">{format(new Date(w.date), "EEE, MMM d")}{w.duration ? ` · ${w.duration} min` : ""}</div>
                  </div>
                  <span className="text-xs text-stone-400 font-medium">{w.sets.length} sets</span>
                </div>
                <div className="space-y-1">
                  {w.sets.map((s: { id: string; weight: number | null; reps: number | null; rpe: number | null; exercise: { name: string } }) => (
                    <div key={s.id} className="flex items-center justify-between text-sm py-1.5 px-2 rounded-lg bg-white border border-[var(--border-light)]">
                      <span className="text-stone-700 font-medium">{s.exercise.name}</span>
                      <span className="text-stone-400 text-xs font-mono">
                        {s.weight ? `${s.weight}kg` : ""}{s.reps ? ` × ${s.reps}` : ""}{s.rpe ? ` @ ${s.rpe}` : ""}
                      </span>
                    </div>
                  ))}
                </div>
                {w.notes && <div className="text-xs text-stone-400 mt-2">{w.notes}</div>}
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white border border-[var(--border)] shadow-[var(--shadow-card)] p-5 animate-fade-in">
      <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">{title}</h2>
      {children}
    </section>
  );
}

function Empty({ message }: { message: string }) {
  return <div className="py-8 text-center text-sm text-stone-400">{message}</div>;
}
