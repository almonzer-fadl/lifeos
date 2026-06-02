import { estimateA1c, timeInRange } from "@/lib/h1bc";

type Stats = {
  readings: number[];
  latestGlucose: number | null;
  totalInsulin: number;
};

export function T1DStats({ readings, latestGlucose, totalInsulin }: Stats) {
  const tir = timeInRange(readings);
  const avg =
    readings.length > 0
      ? readings.reduce((a, b) => a + b, 0) / readings.length
      : null;
  const a1c = avg ? estimateA1c(avg) : null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        label="Latest Glucose"
        value={latestGlucose ? `${latestGlucose}` : "--"}
        unit="mg/dL"
        color={
          latestGlucose
            ? latestGlucose < 70
              ? "text-red-400"
              : latestGlucose > 180
                ? "text-yellow-400"
                : "text-green-400"
            : "text-zinc-500"
        }
      />
      <StatCard
        label="Est. h1bc"
        value={a1c ? a1c.toFixed(1) : "--"}
        unit="%"
        color="text-blue-400"
      />
      <StatCard
        label="Time in Range"
        value={tir.total > 0 ? `${tir.inRange.toFixed(0)}` : "--"}
        unit="%"
        color="text-green-400"
      />
      <StatCard
        label="Today's Insulin"
        value={totalInsulin > 0 ? `${totalInsulin.toFixed(1)}` : "--"}
        unit="units"
        color="text-purple-400"
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: string;
  unit: string;
  color: string;
}) {
  return (
    <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${color}`}>{value}</div>
      <div className="text-xs text-zinc-600">{unit}</div>
    </div>
  );
}
