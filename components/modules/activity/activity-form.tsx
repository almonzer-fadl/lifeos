"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";

const TYPES = [
  { value: "run", label: "Run", code: "RUN" },
  { value: "swim", label: "Swim", code: "SWM" },
  { value: "bike", label: "Bike", code: "BIK" },
  { value: "walk", label: "Walk", code: "WLK" },
  { value: "hike", label: "Hike", code: "HIK" },
  { value: "other", label: "Other", code: "TRN" },
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
    try {
      const res = await fetch("/api/health/activity", {
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
      if (!res.ok) throw new Error();
      toast.success("Activity logged");
      router.push("/activity");
    } catch {
      toast.error("Failed to log activity");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-1.5 flex-wrap">
        {TYPES.map(({ value, label, code }) => (
          <button
            key={value} type="button"
            onClick={() => setType(value)}
            className={`rounded-md border px-3 py-1.5 text-sm font-semibold transition-all active:scale-95 ${
              type === value
                ? "border-[rgba(220,193,122,0.38)] bg-[var(--accent-soft)] text-[var(--accent)]"
                : "border-[var(--border-light)] bg-[rgba(255,255,255,0.025)] text-[var(--text-tertiary)] hover:bg-[var(--surface-hover)]"
            }`}
          >
            <span className="font-mono text-[10px] opacity-70">{code}</span> {label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Input label="Distance (km)" value={distance} onChange={setDistance} placeholder="5.0" step="0.1" />
        <Input label="Duration (min)" value={duration} onChange={setDuration} placeholder="30" />
        <Input label="Avg HR" value={hr} onChange={setHr} placeholder="145" />
        <Input label="Notes" value={notes} onChange={setNotes} placeholder="Evening run" />
      </div>
      <button type="submit" disabled={saving || !duration} className="premium-action w-full">
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
      <label className="premium-label mb-1 block">{label}</label>
      <input type="number" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} step={step} min="0" className="w-full" />
    </div>
  );
}
