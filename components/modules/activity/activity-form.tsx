"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TYPES = [
  { value: "run", label: "Run", emoji: "🏃" },
  { value: "swim", label: "Swim", emoji: "🏊" },
  { value: "bike", label: "Bike", emoji: "🚴" },
  { value: "walk", label: "Walk", emoji: "🚶" },
  { value: "hike", label: "Hike", emoji: "🥾" },
  { value: "other", label: "Other", emoji: "💪" },
];

export function ActivityForm() {
  const router = useRouter();
  const [type, setType] = useState("run");
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [hr, setHr] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const now = new Date();
    const dur = parseFloat(duration);
    const endTime = dur ? new Date(now.getTime() + dur * 60000).toISOString() : null;
    await fetch("/api/health/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        startTime: now.toISOString(),
        endTime,
        distance: distance ? parseFloat(distance) * 1000 : null,
        heartRateAvg: hr ? parseInt(hr) : null,
        notes: notes || null,
      }),
    });
    setDistance(""); setDuration(""); setHr(""); setNotes("");
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-1.5 flex-wrap">
        {TYPES.map(({ value, label, emoji }) => (
          <button
            key={value} type="button"
            onClick={() => setType(value)}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all active:scale-95 ${
              type === value
                ? "bg-amber-100 text-amber-800 border border-amber-300 shadow-sm"
                : "bg-stone-50 text-stone-500 border border-[var(--border-light)] hover:bg-stone-100"
            }`}
          >
            {emoji} {label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Input label="Distance (km)" value={distance} onChange={setDistance} placeholder="5.0" step="0.1" />
        <Input label="Duration (min)" value={duration} onChange={setDuration} placeholder="30" />
        <Input label="Avg HR" value={hr} onChange={setHr} placeholder="145" />
        <Input label="Notes" value={notes} onChange={setNotes} placeholder="Evening run" />
      </div>
      <button type="submit" disabled={saving || !duration} className="w-full py-2.5 bg-amber-600 text-white rounded-xl text-sm font-semibold hover:bg-amber-700 disabled:opacity-40 transition-all active:scale-[0.98] shadow-sm">
        {saving ? "Saving..." : "Log Activity"}
      </button>
    </form>
  );
}

function Input({ label, value, onChange, placeholder, step = "1" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; step?: string;
}) {
  return (
    <div>
      <label className="text-[11px] font-medium text-stone-400 block mb-1">{label}</label>
      <input type="number" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} step={step} min="0" className="w-full" />
    </div>
  );
}
