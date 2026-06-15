"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { format } from "date-fns";

type Reading = {
  id: string;
  timestamp: string;
  value: number;
};

const RANGE_COLORS = {
  low: "#ef4444",
  inRange: "#22c55e",
  high: "#f59e0b",
};

export function GlucoseChart({ readings }: { readings: Reading[] }) {
  const data = [...readings]
    .reverse()
    .map((r) => ({
      time: format(new Date(r.timestamp), "HH:mm"),
      value: r.value,
      date: format(new Date(r.timestamp), "MMM d"),
    }));

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-zinc-500 text-sm">
        No glucose data yet. Log your first reading.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis
            dataKey="time"
            stroke="#52525b"
            tick={{ fill: "#71717a", fontSize: 11 }}
            interval={Math.max(0, Math.floor(data.length / 6) - 1)}
          />
          <YAxis
            stroke="#52525b"
            tick={{ fill: "#71717a", fontSize: 11 }}
            domain={[40, 300]}
            ticks={[40, 70, 120, 180, 240, 300]}
          />
          <Tooltip
            contentStyle={{
              background: "#18181b",
              border: "1px solid #27272a",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#fafafa",
            }}
            labelStyle={{ color: "#a1a1aa" }}
            formatter={(value) => [`${value} mg/dL`, "Glucose"]}
          />
          <ReferenceLine
            y={70}
            stroke={RANGE_COLORS.low}
            strokeDasharray="3 3"
            strokeOpacity={0.5}
          />
          <ReferenceLine
            y={180}
            stroke={RANGE_COLORS.high}
            strokeDasharray="3 3"
            strokeOpacity={0.5}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#3b82f6" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
