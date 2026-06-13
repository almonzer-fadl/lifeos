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
    <div className="premium-page">
      <div className="premium-header animate-fade-in">
        <div className="premium-kicker">Biometrics Desk</div>
        <h1 className="premium-title">Body Command</h1>
        <p className="premium-subtitle">Weight, measurements, lab results, and supplements</p>
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
        {latest && <div className="text-xs text-[var(--text-tertiary)] mt-3">{format(new Date(latest.date), "MMM d, yyyy")}{latest.notes && ` · ${latest.notes}`}</div>}
      </Section>

      <Section title="Add Lab Result"><LabResultForm /></Section>

      {labResults.length > 0 && (
        <Section title="Lab Results">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-[var(--text-tertiary)] text-xs uppercase tracking-wider border-b border-[var(--border-light)]">
                <th className="text-left py-2.5 pr-4 font-medium">Date</th><th className="text-left py-2.5 pr-4 font-medium">Test</th><th className="text-right py-2.5 pr-4 font-medium">Value</th><th className="text-left py-2.5 pr-4 font-medium">Ref Range</th><th className="text-left py-2.5 font-medium">Notes</th>
              </tr></thead>
              <tbody>
                {labResults.map((r: { id: string; date: Date; testName: string; value: number; unit: string; refRangeLow: number | null; refRangeHigh: number | null; notes: string | null }) => {
                  const out = r.refRangeLow != null && r.refRangeHigh != null && (r.value < r.refRangeLow || r.value > r.refRangeHigh);
                  return (
                    <tr key={r.id} className="border-b border-[var(--border-light)] hover:bg-[var(--surface-hover)] transition-colors">
                      <td className="py-2.5 pr-4 text-[var(--text-tertiary)] text-xs font-mono">{format(new Date(r.date), "MMM d, yy")}</td>
                      <td className="py-2.5 pr-4 text-[var(--text)] font-medium">{r.testName}</td>
                      <td className={`py-2.5 pr-4 text-right font-mono font-semibold ${out ? "text-[var(--amber)]" : "text-[var(--emerald)]"}`}>{r.value} {r.unit}</td>
                      <td className="py-2.5 pr-4 text-[var(--text-tertiary)] text-xs">{r.refRangeLow != null && r.refRangeHigh != null ? `${r.refRangeLow}–${r.refRangeHigh} ${r.unit}` : "—"}</td>
                      <td className="py-2.5 text-[var(--text-tertiary)] text-xs">{r.notes || "—"}</td>
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
              <div key={log.id} className="premium-row flex items-center justify-between gap-3">
                <div><div className="text-sm font-medium text-[var(--text)]">{log.supplement.name}</div><div className="text-xs text-[var(--text-tertiary)]">{log.dosage} {log.dosageUnit} · {log.timeOfDay || "anytime"}</div></div>
                <div className="text-xs text-[var(--text-tertiary)]">{format(new Date(log.date), "MMM d")}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {measurements.length > 1 && (
        <Section title="History">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-[var(--text-tertiary)] text-xs uppercase tracking-wider border-b border-[var(--border-light)]">
                <th className="text-left py-2.5 pr-3 font-medium">Date</th><th className="text-right py-2.5 pr-3 font-medium">Weight</th><th className="text-right py-2.5 pr-3 font-medium">BF%</th><th className="text-right py-2.5 pr-3 font-medium">Waist</th><th className="text-left py-2.5 font-medium">Notes</th>
              </tr></thead>
              <tbody>
                {measurements.map((m: { id: string; date: Date; weight: number | null; bodyFatPct: number | null; waist: number | null; notes: string | null }) => (
                  <tr key={m.id} className="border-b border-[var(--border-light)] hover:bg-[var(--surface-hover)] transition-colors">
                    <td className="py-2.5 pr-3 text-[var(--text-tertiary)] text-xs font-mono">{format(new Date(m.date), "MMM d")}</td>
                    <td className="py-2.5 pr-3 text-right text-[var(--text-secondary)] font-mono">{m.weight ? `${m.weight} kg` : "—"}</td>
                    <td className="py-2.5 pr-3 text-right text-[var(--text-secondary)] font-mono">{m.bodyFatPct ? `${m.bodyFatPct}%` : "—"}</td>
                    <td className="py-2.5 pr-3 text-right text-[var(--text-secondary)] font-mono">{m.waist ? `${m.waist} cm` : "—"}</td>
                    <td className="py-2.5 text-[var(--text-tertiary)] text-xs">{m.notes || "—"}</td>
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
    <div className="premium-stat text-center">
      <div className="premium-label">{l}</div>
      <div className="text-lg font-bold mt-0.5 font-mono text-[var(--text)]">{v}<span className="text-xs font-normal text-[var(--text-tertiary)] ml-0.5">{u}</span></div>
      {d && <div className={`text-[11px] font-medium mt-0.5 ${parseFloat(d) > 0 ? "text-[var(--rose)]" : parseFloat(d) < 0 ? "text-[var(--emerald)]" : "text-[var(--text-tertiary)]"}`}>{parseFloat(d) > 0 ? "+" : ""}{d}</div>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="premium-panel animate-fade-in"><div className="mb-3 flex items-center justify-between gap-3"><h2 className="premium-panel-title">{title}</h2><span className="premium-panel-kicker">Record</span></div>{children}</section>;
}

function Empty({ msg }: { msg: string }) {
  return <div className="premium-empty">{msg}</div>;
}
