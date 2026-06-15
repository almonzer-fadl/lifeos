"use client";

import { estimateA1c, timeInRange } from "@/lib/h1bc";

type Stats = { readings: number[]; latestGlucose: number | null; totalInsulin: number };

export function T1DStats({ readings, latestGlucose, totalInsulin }: Stats) {
  const tir = timeInRange(readings);
  const avg = readings.length > 0 ? readings.reduce((a, b) => a + b, 0) / readings.length : null;
  const a1c = avg ? estimateA1c(avg) : null;

  const statColor = (v: number | null) =>
    v === null ? "text-stone-300" : v < 70 ? "text-rose-600" : v > 180 ? "text-amber-600" : "text-emerald-600";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-stagger">
      <StatCard
        label="Latest Glucose"
        value={latestGlucose !== null ? `${latestGlucose}` : "--"}
        unit="mg/dL"
        valueClassName={statColor(latestGlucose)}
      />
      <StatCard label="Est. h1bc" value={a1c ? a1c.toFixed(1) : "--"} unit="%" valueClassName="text-teal-600" />
      <StatCard
        label="Time in Range"
        value={tir.total > 0 ? `${tir.inRange.toFixed(0)}` : "--"}
        unit="%"
        valueClassName="text-emerald-600"
      />
      <StatCard
        label="Today's Insulin"
        value={totalInsulin > 0 ? `${totalInsulin.toFixed(1)}` : "--"}
        unit="units"
        valueClassName="text-violet-600"
      />
    </div>
  );
}

function StatCard({ label, value, unit, valueClassName }: {
  label: string; value: string; unit: string; valueClassName: string;
}) {
  return (
    <div className="p-4 rounded-2xl bg-white border border-[var(--border)] shadow-[var(--shadow-card)]">
      <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">{label}</div>
      <div className={`text-[1.75rem] font-bold tracking-tight mt-1 font-mono ${valueClassName}`}>{value}</div>
      <div className="text-xs text-stone-400 mt-0.5">{unit}</div>
    </div>
  );
}
