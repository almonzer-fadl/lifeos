"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";

export default function NewHabitPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [timeOfDay, setTimeOfDay] = useState("");
  const [saving, setSaving] = useState(false);

  const inputClass = "w-full border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-tertiary)]";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;
    setSaving(true);
    try {
      const res = await fetch("/api/productivity/habits", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, frequency, timeOfDay: timeOfDay || null }) });
      if (!res.ok) throw new Error();
      toast.success("Habit created");
      router.push("/habits");
      router.refresh();
    } catch { toast.error("Failed to create habit"); } finally { setSaving(false); }
  }

  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in"><div className="premium-kicker">New Practice</div><h1 className="premium-title">Create Habit</h1><p className="premium-subtitle">Build consistency with daily tracking</p></div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <section className="premium-panel animate-fade-in">
          <h2 className="premium-panel-title mb-3">Details</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <F label="Name"><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Read 30 minutes" className={inputClass} required /></F>
            <F label="Frequency"><select value={frequency} onChange={(e) => setFrequency(e.target.value)} className={inputClass}><option value="daily">Daily</option><option value="weekly">Weekly</option></select></F>
            <F label="Time of Day"><select value={timeOfDay} onChange={(e) => setTimeOfDay(e.target.value)} className={inputClass}><option value="">Any</option><option value="morning">Morning</option><option value="afternoon">Afternoon</option><option value="evening">Evening</option></select></F>
          </div>
        </section>
        <div className="flex gap-3"><button type="button" onClick={() => router.back()} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-6 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] active:scale-[0.99]">Cancel</button><button type="submit" disabled={saving || !name} className="flex-1 rounded-lg border border-[rgba(215,181,109,0.34)] bg-[rgba(215,181,109,0.14)] px-6 py-2.5 text-sm font-semibold text-[var(--accent)] shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] transition-all hover:border-[rgba(215,181,109,0.55)] hover:bg-[rgba(215,181,109,0.2)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-35">{saving ? "Creating..." : "Create Habit"}</button></div>
      </form>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">{label}</label>{children}</div>;
}
