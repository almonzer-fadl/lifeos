"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

type Habit = {
  id: string;
  name: string;
  frequency: string;
  frequencyCount: number;
  timeOfDay: string | null;
  logs: { id: string; date: Date; completed: boolean }[];
};

export function CreateHabitForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [timeOfDay, setTimeOfDay] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await fetch("/api/productivity/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, frequency, timeOfDay: timeOfDay || null }),
    });
    setName(""); setTimeOfDay("");
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="New habit..." className="flex-1" required />
      <select value={frequency} onChange={e => setFrequency(e.target.value)} className="w-28">
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>
      <select value={timeOfDay} onChange={e => setTimeOfDay(e.target.value)} className="w-28">
        <option value="">Anytime</option>
        <option value="morning">Morning</option>
        <option value="afternoon">Afternoon</option>
        <option value="evening">Evening</option>
        <option value="night">Night</option>
      </select>
      <button type="submit" disabled={saving || !name.trim()} className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 disabled:opacity-40 transition-all active:scale-[0.97] shadow-sm">
        Add
      </button>
    </form>
  );
}

export function HabitCard({ habit }: { habit: Habit }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  const todayLog = habit.logs.find(l => format(new Date(l.date), "yyyy-MM-dd") === todayStr);
  const isDone = todayLog?.completed ?? false;

  // Streak
  let streak = 0;
  const sorted = [...habit.logs].filter(l => l.completed).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  for (let i = 0; i < sorted.length; i++) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    if (format(new Date(sorted[i].date), "yyyy-MM-dd") === format(d, "yyyy-MM-dd")) streak++;
    else break;
  }

  async function toggle() {
    setBusy(true);
    if (isDone) {
      // Delete today's log
      if (todayLog) {
        await fetch(`/api/productivity/habits/log?id=${todayLog.id}`, { method: "DELETE" });
      }
    } else {
      await fetch("/api/productivity/habits/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitId: habit.id, completed: true }),
      });
    }
    setBusy(false);
    router.refresh();
  }

  async function deleteHabit() {
    if (!confirm(`Delete habit "${habit.name}"?`)) return;
    setBusy(true);
    await fetch(`/api/productivity/habits?id=${habit.id}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${isDone ? "bg-emerald-50/50 border-emerald-200" : "bg-white border-[var(--border)] shadow-[var(--shadow-card)]"} ${busy ? "opacity-50" : ""}`}>
      <button onClick={toggle} disabled={busy} className={`h-7 w-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${isDone ? "bg-emerald-500 border-emerald-500" : "border-stone-300 hover:border-emerald-400"}`}>
        {isDone && <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
      </button>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-semibold ${isDone ? "text-emerald-700" : "text-stone-700"}`}>{habit.name}</div>
        <div className="text-xs text-stone-400">{habit.frequency === "daily" ? "Daily" : `${habit.frequencyCount}x ${habit.frequency}`}{habit.timeOfDay ? ` · ${habit.timeOfDay}` : ""}</div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-lg font-bold text-stone-700 font-mono">{streak > 0 ? streak : "—"}</div>
        <div className="text-[10px] text-stone-400 font-medium">streak</div>
      </div>
      <button onClick={deleteHabit} disabled={busy} className="text-stone-300 hover:text-rose-500 text-lg leading-none ml-1 transition-colors" title="Delete">×</button>
    </div>
  );
}
