"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ConfirmSheet } from "@/components/ui/confirm-sheet";
import { toast } from "@/lib/toast";

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
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="New habit..." className="min-w-0" required />
      <select value={frequency} onChange={e => setFrequency(e.target.value)} className="w-full sm:w-28">
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>
      <select value={timeOfDay} onChange={e => setTimeOfDay(e.target.value)} className="w-full sm:w-28">
        <option value="">Anytime</option>
        <option value="morning">Morning</option>
        <option value="afternoon">Afternoon</option>
        <option value="evening">Evening</option>
        <option value="night">Night</option>
      </select>
      <button type="submit" disabled={saving || !name.trim()} className="rounded-lg border border-[rgba(220,193,122,0.34)] bg-[var(--accent-soft)] px-4 py-2 text-sm font-semibold text-[var(--accent)] transition-all hover:bg-[rgba(220,193,122,0.2)] disabled:opacity-40 active:scale-[0.97]">
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

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  async function deleteHabit() {
    setBusy(true);
    try {
      const res = await fetch(`/api/productivity/habits?id=${habit.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success(`"${habit.name}" deleted`);
      router.refresh();
    } catch {
      toast.error("Failed to delete habit");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
    <div className={`flex items-center gap-3 rounded-lg border p-4 transition-all ${isDone ? "border-[rgba(66,211,146,0.3)] bg-[var(--emerald-soft)]" : "border-[var(--border)] bg-[var(--surface-raised)] shadow-[var(--shadow-card)]"} ${busy ? "opacity-50" : ""}`}>
      <button onClick={toggle} disabled={busy} className={`h-7 w-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${isDone ? "bg-[var(--emerald)] border-[var(--emerald)]" : "border-[var(--border-strong)] hover:border-[var(--emerald)]"}`}>
        {isDone && <svg className="h-4 w-4 text-[#020304]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
      </button>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-semibold ${isDone ? "text-[var(--emerald)]" : "text-[var(--text)]"}`}>{habit.name}</div>
        <div className="text-xs text-[var(--text-tertiary)]">{habit.frequency === "daily" ? "Daily" : `${habit.frequencyCount}x ${habit.frequency}`}{habit.timeOfDay ? ` · ${habit.timeOfDay}` : ""}</div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-lg font-bold text-[var(--text)] font-mono">{streak > 0 ? streak : "—"}</div>
        <div className="text-[10px] text-[var(--text-tertiary)] font-medium">streak</div>
      </div>
      <button onClick={() => setShowDeleteConfirm(true)} disabled={busy} className="text-[var(--text-tertiary)] hover:text-[var(--rose)] text-lg leading-none ml-1 transition-colors" title="Delete">×</button>
    </div>
    <ConfirmSheet
      open={showDeleteConfirm}
      onOpenChange={setShowDeleteConfirm}
      title={`Delete "${habit.name}"?`}
      description="This habit and all its history will be permanently removed."
      confirmLabel="Delete"
      destructive
      onConfirm={deleteHabit}
    />
    </>
  );
}
