"use client";

import { useEffect, useState } from "react";

interface T1DStatsData {
  latestGlucose: number | null;
  iob: number | null;
  tir7d: number | null;
  estimatedHbA1c: number | null;
  avgGlucose: number | null;
  totalInsulinToday: number | null;
}

export function T1DStatsBar() {
  const [stats, setStats] = useState<T1DStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        const [glucoseRes, iobRes, insulinRes] = await Promise.all([
          fetch(`/api/health/glucose?limit=1`),
          fetch(`/api/health/insulin/iob`),
          fetch(`/api/health/insulin?from=${today}`),
        ]);

        const glucoseData = await glucoseRes.json();
        const iobData = await iobRes.json();
        const insulinData = await insulinRes.json();

        const latestGlucose = Array.isArray(glucoseData) && glucoseData.length > 0
          ? glucoseData[0].value : null;

        // Fetch stats for TIR and HbA1c
        let tir7d: number | null = null;
        let estimatedHbA1c: number | null = null;
        let avgGlucose: number | null = null;

        try {
          const statsRes = await fetch(`/api/health/glucose/stats?from=${sevenDaysAgo}`);
          const statsData = await statsRes.json();
          if (statsData.inRangePct !== undefined) tir7d = statsData.inRangePct;
          if (statsData.estimatedHbA1c) estimatedHbA1c = statsData.estimatedHbA1c;
          if (statsData.avgGlucose) avgGlucose = statsData.avgGlucose;
        } catch { /* ignore */ }

        const totalInsulinToday = Array.isArray(insulinData)
          ? insulinData.reduce((s: number, d: { units: number }) => s + d.units, 0)
          : null;

        setStats({
          latestGlucose,
          iob: iobData.iob ?? null,
          tir7d,
          estimatedHbA1c,
          avgGlucose,
          totalInsulinToday,
        });
      } catch { /* ignore */ }
      setLoading(false);
    }
    fetchData();
  }, []);

  const glucoseColor = (v: number | null) => {
    if (v === null) return "text-[var(--text-tertiary)]";
    if (v < 70) return "text-[var(--rose)]";
    if (v > 180) return "text-[var(--amber)]";
    return "text-[var(--emerald)]";
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="premium-stat">
            <div className="skeleton h-3 w-16 mb-2" />
            <div className="skeleton h-8 w-20" />
            <div className="skeleton h-3 w-8 mt-1" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 animate-stagger">
      <StatCard label="Glucose" value={stats?.latestGlucose !== null ? `${stats?.latestGlucose}` : "--"} unit="mg/dL" color={glucoseColor(stats?.latestGlucose ?? null)} />
      <StatCard label="IOB" value={stats?.iob !== null ? `${stats?.iob}` : "--"} unit="units active" color="text-[var(--violet)]" />
      <StatCard label="7-Day TIR" value={stats?.tir7d !== null ? `${stats?.tir7d}` : "--"} unit="%" color="text-[var(--emerald)]" />
      <StatCard label="Est. HbA1c" value={stats?.estimatedHbA1c !== null ? `${stats?.estimatedHbA1c}` : "--"} unit="%" color="text-[var(--accent)]" />
      <StatCard label="Insulin Today" value={stats?.totalInsulinToday !== null ? `${stats?.totalInsulinToday.toFixed(1)}` : "--"} unit="units" color="text-[var(--sky)]" />
    </div>
  );
}

function StatCard({ label, value, unit, color }: {
  label: string; value: string; unit: string; color: string;
}) {
  return (
    <div className="premium-stat">
      <div className="premium-label">{label}</div>
      <div className={`text-[1.5rem] font-bold tracking-tight mt-1 font-mono ${color}`}>{value}</div>
      <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5">{unit}</div>
    </div>
  );
}
