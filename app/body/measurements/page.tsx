import Link from "next/link";
import { db } from "@/lib/db";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function MeasurementsPage() {
  const measurements = await db.bodyMeasurement.findMany({ orderBy: { date: "desc" }, take: 50 });
  return (
    <div className="premium-page animate-fade-in">
      <div className="premium-header animate-fade-in"><div className="premium-kicker">History</div><h1 className="premium-title">Measurements</h1><p className="premium-subtitle">{measurements.length} records</p></div>
      <section className="premium-panel animate-fade-in">
        {measurements.length === 0 ? (
          <div className="py-10 text-center"><p className="text-sm text-[var(--text-tertiary)]">No measurements yet</p><Link href="/body/log" className="premium-action mt-3 text-xs">Log First</Link></div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-[var(--border)]"><th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Date</th><th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Weight</th><th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">BF%</th><th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Waist</th><th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Chest</th></tr></thead>
            <tbody>{measurements.map((m) => (
              <tr key={m.id} className="border-b border-[var(--border-light)] hover:bg-[var(--surface-hover)]"><td className="px-3 py-2 text-xs text-[var(--text-tertiary)]">{format(new Date(m.date), "MMM d")}</td><td className="px-3 py-2 text-sm font-mono text-[var(--text)]">{m.weight || "—"}</td><td className="px-3 py-2 text-sm font-mono text-[var(--text)]">{m.bodyFatPct || "—"}</td><td className="px-3 py-2 text-sm font-mono text-[var(--text)]">{m.waist || "—"}</td><td className="px-3 py-2 text-sm font-mono text-[var(--text)]">{m.chest || "—"}</td></tr>
            ))}</tbody></table></div>
        )}
      </section>
    </div>
  );
}
