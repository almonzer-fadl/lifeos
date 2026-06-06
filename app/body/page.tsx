import { db } from "@/lib/db";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function BodyPage() {
  const [measurements, labResults, , supplementLogs] = await Promise.all([
    db.bodyMeasurement.findMany({ orderBy: { date: "desc" }, take: 12 }),
    db.labResult.findMany({ orderBy: { date: "desc" }, take: 50 }),
    db.supplement.findMany({ orderBy: { name: "asc" } }),
    db.supplementLog.findMany({
      orderBy: { date: "desc" },
      take: 50,
      include: { supplement: true },
    }),
  ]);

  const latest = measurements[0];
  const prev = measurements[1];

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Body Metrics</h1>
        <p className="text-zinc-500 text-sm mt-1">Weight, measurements, lab results, and supplements</p>
      </div>

      {/* Latest measurements */}
      <section className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Latest Measurements</h2>
        {!latest ? (
          <div className="text-zinc-600 text-sm py-4 text-center">
            No measurements yet. Add your first entry below.
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {latest.weight && (
              <MetricTile label="Weight" value={`${latest.weight}`} unit="kg" prev={prev?.weight} />
            )}
            {latest.bodyFatPct && (
              <MetricTile label="Body Fat" value={`${latest.bodyFatPct}`} unit="%" prev={prev?.bodyFatPct} />
            )}
            {latest.waist && (
              <MetricTile label="Waist" value={`${latest.waist}`} unit="cm" prev={prev?.waist} />
            )}
            {latest.chest && (
              <MetricTile label="Chest" value={`${latest.chest}`} unit="cm" prev={prev?.chest} />
            )}
            {latest.bicepLeft && (
              <MetricTile label="Bicep L" value={`${latest.bicepLeft}`} unit="cm" prev={prev?.bicepLeft} />
            )}
            {latest.bicepRight && (
              <MetricTile label="Bicep R" value={`${latest.bicepRight}`} unit="cm" prev={prev?.bicepRight} />
            )}
            {latest.thighLeft && (
              <MetricTile label="Thigh L" value={`${latest.thighLeft}`} unit="cm" prev={prev?.thighLeft} />
            )}
            {latest.thighRight && (
              <MetricTile label="Thigh R" value={`${latest.thighRight}`} unit="cm" prev={prev?.thighRight} />
            )}
            {latest.neck && (
              <MetricTile label="Neck" value={`${latest.neck}`} unit="cm" prev={prev?.neck} />
            )}
          </div>
        )}
        {latest && (
          <div className="text-xs text-zinc-600 mt-3">
            Last updated: {format(new Date(latest.date), "MMM d, yyyy")}
            {latest.notes && ` · ${latest.notes}`}
          </div>
        )}
      </section>

      {/* Lab results */}
      <section className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Lab Results</h2>
        {labResults.length === 0 ? (
          <div className="text-zinc-600 text-sm py-4 text-center">No lab results yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-500 text-xs uppercase tracking-wider border-b border-zinc-800">
                  <th className="text-left py-2 pr-4">Date</th>
                  <th className="text-left py-2 pr-4">Test</th>
                  <th className="text-right py-2 pr-4">Value</th>
                  <th className="text-left py-2 pr-4">Ref Range</th>
                  <th className="text-left py-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {labResults.map((r) => {
                  const isOutOfRange =
                    r.refRangeLow != null &&
                    r.refRangeHigh != null &&
                    (r.value < r.refRangeLow || r.value > r.refRangeHigh);
                  return (
                    <tr key={r.id} className="border-b border-zinc-800/50">
                      <td className="py-2 pr-4 text-zinc-400 text-xs whitespace-nowrap">
                        {format(new Date(r.date), "MMM d, yy")}
                      </td>
                      <td className="py-2 pr-4">{r.testName}</td>
                      <td className={`py-2 pr-4 text-right font-semibold ${isOutOfRange ? "text-yellow-400" : "text-green-400"}`}>
                        {r.value} {r.unit}
                      </td>
                      <td className="py-2 pr-4 text-zinc-500 text-xs">
                        {r.refRangeLow != null && r.refRangeHigh != null
                          ? `${r.refRangeLow}-${r.refRangeHigh} ${r.unit}`
                          : "--"}
                      </td>
                      <td className="py-2 text-zinc-500 text-xs">{r.notes || ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Supplements */}
      <section className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Supplements</h2>
        {supplementLogs.length === 0 ? (
          <div className="text-zinc-600 text-sm py-4 text-center">No supplements logged.</div>
        ) : (
          <div className="space-y-2">
            {supplementLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30 border border-zinc-800/50">
                <div>
                  <div className="text-sm font-medium">{log.supplement.name}</div>
                  <div className="text-xs text-zinc-500">
                    {log.dosage} {log.dosageUnit} · {log.timeOfDay || "anytime"}
                  </div>
                </div>
                <div className="text-xs text-zinc-500">
                  {format(new Date(log.date), "MMM d")}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* History of measurements */}
      {measurements.length > 0 && (
        <section className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Measurement History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-500 text-xs uppercase tracking-wider border-b border-zinc-800">
                  <th className="text-left py-2 pr-3">Date</th>
                  <th className="text-right py-2 pr-3">Weight</th>
                  <th className="text-right py-2 pr-3">BF%</th>
                  <th className="text-right py-2 pr-3">Waist</th>
                  <th className="text-left py-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {measurements.map((m) => (
                  <tr key={m.id} className="border-b border-zinc-800/50">
                    <td className="py-2 pr-3 text-zinc-400 text-xs">{format(new Date(m.date), "MMM d")}</td>
                    <td className="py-2 pr-3 text-right">{m.weight ? `${m.weight} kg` : "--"}</td>
                    <td className="py-2 pr-3 text-right">{m.bodyFatPct ? `${m.bodyFatPct}%` : "--"}</td>
                    <td className="py-2 pr-3 text-right">{m.waist ? `${m.waist} cm` : "--"}</td>
                    <td className="py-2 text-zinc-500 text-xs">{m.notes || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function MetricTile({ label, value, unit, prev }: { label: string; value: string; unit: string; prev?: number | null }) {
  const delta = prev != null ? (parseFloat(value) - prev).toFixed(1) : null;
  return (
    <div className="p-3 rounded-lg bg-zinc-800/30 border border-zinc-800/50 text-center">
      <div className="text-[10px] text-zinc-500 uppercase">{label}</div>
      <div className="text-xl font-bold mt-1">
        {value}
        <span className="text-xs font-normal text-zinc-500 ml-0.5">{unit}</span>
      </div>
      {delta && (
        <div className={`text-xs mt-0.5 ${parseFloat(delta) > 0 ? "text-red-400" : parseFloat(delta) < 0 ? "text-green-400" : "text-zinc-500"}`}>
          {parseFloat(delta) > 0 ? "+" : ""}{delta}
        </div>
      )}
    </div>
  );
}
