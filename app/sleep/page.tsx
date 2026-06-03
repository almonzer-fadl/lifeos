import { db } from "@/lib/db";
import { SleepForm } from "@/components/modules/sleep/sleep-form";
import { format, subDays, differenceInMinutes } from "date-fns";

export const dynamic = "force-dynamic";

export default async function SleepPage() {
  const thirtyDaysAgo = subDays(new Date(), 30);

  const sessions = await db.sleepSession.findMany({
    where: { startTime: { gte: thirtyDaysAgo } },
    orderBy: { startTime: "desc" },
    take: 31,
  });

  // Stats
  const avgDuration =
    sessions.length > 0
      ? sessions.reduce(
          (sum, s) => sum + differenceInMinutes(new Date(s.endTime), new Date(s.startTime)),
          0
        ) / sessions.length / 60
      : null;

  const avgQuality =
    sessions.filter((s) => s.quality).length > 0
      ? sessions.reduce((sum, s) => sum + (s.quality || 0), 0) /
        sessions.filter((s) => s.quality).length
      : null;

  const sleepDebt = avgDuration && avgDuration < 7 ? (7 - avgDuration).toFixed(1) : null;

  // Consistency score: std dev of bedtimes
  const sortedByStart = [...sessions].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
  const consistency =
    sessions.length >= 3
      ? (() => {
          const startMinutes = sortedByStart.map(
            (s) => new Date(s.startTime).getHours() * 60 + new Date(s.startTime).getMinutes()
          );
          const avg = startMinutes.reduce((a, b) => a + b, 0) / startMinutes.length;
          const variance =
            startMinutes.reduce((sum, v) => sum + (v - avg) ** 2, 0) / startMinutes.length;
          const stdDev = Math.sqrt(variance);
          return stdDev < 30 ? "Excellent" : stdDev < 60 ? "Good" : "Irregular";
        })()
      : null;

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sleep</h1>
        <p className="text-zinc-500 text-sm mt-1">Track your sleep duration and quality</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Avg Duration" value={avgDuration ? `${avgDuration.toFixed(1)}` : "--"} unit="hours" color="text-purple-400" />
        <StatCard label="Avg Quality" value={avgQuality ? `${avgQuality.toFixed(1)}/5` : "--"} unit="" color="text-yellow-400" />
        <StatCard label="Sleep Debt" value={sleepDebt ?? "--"} unit={sleepDebt ? "hours behind" : ""} color="text-red-400" />
        <StatCard label="Consistency" value={consistency ?? "--"} unit="" color="text-blue-400" />
      </div>

      {/* Log sleep */}
      <section className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Log Sleep</h2>
        <SleepForm />
      </section>

      {/* Sleep history */}
      <section className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">History</h2>
        {sessions.length === 0 ? (
          <p className="text-zinc-600 text-sm py-4 text-center">No sleep data yet.</p>
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => {
              const durationHrs = differenceInMinutes(new Date(s.endTime), new Date(s.startTime)) / 60;
              return (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/30 border border-zinc-800/50">
                  <span className="text-2xl">{s.quality && s.quality >= 4 ? "😊" : s.quality && s.quality >= 2 ? "😐" : "😴"}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{durationHrs.toFixed(1)} hours</div>
                    <div className="text-xs text-zinc-500">
                      {format(new Date(s.startTime), "HH:mm")} → {format(new Date(s.endTime), "HH:mm")}
                      {" · "}{format(new Date(s.startTime), "EEE, MMM d")}
                      {s.quality && ` · Quality: ${s.quality}/5`}
                    </div>
                    {s.notes && <div className="text-xs text-zinc-600 mt-0.5">{s.notes}</div>}
                  </div>
                  <span className="text-[10px] text-zinc-600 uppercase">{s.source}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, unit, color }: { label: string; value: string; unit: string; color: string }) {
  return (
    <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${color}`}>{value}</div>
      <div className="text-xs text-zinc-600">{unit}</div>
    </div>
  );
}
