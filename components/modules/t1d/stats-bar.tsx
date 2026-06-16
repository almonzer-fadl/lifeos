"use client";

import { estimateA1c, timeInRange } from "@/lib/h1bc";

type Stats = { readings: number[]; latestGlucose: number | null; totalInsulin: number };

export function T1DStats({ readings, latestGlucose, totalInsulin }: Stats) {
  const tir = timeInRange(readings);
  const avg = readings.length > 0 ? readings.reduce((a, b) => a + b, 0) / readings.length : null;
  const a1c = avg ? estimateA1c(avg) : null;

  const statColor = (v: number | null) =>
    v === null ? "text-[var(--text-tertiary)]" : v < 70 ? "text-[var(--rose)]" : v > 180 ? "text-[var(--amber)]" : "text-[var(--emerald)]";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-stagger">
      <StatCard
        label="Latest Glucose"
        value={latestGlucose !== null ? `${latestGlucose}` : "--"}
        unit="mg/dL"
        valueClassName={statColor(latestGlucose)}
      />
      <StatCard label="Est. h1bc" value={a1c ? a1c.toFixed(1) : "--"} unit="%" valueClassName="text-[var(--accent)]" />
      <StatCard
        label="Time in Range"
        value={tir.total > 0 ? `${tir.inRange.toFixed(0)}` : "--"}
        unit="%"
        valueClassName="text-[var(--emerald)]"
      />
      <StatCard
        label="Today's Insulin"
        value={totalInsulin > 0 ? `${totalInsulin.toFixed(1)}` : "--"}
        unit="units"
        valueClassName="text-[var(--violet)]"
      />
    </div>
  );
}

function StatCard({ label, value, unit, valueClassName }: {
  label: string; value: string; unit: string; valueClassName: string;
}) {
  return (
    <div className="premium-stat">
      <div className="premium-label">{label}</div>
      <div className={`text-[1.75rem] font-bold tracking-tight mt-1 font-mono ${valueClassName}`}>{value}</div>
      <div className="text-xs text-[var(--text-tertiary)] mt-0.5">{unit}</div>
    </div>
  );
}
