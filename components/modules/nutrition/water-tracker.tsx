"use client";

import { useState } from "react";

export function WaterTracker() {
  const [amount, setAmount] = useState("");
  const [today, setToday] = useState(0);
  const [loading, setLoading] = useState(true);

  useState(() => {
    fetch("/api/health/water?limit=1")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setToday(data[0].amountMl);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  });

  const logWater = async () => {
    const ml = parseInt(amount);
    if (!ml || ml <= 0) return;
    setLoading(true);
    await fetch("/api/health/water", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountMl: ml }),
    });
    setToday((t) => t + ml);
    setAmount("");
    setLoading(false);
  };

  const quickAdd = (ml: number) => {
    setAmount(String(ml));
    setTimeout(async () => {
      await fetch("/api/health/water", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountMl: ml }),
      });
      setToday((t) => t + ml);
      setAmount("");
    }, 50);
  };

  return (
    <section className="premium-panel animate-fade-in">
      <div className="mb-3"><h2 className="text-sm font-semibold text-[var(--text)]">Water</h2></div>
      <div className="flex items-center gap-4 mb-3">
        <div className="text-2xl font-bold font-mono text-[var(--sky)]">{(today / 1000).toFixed(1)}<span className="text-sm font-normal text-[var(--text-tertiary)]">L</span></div>
        <div className="flex-1 h-2 rounded-full bg-[var(--border-light)] overflow-hidden">
          <div className="h-full rounded-full bg-[var(--sky)]" style={{ width: `${Math.min(100, (today / 3000) * 100)}%` }} />
        </div>
        <span className="text-[10px] text-[var(--text-tertiary)]">3L goal</span>
      </div>
      <div className="flex gap-2 mb-2">
        {[250, 500, 750].map((ml) => (
          <button key={ml} onClick={() => quickAdd(ml)} className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] py-1.5 text-[11px] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all">
            +{ml}ml
          </button>
        ))}
      </div>
    </section>
  );
}
