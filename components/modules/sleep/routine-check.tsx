"use client";

import { useEffect, useState } from "react";

interface RoutineData {
  id: string;
  date: string;
  screensOffAt: string | null;
  inBedAt: string | null;
  wakeAt: string | null;
  whiteNoiseOn: boolean;
  preSleepActivity: string | null;
  lateMeal: boolean;
  compliance: number;
}

export function SleepRoutineCheck() {
  const [routine, setRoutine] = useState<RoutineData | null>(null);
  const [debt, setDebt] = useState<{ currentDebt: number; trend: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/health/sleep/routine").then((r) => r.json()),
      fetch("/api/health/sleep/debt").then((r) => r.json()),
    ]).then(([r, d]) => {
      setRoutine(r);
      setDebt(d);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="skeleton h-32 w-full rounded-lg" />;

  const updateRoutine = async (field: string, value: unknown) => {
    await fetch("/api/health/sleep/routine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    // Refetch
    const res = await fetch("/api/health/sleep/routine");
    setRoutine(await res.json());
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="premium-stat">
          <div className="premium-label">Protocol Compliance</div>
          <div className={`text-lg font-bold font-mono mt-1 ${(routine?.compliance || 0) >= 80 ? "text-[var(--emerald)]" : "text-[var(--amber)]"}`}>{routine?.compliance || 0}%</div>
        </div>
        <div className="premium-stat">
          <div className="premium-label">Sleep Debt</div>
          <div className={`text-lg font-bold font-mono mt-1 ${(debt?.currentDebt || 0) <= 1 ? "text-[var(--emerald)]" : "text-[var(--rose)]"}`}>{debt?.currentDebt || 0}h</div>
          <div className="text-[10px] text-[var(--text-tertiary)]">{debt?.trend || "—"}</div>
        </div>
      </div>

      <div className="premium-panel">
        <div className="mb-2 text-sm font-semibold text-[var(--text)]">Tonight&apos;s Routine</div>
        <div className="space-y-2 text-xs">
          <label className="flex items-center justify-between">
            <span className="text-[var(--text-secondary)]">Screens off at 21:00</span>
            <button onClick={() => updateRoutine("screensOffAt", new Date().toISOString())} className="text-[var(--accent)] hover:text-[var(--accent-hover)]">
              {routine?.screensOffAt ? "✓ Done" : "Tap to mark"}
            </button>
          </label>
          <label className="flex items-center justify-between">
            <span className="text-[var(--text-secondary)]">In bed at 21:45</span>
            <button onClick={() => updateRoutine("inBedAt", new Date().toISOString())} className="text-[var(--accent)] hover:text-[var(--accent-hover)]">
              {routine?.inBedAt ? "✓ Done" : "Tap to mark"}
            </button>
          </label>
          <label className="flex items-center justify-between">
            <span className="text-[var(--text-secondary)]">White noise on</span>
            <button onClick={() => updateRoutine("whiteNoiseOn", !routine?.whiteNoiseOn)} className={routine?.whiteNoiseOn ? "text-[var(--emerald)]" : "text-[var(--text-tertiary)]"}>
              {routine?.whiteNoiseOn ? "✓ On" : "○ Off"}
            </button>
          </label>
          <label className="flex items-center justify-between">
            <span className="text-[var(--text-secondary)]">No screens activity</span>
            <select value={routine?.preSleepActivity || ""} onChange={(e) => updateRoutine("preSleepActivity", e.target.value)} className="text-xs bg-[var(--surface)]">
              <option value="">Select...</option>
              <option value="reading">Reading</option>
              <option value="stretching">Stretching</option>
              <option value="planning">Planning</option>
              <option value="screens">Screens ⚠️</option>
            </select>
          </label>
          <label className="flex items-center justify-between">
            <span className="text-[var(--text-secondary)]">Late meal (&lt;2h before bed)</span>
            <button onClick={() => updateRoutine("lateMeal", !routine?.lateMeal)} className={!routine?.lateMeal ? "text-[var(--emerald)]" : "text-[var(--rose)]"}>
              {!routine?.lateMeal ? "✓ No" : "⚠️ Yes"}
            </button>
          </label>
        </div>
      </div>
    </div>
  );
}
