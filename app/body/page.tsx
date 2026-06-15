import { db } from "@/lib/db";
import { BodyMeasurementForm, LabResultForm, SupplementForm } from "@/components/modules/body/body-forms";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function BodyPage() {
  const [measurements, labResults, , supplementLogs] = await Promise.all([
    db.bodyMeasurement.findMany({ orderBy: { date: "desc" }, take: 12 }),
    db.labResult.findMany({ orderBy: { date: "desc" }, take: 50 }),
    db.supplement.findMany({ orderBy: { name: "asc" } }),
    db.supplementLog.findMany({ orderBy: { date: "desc" }, take: 50, include: { supplement: true } }),
  ]);

  const latest = measurements[0];
  const prev = measurements[1];

  return (
    <div className="p-5 lg:p-8 space-y-5">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">Body Metrics</h1>
        <p className="text-sm text-stone-500 mt-0.5">Weight, measurements, lab results, supplements</p>
      </div>

      <Section title="Add Measurement"><BodyMeasurementForm /></Section>

      <Section title="Latest Measurements">
        {!latest ? <Empty msg="No measurements yet." /> : (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {latest.weight != null && <Tile l="Weight" v={`${latest.weight}`} u="kg" prev={prev?.weight} />}
            {latest.bodyFatPct != null && <Tile l="Body Fat" v={`${latest.bodyFatPct}`} u="%" prev={prev?.bodyFatPct} />}
            {latest.waist != null && <Tile l="Waist" v={`${latest.waist}`} u="cm" prev={prev?.waist} />}
            {latest.chest != null && <Tile l="Chest" v={`${latest.chest}`} u="cm" prev={prev?.chest} />}
            {latest.bicepLeft != null && <Tile l="Bicep L" v={`${latest.bicepLeft}`} u="cm" prev={prev?.bicepLeft} />}
            {latest.bicepRight != null && <Tile l="Bicep R" v={`${latest.bicepRight}`} u="cm" prev={prev?.bicepRight} />}
            {latest.thighLeft != null && <Tile l="Thigh L" v={`${latest.thighLeft}`} u="cm" prev={prev?.thighLeft} />}
            {latest.thighRight != null && <Tile l="Thigh R" v={`${latest.thighRight}`} u="cm" prev={prev?.thighRight} />}
            {latest.neck != null && <Tile l="Neck" v={`${latest.neck}`} u="cm" prev={prev?.neck} />}
          </div>
        )}
        {latest && <div className="text-xs text-stone-400 mt-3">{format(new Date(latest.date), "MMM d, yyyy")}{latest.notes && ` · ${latest.notes}`}</div>}
      </Section>

      <Section title="Add Lab Result"><LabResultForm /></Section>

      {labResults.length > 0 && (
        <Section title="Lab Results">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-stone-400 text-xs uppercase tracking-wider border-b border-[var(--border-light)]">
                <th className="text-left py-2.5 pr-4 font-medium">Date</th><th className="text-left py-2.5 pr-4 font-medium">Test</th><th className="text-right py-2.5 pr-4 font-medium">Value</th><th className="text-left py-2.5 pr-4 font-medium">Ref Range</th><th className="text-left py-2.5 font-medium">Notes</th>
              </tr></thead>
              <tbody>
                {labResults.map((r: { id: string; date: Date; testName: string; value: number; unit: string; refRangeLow: number | null; refRangeHigh: number | null; notes: string | null }) => {
                  const out = r.refRangeLow != null && r.refRangeHigh != null && (r.value < r.refRangeLow || r.value > r.refRangeHigh);
                  return (
                    <tr key={r.id} className="border-b border-[var(--border-light)] hover:bg-stone-50/50 transition-colors">
                      <td className="py-2.5 pr-4 text-stone-400 text-xs font-mono">{format(new Date(r.date), "MMM d, yy")}</td>
                      <td className="py-2.5 pr-4 text-stone-700 font-medium">{r.testName}</td>
                      <td className={`py-2.5 pr-4 text-right font-mono font-semibold ${out ? "text-amber-600" : "text-emerald-600"}`}>{r.value} {r.unit}</td>
                      <td className="py-2.5 pr-4 text-stone-400 text-xs">{r.refRangeLow != null && r.refRangeHigh != null ? `${r.refRangeLow}–${r.refRangeHigh} ${r.unit}` : "—"}</td>
                      <td className="py-2.5 text-stone-400 text-xs">{r.notes || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      <Section title="Log Supplement"><SupplementForm /></Section>

      {supplementLogs.length > 0 && (
        <Section title="Supplements">
          <div className="space-y-1.5">
            {supplementLogs.map((log: { id: string; date: Date; dosage: number; dosageUnit: string; timeOfDay: string | null; supplement: { name: string } }) => (
              <div key={log.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-stone-50 border border-[var(--border-light)]">
                <div><div className="text-sm font-medium text-stone-700">{log.supplement.name}</div><div className="text-xs text-stone-400">{log.dosage} {log.dosageUnit} · {log.timeOfDay || "anytime"}</div></div>
                <div className="text-xs text-stone-400">{format(new Date(log.date), "MMM d")}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {measurements.length > 1 && (
        <Section title="History">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-stone-400 text-xs uppercase tracking-wider border-b border-[var(--border-light)]">
                <th className="text-left py-2.5 pr-3 font-medium">Date</th><th className="text-right py-2.5 pr-3 font-medium">Weight</th><th className="text-right py-2.5 pr-3 font-medium">BF%</th><th className="text-right py-2.5 pr-3 font-medium">Waist</th><th className="text-left py-2.5 font-medium">Notes</th>
              </tr></thead>
              <tbody>
                {measurements.map(m => (
                  <tr key={m.id} className="border-b border-[var(--border-light)] hover:bg-stone-50/50 transition-colors">
                    <td className="py-2.5 pr-3 text-stone-400 text-xs font-mono">{format(new Date(m.date), "MMM d")}</td>
                    <td className="py-2.5 pr-3 text-right text-stone-700 font-mono">{m.weight ? `${m.weight} kg` : "—"}</td>
                    <td className="py-2.5 pr-3 text-right text-stone-700 font-mono">{m.bodyFatPct ? `${m.bodyFatPct}%` : "—"}</td>
                    <td className="py-2.5 pr-3 text-right text-stone-700 font-mono">{m.waist ? `${m.waist} cm` : "—"}</td>
                    <td className="py-2.5 text-stone-400 text-xs">{m.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}
    </div>
  );
}

function Tile({ l, v, u, prev }: { l: string; v: string; u: string; prev?: number | null }) {
  const d = prev != null ? (parseFloat(v) - prev).toFixed(1) : null;
  return (
    <div className="p-3 rounded-xl bg-stone-50 border border-[var(--border-light)] text-center">
      <div className="text-[10px] text-stone-400 uppercase font-semibold">{l}</div>
      <div className="text-lg font-bold mt-0.5 font-mono text-stone-800">{v}<span className="text-xs font-normal text-stone-400 ml-0.5">{u}</span></div>
      {d && <div className={`text-[11px] font-medium mt-0.5 ${parseFloat(d) > 0 ? "text-rose-500" : parseFloat(d) < 0 ? "text-emerald-500" : "text-stone-400"}`}>{parseFloat(d) > 0 ? "+" : ""}{d}</div>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl bg-white border border-[var(--border)] shadow-[var(--shadow-card)] p-5 animate-fade-in"><h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">{title}</h2>{children}</section>;
}

function Empty({ msg }: { msg: string }) {
  return <div className="py-8 text-center text-sm text-stone-400">{msg}</div>;
}
