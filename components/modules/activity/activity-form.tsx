"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ACTIVITY_TYPES = [
  { value: "run", label: "Run", icon: "🏃" },
  { value: "swim", label: "Swim", icon: "🏊" },
  { value: "bike", label: "Bike", icon: "🚴" },
  { value: "walk", label: "Walk", icon: "🚶" },
  { value: "hike", label: "Hike", icon: "🥾" },
  { value: "other", label: "Other", icon: "💪" },
];

export function ActivityForm() {
  const router = useRouter();
  const [type, setType] = useState("run");
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState(""); // minutes
  const [heartRate, setHeartRate] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);
    const now = new Date();
    const durationMin = parseFloat(duration);
    const endTime = durationMin
      ? new Date(now.getTime() + durationMin * 60000).toISOString()
      : null;

    await fetch("/api/health/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        startTime: now.toISOString(),
        endTime,
        distance: distance ? parseFloat(distance) * 1000 : null, // km to meters
        heartRateAvg: heartRate ? parseInt(heartRate) : null,
        notes: notes || null,
      }),
    });

    setDistance("");
    setDuration("");
    setHeartRate("");
    setNotes("");
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {ACTIVITY_TYPES.map(({ value, label, icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setType(value)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              type === value
                ? "bg-blue-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div>
          <label className="text-xs text-zinc-500 block mb-1">Distance (km)</label>
          <input
            type="number"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            placeholder="5.0"
            step="0.1"
            min="0"
            className="w-full"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500 block mb-1">Duration (min)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="30"
            step="1"
            min="0"
            className="w-full"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500 block mb-1">Avg HR</label>
          <input
            type="number"
            value={heartRate}
            onChange={(e) => setHeartRate(e.target.value)}
            placeholder="145"
            step="1"
            min="0"
            className="w-full"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500 block mb-1">Notes</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Evening run"
            className="w-full"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={saving || !duration}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {saving ? "Saving..." : "Log Activity"}
      </button>
    </form>
  );
}
