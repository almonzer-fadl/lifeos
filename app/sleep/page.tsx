import Link from "next/link";
import { db } from "@/lib/db";
import { format, subDays } from "date-fns";
import { SleepRoutineCheck } from "@/components/modules/sleep/routine-check";

export const dynamic = "force-dynamic";

export default async function SleepPage() {
  const thirtyDaysAgo = subDays(new Date(), 30);
  const sessions = await db.sleepSession.findMany({ where: { startTime: { gte: thirtyDaysAgo } }, orderBy: { startTime: "desc" }, take: 30 });

  const sessionsWithMeta = sessions.map((s) => {
    const dur = (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 60000;
    return { ...s, duration: dur, bedtime: format(new Date(s.startTime), "HH:mm"), wakeTime: format(new Date(s.endTime), "HH:mm"), date: format(new Date(s.startTime), "yyyy-MM-dd") };
  });

  const avgDuration = sessions.length > 0 ? sessionsWithMeta.reduce((s, x) => s + x.duration, 0) / sessions.length : 0;
  const avgQuality = sessions.length > 0 ? sessions.reduce((s, x) => s + (x.quality || 0), 0) / sessions.length : 0;

  return (
    <div className="premium-page animate-fade-in">
      <div className="premium-header animate-fade-in">
        <div className="premium-kicker">Recovery Metrics</div>
        <h1 className="premium-title">Sleep Command</h1>
        <p className="premium-subtitle">{sessions.length} nights tracked in the last 30 days</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 animate-stagger">
        <div className="premium-stat"><div className="premium-label">Avg Duration</div><div className="premium-value">{avgDuration > 0 ? (avgDuration / 60).toFixed(1) : "--"}<span className="text-sm font-normal text-[var(--text-tertiary)]">h</span></div></div>
        <div className="premium-stat"><div className="premium-label">Avg Quality</div><div className="premium-value">{avgQuality > 0 ? avgQuality.toFixed(1) : "--"}<span className="text-sm font-normal text-[var(--text-tertiary)]">/5</span></div></div>
        <div className="premium-stat"><div className="premium-label">Sessions</div><div className="premium-value">{sessions.length}</div><div className="text-xs text-[var(--text-tertiary)]">30 days</div>        </div>
      </div>

      <SleepRoutineCheck />

      <section className="premium-panel animate-fade-in">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-[var(--text)]">Sleep History</h2>
          <Link href="/sleep/log" className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">+ Log →</Link>
        </div>
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            </div>
            <p className="text-sm text-[var(--text-tertiary)]">No sleep sessions logged</p>
            <Link href="/sleep/log" className="premium-action mt-3 text-xs">Log First Night</Link>
          </div>
        ) : (
          <div className="space-y-1 animate-stagger">
            {sessionsWithMeta.map((s) => (
              <Link key={s.id} href={`/sleep/${s.id}`} className="flex items-center gap-4 rounded-lg px-3 py-3 transition-colors hover:bg-[var(--surface-hover)]">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-[var(--text)]">{format(new Date(s.startTime), "EEEE, MMMM d")}</div>
                  <div className="text-xs text-[var(--text-tertiary)]">{s.bedtime} → {s.wakeTime} · {Math.round(s.duration / 60)}h</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {s.quality && <span className="text-xs font-mono text-[var(--sky)]">{s.quality}/5</span>}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
