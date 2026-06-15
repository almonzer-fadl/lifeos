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
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
      <div className="flex items-center gap-2 flex-1">
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="120"
          className="w-24 text-center text-lg font-semibold"
          step="1"
          min="20"
          max="600"
          required
        />
        <span className="text-zinc-500 text-sm">mg/dL</span>
      </div>
      <input
        type="text"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (optional)"
        className="flex-1"
      />
      <button
        type="submit"
        disabled={saving || !value}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {saving ? "Saving..." : "Log Glucose"}
      </button>
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
      body: JSON.stringify({
        units: parseFloat(units),
        type,
        brand: brand || null,
        notes: notes || null,
      }),
    });
    setUnits("");
    setNotes("");
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={units}
          onChange={(e) => setUnits(e.target.value)}
          placeholder="5.0"
          className="w-20 text-center text-lg font-semibold"
          step="0.5"
          min="0"
          required
        />
        <span className="text-zinc-500 text-sm">units</span>
      </div>
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="min-w-[100px]"
      >
        <option value="rapid">Rapid</option>
        <option value="long">Long</option>
        <option value="mixed">Mixed</option>
        <option value="correction">Correction</option>
      </select>
      <input
        type="text"
        value={brand}
        onChange={(e) => setBrand(e.target.value)}
        placeholder="Brand (optional)"
        className="w-32"
      />
      <input
        type="text"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes"
        className="flex-1"
      />
      <button
        type="submit"
        disabled={saving || !units}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {saving ? "Saving..." : "Log Insulin"}
      </button>
    </form>
  );
}
