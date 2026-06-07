"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function GlucoseForm() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value) return;
    setSaving(true);
    await fetch("/api/health/glucose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: parseFloat(value), notes: notes || null }),
    });
    setValue("");
    setNotes("");
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="flex items-center gap-2 flex-1 bg-stone-50 rounded-xl border border-[var(--border)] px-3 py-2 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-50 transition-all">
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="120"
            className="w-20 text-center text-lg font-semibold font-mono bg-transparent border-none p-0 focus:ring-0 focus:shadow-none"
            step="1" min="20" max="600" required
          />
          <span className="text-stone-400 text-sm font-medium">mg/dL</span>
        </div>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes..."
          className="flex-1"
        />
        <button
          type="submit"
          disabled={saving || !value}
          className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.97] shadow-sm"
        >
          {saving ? "Saving..." : "Log"}
        </button>
      </div>
    </form>
  );
}

export function InsulinForm() {
  const router = useRouter();
  const [units, setUnits] = useState("");
  const [type, setType] = useState("rapid");
  const [brand, setBrand] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!units) return;
    setSaving(true);
    await fetch("/api/health/insulin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ units: parseFloat(units), type, brand: brand || null, notes: notes || null }),
    });
    setUnits("");
    setNotes("");
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
      <div className="flex items-center gap-2 bg-stone-50 rounded-xl border border-[var(--border)] px-3 py-2 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-50 transition-all">
        <input
          type="number"
          value={units}
          onChange={(e) => setUnits(e.target.value)}
          placeholder="5.0"
          className="w-16 text-center text-lg font-semibold font-mono bg-transparent border-none p-0 focus:ring-0 focus:shadow-none"
          step="0.5" min="0" required
        />
        <span className="text-stone-400 text-sm font-medium">units</span>
      </div>
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="rapid">Rapid</option>
        <option value="long">Long</option>
        <option value="mixed">Mixed</option>
        <option value="correction">Correction</option>
      </select>
      <input
        type="text"
        value={brand}
        onChange={(e) => setBrand(e.target.value)}
        placeholder="Brand"
        className="w-28"
      />
      <input
        type="text"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes..."
        className="flex-1"
      />
      <button
        type="submit"
        disabled={saving || !units}
        className="px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.97] shadow-sm whitespace-nowrap"
      >
        {saving ? "Saving..." : "Log Insulin"}
      </button>
    </form>
  );
}
