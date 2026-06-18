import { db } from "@/lib/db";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function SupplementsPage() {
  const logs = await db.supplementLog.findMany({ orderBy: { date: "desc" }, take: 30, include: { supplement: true } });

  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const todayLogs = logs.filter((l) => new Date(l.date).getTime() === today.getTime());

  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in"><div className="premium-kicker">Stack</div><h1 className="premium-title">Supplements</h1><p className="premium-subtitle">{logs.length} logs · {todayLogs.length} today</p></div>

      <section className="premium-panel animate-fade-in">
        <h2 className="premium-panel-title mb-3">Today</h2>
        {todayLogs.length === 0 ? (
          <p className="py-6 text-center text-sm text-[var(--text-tertiary)]">No supplements logged today</p>
        ) : (
          <div className="space-y-1">
            {todayLogs.map((l) => (
              <div key={l.id} className="flex items-center justify-between rounded px-3 py-2.5 bg-[var(--surface)] border border-[var(--border-light)]">
                <span className="text-sm font-medium text-[var(--text)]">{l.supplement.name}</span>
                <span className="text-xs font-mono text-[var(--text-tertiary)]">{l.dosage}{l.dosageUnit ? ` ${l.dosageUnit}` : ""}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="premium-panel animate-fade-in">
        <h2 className="premium-panel-title mb-3">History</h2>
        {logs.length === 0 ? (
          <p className="py-6 text-center text-sm text-[var(--text-tertiary)]">No supplement history</p>
        ) : (
          <div className="space-y-1">
            {logs.slice(0, 20).map((l) => (
              <div key={l.id} className="flex items-center justify-between rounded px-3 py-2 hover:bg-[var(--surface-hover)]">
                <div><span className="text-sm font-medium text-[var(--text)]">{l.supplement.name}</span><span className="ml-2 text-xs text-[var(--text-tertiary)]">{l.dosage}{l.dosageUnit ? ` ${l.dosageUnit}` : ""}</span></div>
                <span className="text-xs text-[var(--text-tertiary)]">{format(new Date(l.date), "MMM d")}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
