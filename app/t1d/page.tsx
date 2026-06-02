import { db } from "@/lib/db";
import { GlucoseChart } from "@/components/modules/t1d/glucose-chart";
import { GlucoseForm, InsulinForm } from "@/components/modules/t1d/glucose-form";
import { T1DStats } from "@/components/modules/t1d/stats-bar";
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
        where: {
          timestamp: { gte: todayStart, lte: todayEnd },
        },
        orderBy: { timestamp: "desc" },
      }),
      db.insulinDose.findMany({
        where: {
          timestamp: { gte: todayStart, lte: todayEnd },
        },
      }),
      db.glucoseReading.findMany({
        where: { timestamp: { gte: ninetyDaysAgo } },
        orderBy: { timestamp: "desc" },
      }),
    ]);

  const todayInsulinTotal = todayInsulin.reduce((sum, d) => sum + d.units, 0);
  const latestGlucose = todayReadings[0]?.value ?? null;

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Type 1 Diabetes</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Glucose tracking, insulin log, and h1bc estimation
        </p>
      </div>

      {/* Stats bar */}
      <T1DStats
        readings={ninetyDayReadings.map((r) => r.value)}
        latestGlucose={latestGlucose}
        totalInsulin={todayInsulinTotal}
      />

      {/* Glucose chart */}
      <section className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
            Glucose (7 days)
          </h2>
        </div>
        <GlucoseChart
          readings={recentReadings.map((r) => ({
            id: r.id,
            timestamp: r.timestamp.toISOString(),
            value: r.value,
          }))}
        />
        {/* Range legend */}
        <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-red-400 inline-block" /> Low (&lt;70)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-yellow-400 inline-block" /> High
            (&gt;180)
          </span>
          <span className="flex items-center gap-1">Target: 70-180 mg/dL</span>
        </div>
      </section>

      {/* Quick add */}
      <section className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
          Quick Add
        </h2>
        <GlucoseForm />
        <div className="border-t border-zinc-800" />
        <InsulinForm />
      </section>

      {/* Recent readings table */}
      <section className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          Recent Readings
        </h2>
        {todayReadings.length === 0 ? (
          <p className="text-zinc-600 text-sm py-4 text-center">
            No readings today. Log your first glucose reading above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-500 text-xs uppercase tracking-wider border-b border-zinc-800">
                  <th className="text-left py-2 pr-4">Time</th>
                  <th className="text-right py-2 pr-4">Glucose</th>
                  <th className="text-right py-2 pr-4">Source</th>
                  <th className="text-left py-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {todayReadings.map((r) => {
                  const isLow = r.value < 70;
                  const isHigh = r.value > 180;
                  const valueColor = isLow
                    ? "text-red-400"
                    : isHigh
                      ? "text-yellow-400"
                      : "text-green-400";

                  return (
                    <tr
                      key={r.id}
                      className="border-b border-zinc-800/50 hover:bg-zinc-800/30"
                    >
                      <td className="py-2 pr-4 text-zinc-400">
                        {format(new Date(r.timestamp), "HH:mm")}
                      </td>
                      <td
                        className={`py-2 pr-4 text-right font-semibold ${valueColor}`}
                      >
                        {r.value}
                      </td>
                      <td className="py-2 pr-4 text-right text-zinc-500 text-xs">
                        {r.source}
                      </td>
                      <td className="py-2 text-zinc-500 text-xs">
                        {r.notes || ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Recent insulin doses */}
        {todayInsulin.length > 0 && (
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Today&apos;s Insulin
            </h3>
            <div className="space-y-1">
              {todayInsulin.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400">
                      {format(new Date(d.timestamp), "HH:mm")}
                    </span>
                    <span className="text-zinc-500 text-xs capitalize">
                      {d.type}
                    </span>
                    {d.brand && (
                      <span className="text-zinc-600 text-xs">{d.brand}</span>
                    )}
                  </div>
                  <span className="font-semibold text-purple-400">
                    {d.units}u
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
