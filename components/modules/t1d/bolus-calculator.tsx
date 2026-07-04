"use client";

import { useState, useEffect, useCallback } from "react";

interface BolusResult {
  carbDose: number;
  correctionDose: number;
  totalDose: number;
  roundedDose: number;
  formula: string;
  settings: { icr: number; cf: number; targetGlucose: number };
  iob: number;
  exerciseReduction: string;
}

export function BolusCalculator() {
  const [carbs, setCarbs] = useState("");
  const [glucose, setGlucose] = useState("");
  const [exerciseContext, setExerciseContext] = useState(false);
  const [result, setResult] = useState<BolusResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastGlucose, setLastGlucose] = useState<number | null>(null);

  // Pre-fill glucose from latest reading
  useEffect(() => {
    fetch("/api/health/glucose?limit=1")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setLastGlucose(data[0].value);
          setGlucose(String(data[0].value));
        }
      })
      .catch(() => {});
  }, []);

  const calculate = useCallback(async () => {
    const carbsNum = parseFloat(carbs);
    const glucoseNum = parseFloat(glucose);
    if (!carbsNum || carbsNum <= 0) return;
    if (!glucoseNum || glucoseNum <= 0) return;

    setLoading(true);
    try {
      const res = await fetch("/api/health/bolus-calculator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carbs: carbsNum,
          currentGlucose: glucoseNum,
          exerciseContext: exerciseContext ? "pre_workout" : null,
        }),
      });
      const data = await res.json();
      if (data.roundedDose !== undefined) {
        setResult(data);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [carbs, glucose, exerciseContext]);

  return (
    <div className="space-y-4">
      {/* Inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="premium-label block mb-1">Carbs (grams)</label>
          <input
            type="number"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            placeholder="e.g. 60"
            className="w-full text-lg font-mono"
            onKeyDown={(e) => e.key === "Enter" && calculate()}
          />
        </div>
        <div>
          <label className="premium-label block mb-1">Glucose (mg/dL)</label>
          <input
            type="number"
            value={glucose}
            onChange={(e) => setGlucose(e.target.value)}
            placeholder={lastGlucose ? `Last: ${lastGlucose}` : "e.g. 120"}
            className="w-full text-lg font-mono"
            onKeyDown={(e) => e.key === "Enter" && calculate()}
          />
        </div>
      </div>

      {/* Exercise toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={exerciseContext}
          onChange={(e) => setExerciseContext(e.target.checked)}
          className="h-4 w-4 rounded border-[var(--border)] accent-[var(--accent)]"
        />
        <span className="text-xs text-[var(--text-secondary)]">I&apos;m about to work out (reduce bolus 25%)</span>
      </label>

      {/* Calculate button */}
      <button
        onClick={calculate}
        disabled={loading || !carbs || !glucose}
        className="premium-action w-full"
      >
        {loading ? "Calculating..." : "Calculate Bolus"}
      </button>

      {/* Results */}
      {result && (
        <div className="premium-panel space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-secondary)]">Suggested Dose</span>
            <span className="text-2xl font-bold font-mono text-[var(--accent)]">{result.roundedDose}u</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Carbs</div>
              <div className="text-sm font-mono text-[var(--text)]">{result.carbDose.toFixed(1)}u</div>
            </div>
            <div>
              <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Correction</div>
              <div className="text-sm font-mono text-[var(--text)]">{result.correctionDose.toFixed(1)}u</div>
            </div>
            <div>
              <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">IOB</div>
              <div className="text-sm font-mono text-[var(--amber)]">{result.iob}u active</div>
            </div>
          </div>

          <div className="text-[10px] text-[var(--text-tertiary)] border-t border-[var(--border-light)] pt-2 space-y-1">
            <div className="flex justify-between">
              <span>ICR: 1u:{result.settings.icr}g</span>
              <span>CF: 1u:{result.settings.cf} mg/dL</span>
              <span>Target: {result.settings.targetGlucose} mg/dL</span>
            </div>
            {result.exerciseReduction !== "none" && (
              <div className="text-[var(--amber)]">⚡ {result.exerciseReduction}</div>
            )}
          </div>

          <details className="text-[10px] text-[var(--text-tertiary)]">
            <summary className="cursor-pointer hover:text-[var(--text-secondary)]">Formula breakdown</summary>
            <p className="mt-1 font-mono leading-relaxed">{result.formula}</p>
          </details>
        </div>
      )}
    </div>
  );
}
