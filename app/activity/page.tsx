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

const TYPE_MARK: Record<string, string> = { run: "RUN", swim: "SWM", bike: "BIK", walk: "WLK", hike: "HIK", other: "TRN" };

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
    <div className="premium-page">
      <div className="premium-header animate-fade-in">
        <div className="premium-kicker">Performance Desk</div>
        <h1 className="premium-title">Activity Command</h1>
        <p className="premium-subtitle">Running, swimming, cycling, strength, and weekly load</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-stagger">
        {[{ l: "Sessions (7d)", v: `${activities.length}`, u: "" },
          { l: "Distance", v: `${(totalDist / 1000).toFixed(1)}`, u: "km" },
          { l: "Duration", v: fmtDuration(totalDur), u: "" },
          { l: "Workouts", v: `${workouts.length}`, u: "sessions" },
        ].map((s) => (
          <div key={s.l} className="premium-stat">
            <div className="premium-label">{s.l}</div>
            <div className="premium-value text-[var(--amber)]">{s.v}</div>
            <div className="mt-1 text-xs text-[var(--text-tertiary)]">{s.u}</div>
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
                <div key={a.id} className="premium-row flex items-center gap-3">
                  <span className="premium-chip shrink-0">{TYPE_MARK[a.type] || "TRN"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold capitalize text-[var(--text)]">
                      {a.type}{a.distance ? ` · ${(a.distance / 1000).toFixed(1)} km` : ""}{pace ? ` · ${pace}` : ""}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)]">
                      {format(new Date(a.startTime), "EEE, MMM d · HH:mm")}
                      {dur ? ` · ${fmtDuration(dur)}` : ""}
                      {a.heartRateAvg ? ` · ${a.heartRateAvg} bpm` : ""}
                    </div>
                    {a.notes && <div className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">{a.notes}</div>}
                  </div>
                  <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-medium">{a.source}</span>
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
              <div key={w.id} className="premium-row">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm font-semibold text-[var(--text)]">{w.name}</div>
                    <div className="text-xs text-[var(--text-tertiary)]">{format(new Date(w.date), "EEE, MMM d")}{w.duration ? ` · ${w.duration} min` : ""}</div>
                  </div>
                  <span className="premium-chip">{w.sets.length} sets</span>
                </div>
                <div className="space-y-1">
                  {w.sets.map((s: { id: string; weight: number | null; reps: number | null; rpe: number | null; exercise: { name: string } }) => (
                    <div key={s.id} className="flex items-center justify-between text-sm py-1.5 px-2 rounded-lg bg-[var(--surface)] border border-[var(--border-light)]">
                      <span className="text-[var(--text-secondary)] font-medium">{s.exercise.name}</span>
                      <span className="text-[var(--text-tertiary)] text-xs font-mono">
                        {s.weight ? `${s.weight}kg` : ""}{s.reps ? ` × ${s.reps}` : ""}{s.rpe ? ` @ ${s.rpe}` : ""}
                      </span>
                    </div>
                  ))}
                </div>
                {w.notes && <div className="text-xs text-[var(--text-tertiary)] mt-2">{w.notes}</div>}
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
    <section className="premium-panel animate-fade-in">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="premium-panel-title">{title}</h2>
        <span className="premium-panel-kicker">Active</span>
      </div>
      {children}
    </section>
  );
}

function Empty({ message }: { message: string }) {
  return <div className="premium-empty">{message}</div>;
}
