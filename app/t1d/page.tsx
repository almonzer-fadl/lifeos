import Link from "next/link";
import { db } from "@/lib/db";
import { T1DStats } from "@/components/modules/t1d/stats-bar";
import { GlucoseChart } from "@/components/modules/t1d/glucose-chart";
import { format, subDays } from "date-fns";

export const dynamic = "force-dynamic";

export default async function T1DPage() {
  const sevenDaysAgo = subDays(new Date(), 7);
  const readings = await db.glucoseReading.findMany({
    where: { timestamp: { gte: sevenDaysAgo } },
    orderBy: { timestamp: "desc" },
    take: 200,
  });
  const insulin = await db.insulinDose.findMany({
    where: { timestamp: { gte: sevenDaysAgo } },
    orderBy: { timestamp: "desc" },
    take: 50,
  });

  const chartReadings = [...readings].reverse().map((r) => ({ ...r, timestamp: r.timestamp.toISOString() }));
  const glucoseValues = readings.map((r) => r.value);
  const latestGlucose = readings.length > 0 ? readings[0].value : null;
  const totalInsulin = insulin.reduce((s, d) => s + d.units, 0);

  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in">
        <div className="premium-kicker">Metabolic Control</div>
        <h1 className="premium-title">Glucose Command</h1>
        <p className="premium-subtitle">Blood glucose, insulin, and time-in-range monitoring</p>
      </div>

      <T1DStats readings={glucoseValues} latestGlucose={latestGlucose} totalInsulin={totalInsulin} />
      <GlucoseChart readings={chartReadings} />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <section className="premium-panel animate-fade-in">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-[var(--text)]">Recent Readings</h2>
            <Link href="/t1d/log" className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">+ Log →</Link>
          </div>
          {readings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-[var(--text-tertiary)]">No readings yet</p>
              <Link href="/t1d/log" className="premium-action mt-3 text-xs">Log Glucose</Link>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-light)]">
              {readings.slice(0, 12).map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 px-2 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className={`h-2 w-2 rounded-full shrink-0 ${r.value < 70 ? "bg-[var(--rose)]" : r.value > 180 ? "bg-[var(--amber)]" : "bg-[var(--emerald)]"}`} />
                    <span className="text-sm font-semibold text-[var(--text)] font-mono">{r.value} <span className="text-[10px] font-normal text-[var(--text-tertiary)]">mg/dL</span></span>
                  </div>
                  <span className="text-xs text-[var(--text-tertiary)]">{format(new Date(r.timestamp), "MMM d · HH:mm")}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="premium-panel animate-fade-in">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-[var(--text)]">Recent Insulin</h2>
            <Link href="/t1d/log" className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">+ Log →</Link>
          </div>
          {insulin.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-[var(--text-tertiary)]">No insulin doses logged</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-light)]">
              {insulin.slice(0, 12).map((d) => (
                <div key={d.id} className="flex items-center justify-between gap-3 px-2 py-2.5">
                  <div>
                    <span className="text-sm font-semibold text-[var(--text)] font-mono">{d.units} <span className="text-[10px] font-normal text-[var(--text-tertiary)]">units</span></span>
                    <span className="ml-2 text-[10px] uppercase text-[var(--sky)]">{d.type}</span>
                  </div>
                  <span className="text-xs text-[var(--text-tertiary)]">{format(new Date(d.timestamp), "MMM d · HH:mm")}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
