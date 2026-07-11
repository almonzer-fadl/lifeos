import Link from "next/link";
import { db } from "@/lib/db";
import { format, subDays } from "date-fns";
import { DeleteButton } from "@/components/ui/delete-button";
import { Fab } from "@/components/ui/fab";
import { PRBoard, RaceCountdown } from "@/components/modules/activity/pr-board";

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
    db.activity.findMany({ where: { startTime: { gte: sevenDaysAgo } }, orderBy: { startTime: "desc" }, take: 30, include: { splits: true } }),
    db.gymWorkout.findMany({ where: { date: { gte: sevenDaysAgo } }, orderBy: { date: "desc" }, take: 10, include: { sets: { include: { exercise: true }, orderBy: { setNumber: "asc" } } } }),
  ]);

  const totalDist = activities.filter((a) => a.type !== "other").reduce((s, a) => s + (a.distance || 0), 0);
  const totalDur = activities.reduce((s, a) => {
    if (!a.endTime) return s;
    return s + (new Date(a.endTime).getTime() - new Date(a.startTime).getTime()) / 60000;
  }, 0);

  return (
    <div className="premium-page animate-fade-in">
      <div className="premium-header animate-fade-in">
        <div className="premium-kicker">Performance Desk</div>
        <h1 className="premium-title">Activity Feed</h1>
        <p className="premium-subtitle">Running, cycling, swimming, strength — weekly load</p>
      </div>

      <RaceCountdown />
      <PRBoard />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 animate-stagger">
        <Stat l="Sessions (7d)" v={`${activities.length}`} />
        <Stat l="Distance" v={`${(totalDist / 1000).toFixed(1)}`} u="km" />
        <Stat l="Duration" v={fmtDuration(totalDur)} />
        <Stat l="Workouts" v={`${workouts.length}`} u="sessions" />
      </div>

      <Section title="Cardio" kicker="Recent" action={{ label: "Log", href: "/activity/log/cardio" }}>
        {activities.length === 0 ? (
          <Empty icon="M13 10V3L4 14h7v7l9-11h-7z" title="No activities yet" description="Log your first run, bike, or swim." action={{ label: "Log Cardio", href: "/activity/log/cardio" }} />
        ) : (
          <div className="space-y-1 animate-stagger">
            {activities.slice(0, 8).map((a) => {
              const dur = a.endTime ? Math.round((new Date(a.endTime).getTime() - new Date(a.startTime).getTime()) / 60000) : null;
              const pace = a.distance && dur ? fmtPace(a.distance, dur * 60) : null;
              return (
                <Link key={a.id} href={`/activity/${a.id}`} className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-[var(--surface-hover)]">
                  <span className="premium-chip shrink-0">{TYPE_MARK[a.type] || "TRN"}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold capitalize text-[var(--text)]">
                      {a.type}{a.distance ? ` · ${(a.distance / 1000).toFixed(1)} km` : ""}{pace ? ` · ${pace}` : ""}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)]">
                      {format(new Date(a.startTime), "EEE, MMM d · HH:mm")}{dur ? ` · ${fmtDuration(dur)}` : ""}{a.heartRateAvg ? ` · ${a.heartRateAvg} bpm` : ""}
                    </div>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              );
            })}
          </div>
        )}
      </Section>

      <Section title="Gym Workouts" kicker="Recent" action={{ label: "Log", href: "/activity/log/gym" }}>
        {workouts.length === 0 ? (
          <Empty icon="M4 6h16M4 10h16M4 14h16M4 18h16" title="No workouts yet" description="Log a gym session with exercises, sets, and reps." action={{ label: "Log Workout", href: "/activity/log/gym" }} />
        ) : (
          <div className="space-y-2 animate-stagger">
            {workouts.map((w) => (
              <Link key={w.id} href={`/activity/${w.id}`} className="block rounded-lg border border-[var(--border-light)] bg-[var(--surface-raised)] p-3 transition-all hover:border-[var(--border)]">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-[var(--text)]">{w.name}</div>
                    <div className="text-xs text-[var(--text-tertiary)]">{format(new Date(w.date), "EEE, MMM d")}{w.duration ? ` · ${w.duration} min` : ""}</div>
                  </div>
                  <span className="premium-chip">{w.sets.length} sets</span>
                </div>
                <div className="space-y-1">
                  {w.sets.slice(0, 3).map((s) => (
                    <div key={s.id} className="flex items-center justify-between rounded-md bg-[var(--surface)] px-2 py-1.5 text-xs">
                      <span className="text-[var(--text-secondary)]">{s.exercise.name}</span>
                      <span className="font-mono text-[var(--text-tertiary)]">{s.weight ? `${s.weight}kg` : ""}{s.reps ? ` × ${s.reps}` : ""}</span>
                    </div>
                  ))}
                  {w.sets.length > 3 && <div className="text-[10px] text-[var(--text-tertiary)] pl-2">+{w.sets.length - 3} more sets</div>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </Section>
      <Fab href="/activity/log" icon="M12 6v6m0 0v6m0-6h6m-6 0H6" label="Log Activity" />
    </div>
  );
}

function Stat({ l, v, u }: { l: string; v: string; u?: string }) {
  return (
    <div className="premium-stat">
      <div className="premium-label">{l}</div>
      <div className="premium-value text-[var(--amber)]">{v}</div>
      {u && <div className="mt-1 text-xs text-[var(--text-tertiary)]">{u}</div>}
    </div>
  );
}

function Section({ title, kicker, children, action }: { title: string; kicker: string; children: React.ReactNode; action?: { label: string; href: string } }) {
  return (
    <section className="premium-panel animate-fade-in">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="premium-panel-title">{title}</h2>
        <div className="flex items-center gap-2">
          <span className="premium-panel-kicker">{kicker}</span>
          {action && <Link href={action.href} className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]">{action.label} →</Link>}
        </div>
      </div>
      {children}
    </section>
  );
}

function Empty({ icon, title, description, action }: { icon: string; title: string; description: string; action?: { label: string; href: string } }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={icon} /></svg>
      </div>
      <h3 className="mb-1 text-sm font-semibold text-[var(--text)]">{title}</h3>
      <p className="mb-4 max-w-xs text-xs text-[var(--text-tertiary)]">{description}</p>
      {action && <Link href={action.href} className="premium-action text-xs">{action.label}</Link>}
    </div>
  );
}
