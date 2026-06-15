"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SleepForm() {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [bedTime, setBedTime] = useState("23:00");
  const [wakeTime, setWakeTime] = useState("07:00");
  const [quality, setQuality] = useState("3");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const start = new Date(`${date}T${bedTime}:00`);
    const end = new Date(`${date}T${wakeTime}:00`);
    if (end <= start) end.setDate(end.getDate() + 1); // next day

    await fetch("/api/health/sleep", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        quality: parseInt(quality),
        notes: notes || null,
      }),
    });

    setNotes("");
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end">
      <div>
        <label className="text-xs text-zinc-500 block mb-1">Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full" required />
      </div>
      <div>
        <label className="text-xs text-zinc-500 block mb-1">Bedtime</label>
        <input type="time" value={bedTime} onChange={(e) => setBedTime(e.target.value)} className="w-full" required />
      </div>
      <div>
        <label className="text-xs text-zinc-500 block mb-1">Wake time</label>
        <input type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} className="w-full" required />
      </div>
      <div>
        <label className="text-xs text-zinc-500 block mb-1">Quality (1-5)</label>
        <select value={quality} onChange={(e) => setQuality(e.target.value)} className="w-full">
          {[1, 2, 3, 4, 5].map((q) => (
            <option key={q} value={q}>{q} {"⭐".repeat(q)}</option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-500 disabled:opacity-50 transition-colors"
      >
        {saving ? "Saving..." : "Log Sleep"}
      </button>
    </form>
  );
}
