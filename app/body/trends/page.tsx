import { db } from "@/lib/db";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function BodyTrendsPage() {
  const measurements = await db.bodyMeasurement.findMany({ orderBy: { date: "asc" }, take: 60 });
  const first = measurements[0];
  const last = measurements[measurements.length - 1];

  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in"><div className="premium-kicker">Long View</div><h1 className="premium-title">Body Trends</h1><p className="premium-subtitle">{measurements.length} measurements tracked</p></div>
      {measurements.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {last.weight != null && first.weight != null && <TrendTile label="Weight" first={first.weight} last={last.weight} unit="kg" lowerBetter />}
          {last.bodyFatPct != null && first.bodyFatPct != null && <TrendTile label="Body Fat" first={first.bodyFatPct} last={last.bodyFatPct} unit="%" lowerBetter />}
          {last.waist != null && first.waist != null && <TrendTile label="Waist" first={first.waist} last={last.waist} unit="cm" lowerBetter />}
        </div>
      ) : (
        <section className="premium-panel animate-fade-in"><p className="py-8 text-center text-sm text-[var(--text-tertiary)]">Not enough data for trends. Log more measurements.</p></section>
      )}
      <section className="premium-panel animate-fade-in">
        <h2 className="premium-panel-title mb-3">Recent Entries</h2>
        <div className="space-y-1">
          {measurements.slice(-10).reverse().map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded px-3 py-2 hover:bg-[var(--surface-hover)]">
              <span className="text-xs text-[var(--text-tertiary)]">{format(new Date(m.date), "MMM d, yyyy")}</span>
              <span className="text-sm font-mono text-[var(--text-secondary)]">
                {[m.weight && `${m.weight}kg`, m.bodyFatPct && `${m.bodyFatPct}%`, m.waist && `W${m.waist}cm`].filter(Boolean).join(" · ") || "—"}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function TrendTile({ label, first, last, unit, lowerBetter }: { label: string; first: number; last: number; unit: string; lowerBetter?: boolean }) {
  const delta = last - first;
  const isGood = lowerBetter ? delta < 0 : delta > 0;
  return (
    <div className="premium-stat">
      <div className="premium-label">{label}</div>
      <div className="premium-value">{last}<span className="text-sm font-normal text-[var(--text-tertiary)] ml-0.5">{unit}</span></div>
      <div className={`text-xs mt-1 font-mono ${delta === 0 ? "text-[var(--text-tertiary)]" : isGood ? "text-[var(--emerald)]" : "text-[var(--rose)]"}`}>{delta > 0 ? "+" : ""}{delta.toFixed(1)} since start</div>
    </div>
  );
}
