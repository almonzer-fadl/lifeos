import { db } from "@/lib/db";
import { GlucoseChart } from "@/components/modules/t1d/glucose-chart";
import { GlucoseForm, InsulinForm } from "@/components/modules/t1d/glucose-form";
import { T1DStats } from "@/components/modules/t1d/stats-bar";
import { DeleteButton } from "@/components/ui/delete-button";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

export const dynamic = "force-dynamic";

export default async function T1DPage() {
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);
  const sevenDaysAgo = subDays(today, 7);
  const ninetyDaysAgo = subDays(today, 90);

  const [recentReadings, todayReadings, todayInsulin, ninetyDayReadings] =
    await Promise.all([
      db.glucoseReading.findMany({
        where: { timestamp: { gte: sevenDaysAgo } },
        orderBy: { timestamp: "desc" },
        take: 288,
      }),
      db.glucoseReading.findMany({
        where: { timestamp: { gte: todayStart, lte: todayEnd } },
        orderBy: { timestamp: "desc" },
      }),
      db.insulinDose.findMany({
        where: { timestamp: { gte: todayStart, lte: todayEnd } },
      }),
      db.glucoseReading.findMany({
        where: { timestamp: { gte: ninetyDaysAgo } },
        orderBy: { timestamp: "desc" },
      }),
    ]);

  const todayInsulinTotal = todayInsulin.reduce((sum: number, d: { units: number }) => sum + d.units, 0);
  const latestGlucose = todayReadings[0]?.value ?? null;

  return (
    <div className="premium-page">
      <PageHeader title="T1D Command" subtitle="Glucose, insulin, and h1bc telemetry" />

      <T1DStats
        readings={ninetyDayReadings.map((r: { value: number }) => r.value)}
        latestGlucose={latestGlucose}
        totalInsulin={todayInsulinTotal}
      />

      <Section title="Glucose (7 days)">
        <GlucoseChart
          readings={recentReadings.map((r: { id: string; timestamp: Date; value: number }) => ({
            id: r.id,
            timestamp: r.timestamp.toISOString(),
            value: r.value,
          }))}
        />
      </Section>

      <Section title="Quick Add">
        <div className="space-y-5">
          <GlucoseForm />
          <div className="border-t border-[var(--border-light)]" />
          <InsulinForm />
        </div>
      </Section>

      {/* Recent readings */}
      <Section title={`Today's Readings${todayReadings.length ? ` (${todayReadings.length})` : ""}`}>
        {todayReadings.length === 0 ? (
          <EmptyState message="No readings today. Log your first glucose reading above." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[var(--text-tertiary)] text-xs uppercase tracking-wider border-b border-[var(--border-light)]">
                  <th className="text-left py-2.5 pr-4 font-medium">Time</th>
                  <th className="text-right py-2.5 pr-4 font-medium">Glucose</th>
                  <th className="text-right py-2.5 pr-4 font-medium">Source</th>
                  <th className="text-left py-2.5 font-medium">Notes</th>
                  <th className="text-right py-2.5 font-medium w-10"></th>
                </tr>
              </thead>
              <tbody>
                {todayReadings.map((r: { id: string; timestamp: Date; value: number; source: string; notes: string | null }) => {
                  const isLow = r.value < 70;
                  const isHigh = r.value > 180;
                  return (
                    <tr key={r.id} className="border-b border-[var(--border-light)] hover:bg-[var(--surface-hover)] transition-colors">
                      <td className="py-2.5 pr-4 text-[var(--text-tertiary)] font-mono text-xs">
                        {format(new Date(r.timestamp), "HH:mm")}
                      </td>
                      <td className={`py-2.5 pr-4 text-right font-semibold font-mono ${isLow ? "text-[var(--rose)]" : isHigh ? "text-[var(--amber)]" : "text-[var(--emerald)]"}`}>
                        {r.value}
                      </td>
                      <td className="py-2.5 pr-4 text-right text-[var(--text-tertiary)] text-xs">{r.source}</td>
                      <td className="py-2.5 text-[var(--text-tertiary)] text-xs">{r.notes || "—"}</td>
                      <td className="py-2.5 text-right"><DeleteButton url={`/api/health/glucose?id=${r.id}`} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Insulin log */}
      {todayInsulin.length > 0 && (
        <Section title="Today's Insulin">
          <div className="space-y-1.5">
            {todayInsulin.map((d: { id: string; timestamp: Date; type: string; brand: string | null; units: number }) => (
              <div key={d.id} className="premium-row flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-[var(--text-tertiary)]">{format(new Date(d.timestamp), "HH:mm")}</span>
                  <span className="text-sm capitalize text-[var(--text)]">{d.type}</span>
                  {d.brand && <span className="text-xs text-[var(--text-tertiary)]">{d.brand}</span>}
                </div>
                <span className="font-semibold text-[var(--violet)] font-mono">{d.units}u</span>
                <DeleteButton url={`/api/health/insulin?id=${d.id}`} />
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="premium-header animate-fade-in">
      <div className="premium-kicker">Health Desk</div>
      <h1 className="premium-title">{title}</h1>
      <p className="premium-subtitle">{subtitle}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="premium-panel animate-fade-in">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="premium-panel-title">{title}</h2>
        <span className="premium-panel-kicker">Monitor</span>
      </div>
      {children}
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="premium-empty">{message}</div>
  );
}
