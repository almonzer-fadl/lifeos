import Link from "next/link";
import { db } from "@/lib/db";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function LogbookPage() {
  const readings = await db.glucoseReading.findMany({ orderBy: { timestamp: "desc" }, take: 100 });
  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in">
        <div className="premium-kicker">Complete History</div>
        <h1 className="premium-title">Logbook</h1>
        <p className="premium-subtitle">{readings.length} readings</p>
      </div>
      <section className="premium-panel animate-fade-in">
        {readings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-sm text-[var(--text-tertiary)]">No readings logged yet</p>
            <Link href="/t1d/log" className="premium-action mt-3 text-xs">Log First Reading</Link>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-light)] animate-stagger">
            {readings.map((r) => (
              <Link key={r.id} href={`/t1d/logbook/${r.id}`} className="flex items-center justify-between gap-3 px-3 py-3 transition-colors hover:bg-[var(--surface-hover)]">
                <div className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${r.value < 70 ? "bg-[var(--rose)]" : r.value > 180 ? "bg-[var(--amber)]" : "bg-[var(--emerald)]"}`} />
                  <div>
                    <span className="text-sm font-semibold text-[var(--text)] font-mono">{r.value} mg/dL</span>
                    {r.notes && <div className="text-xs text-[var(--text-tertiary)] truncate max-w-[200px]">{r.notes}</div>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[var(--text-tertiary)]">{format(new Date(r.timestamp), "MMM d")}</div>
                  <div className="text-[10px] text-[var(--text-tertiary)]">{format(new Date(r.timestamp), "HH:mm")}</div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
