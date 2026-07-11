"use client";

import { useEffect, useState } from "react";

interface HbA1cEntry { id: string; date: string; value: number; method: string; }
interface ThyroidEntry { id: string; date: string; tsh: number; ft3: number | null; ft4: number | null; }
interface MedicationItem { id: string; name: string; dosage: string; frequency: string; timeOfDay: string | null; logs: { taken: boolean; date: string }[]; }

export function BodyDashboard() {
  const [hba1c, setHba1c] = useState<HbA1cEntry[]>([]);
  const [thyroid, setThyroid] = useState<ThyroidEntry[]>([]);
  const [meds, setMeds] = useState<MedicationItem[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/health/hba1c").then((r) => r.json()),
      fetch("/api/health/thyroid").then((r) => r.json()),
      fetch("/api/health/medications").then((r) => r.json()),
    ]).then(([h, t, m]) => {
      if (Array.isArray(h)) setHba1c(h);
      if (Array.isArray(t)) setThyroid(t);
      if (Array.isArray(m)) setMeds(m);
    }).catch(() => {});
  }, []);

  const latestHbA1c = hba1c[0];
  const latestThyroid = thyroid[0];

  const logMedication = async (medicationId: string) => {
    await fetch("/api/health/medications/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ medicationId, taken: true }),
    });
    const res = await fetch("/api/health/medications");
    setMeds(await res.json());
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="premium-stat">
          <div className="premium-label">HbA1c</div>
          <div className="text-lg font-bold font-mono mt-1 text-[var(--accent)]">{latestHbA1c ? `${latestHbA1c.value}%` : "—"}</div>
          <div className="text-[10px] text-[var(--text-tertiary)]">{latestHbA1c?.method || "—"}</div>
        </div>
        <div className="premium-stat">
          <div className="premium-label">Thyroid (TSH)</div>
          <div className="text-lg font-bold font-mono mt-1 text-[var(--sky)]">{latestThyroid ? `${latestThyroid.tsh} mIU/L` : "—"}</div>
          <div className="text-[10px] text-[var(--text-tertiary)]">{latestThyroid ? `FT3: ${latestThyroid.ft3 || "—"} · FT4: ${latestThyroid.ft4 || "—"}` : "No data"}</div>
        </div>
      </div>

      {meds.length > 0 && (
        <div className="premium-panel">
          <div className="mb-2 text-sm font-semibold text-[var(--text)]">Medications</div>
          <div className="space-y-1">
            {meds.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-lg px-3 py-2 bg-[var(--surface)] border border-[var(--border-light)]">
                <div>
                  <div className="text-sm text-[var(--text)]">{m.name}</div>
                  <div className="text-[10px] text-[var(--text-tertiary)]">{m.dosage} · {m.frequency}{m.timeOfDay ? ` · ${m.timeOfDay}` : ""}</div>
                </div>
                <button onClick={() => logMedication(m.id)} className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)]">Take ✓</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
