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
    <div className="p-5 lg:p-8 space-y-5">
      <PageHeader title="Type 1 Diabetes" subtitle="Glucose, insulin, and h1bc" />

      <T1DStats
        readings={ninetyDayReadings.map((r) => r.value)}
        latestGlucose={latestGlucose}
        totalInsulin={todayInsulinTotal}
      />

      <Section title="Glucose (7 days)">
        <GlucoseChart
          readings={recentReadings.map((r) => ({
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
                <tr className="text-stone-400 text-xs uppercase tracking-wider border-b border-[var(--border-light)]">
                  <th className="text-left py-2.5 pr-4 font-medium">Time</th>
                  <th className="text-right py-2.5 pr-4 font-medium">Glucose</th>
                  <th className="text-right py-2.5 pr-4 font-medium">Source</th>
                  <th className="text-left py-2.5 font-medium">Notes</th>
                  <th className="text-right py-2.5 font-medium w-10"></th>
                </tr>
              </thead>
              <tbody>
                {todayReadings.map((r) => {
                  const isLow = r.value < 70;
                  const isHigh = r.value > 180;
                  return (
                    <tr key={r.id} className="border-b border-[var(--border-light)] hover:bg-stone-50/50 transition-colors">
                      <td className="py-2.5 pr-4 text-stone-500 font-mono text-xs">
                        {format(new Date(r.timestamp), "HH:mm")}
                      </td>
                      <td className={`py-2.5 pr-4 text-right font-semibold font-mono ${isLow ? "text-rose-600" : isHigh ? "text-amber-600" : "text-emerald-600"}`}>
                        {r.value}
                      </td>
                      <td className="py-2.5 pr-4 text-right text-stone-400 text-xs">{r.source}</td>
                      <td className="py-2.5 text-stone-400 text-xs">{r.notes || "—"}</td>
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
            {todayInsulin.map((d) => (
              <div key={d.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-stone-50 border border-[var(--border-light)]">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-stone-500">{format(new Date(d.timestamp), "HH:mm")}</span>
                  <span className="text-sm capitalize text-stone-700">{d.type}</span>
                  {d.brand && <span className="text-xs text-stone-400">{d.brand}</span>}
                </div>
                <span className="font-semibold text-violet-600 font-mono">{d.units}u</span>
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
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold tracking-tight text-stone-900">{title}</h1>
      <p className="text-sm text-stone-500 mt-0.5">{subtitle}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white border border-[var(--border)] shadow-[var(--shadow-card)] p-5 animate-fade-in">
      <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">{title}</h2>
      {children}
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-8 text-center">
      <p className="text-sm text-stone-400">{message}</p>
    </div>
  );
}
