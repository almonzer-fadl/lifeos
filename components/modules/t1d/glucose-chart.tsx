"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { format } from "date-fns";

type Reading = { id: string; timestamp: string; value: number };

export function GlucoseChart({ readings }: { readings: Reading[] }) {
  const data = [...readings].reverse().map((r) => ({
    time: format(new Date(r.timestamp), "HH:mm"),
    value: r.value,
    date: format(new Date(r.timestamp), "MMM d"),
  }));

  if (data.length === 0) {
    return (
      <div className="premium-empty flex h-56 items-center justify-center">
        No glucose data yet. Log your first reading.
      </div>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="time"
            stroke="var(--text-tertiary)"
            tick={{ fill: "var(--text-secondary)", fontSize: 10 }}
            interval={Math.max(0, Math.floor(data.length / 5) - 1)}
            axisLine={{ stroke: "var(--border)" }}
          />
          <YAxis
            stroke="var(--text-tertiary)"
            tick={{ fill: "var(--text-secondary)", fontSize: 10 }}
            domain={[40, 300]}
            ticks={[40, 70, 120, 180, 240, 300]}
            axisLine={{ stroke: "var(--border)" }}
          />
          <Tooltip
            contentStyle={{
              background: "var(--surface-raised)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: "12px",
              color: "var(--text)",
              boxShadow: "0 22px 70px rgba(0,0,0,0.34)",
            }}
            labelStyle={{ color: "var(--text-secondary)" }}
            formatter={(value) => [`${value} mg/dL`, "Glucose"]}
          />
          <ReferenceLine y={70} stroke="var(--rose)" strokeDasharray="4 4" />
          <ReferenceLine y={180} stroke="var(--amber)" strokeDasharray="4 4" />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--emerald)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: "#42d392", stroke: "#090c10", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap items-center gap-4 mt-2 text-[11px] text-[var(--text-tertiary)]">
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[var(--rose)] inline-block rounded" /> Low (&lt;70)</span>
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[var(--amber)] inline-block rounded" /> High (&gt;180)</span>
        <span>Target: 70–180 mg/dL</span>
      </div>
    </div>
  );
}
