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
      <div className="h-56 flex items-center justify-center text-stone-400 text-sm">
        No glucose data yet. Log your first reading.
      </div>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8e4df" />
          <XAxis
            dataKey="time"
            stroke="#a8a29e"
            tick={{ fill: "#78716c", fontSize: 10 }}
            interval={Math.max(0, Math.floor(data.length / 5) - 1)}
            axisLine={{ stroke: "#e8e4df" }}
          />
          <YAxis
            stroke="#a8a29e"
            tick={{ fill: "#78716c", fontSize: 10 }}
            domain={[40, 300]}
            ticks={[40, 70, 120, 180, 240, 300]}
            axisLine={{ stroke: "#e8e4df" }}
          />
          <Tooltip
            contentStyle={{
              background: "#ffffff",
              border: "1px solid #e8e4df",
              borderRadius: "12px",
              fontSize: "12px",
              color: "#1c1917",
              boxShadow: "0 4px 12px rgba(28,25,23,0.08)",
            }}
            labelStyle={{ color: "#78716c" }}
            formatter={(value) => [`${value} mg/dL`, "Glucose"]}
          />
          <ReferenceLine y={70} stroke="#fda4af" strokeDasharray="4 4" />
          <ReferenceLine y={180} stroke="#fcd34d" strokeDasharray="4 4" />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#0d9488"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: "#0d9488", stroke: "#fff", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-2 text-[11px] text-stone-400">
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-rose-300 inline-block rounded" /> Low (&lt;70)</span>
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-amber-300 inline-block rounded" /> High (&gt;180)</span>
        <span>Target: 70–180 mg/dL</span>
      </div>
    </div>
  );
}
