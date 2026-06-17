"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";

export default function NewGoalPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("0");
  const [currency, setCurrency] = useState("USD");
  const [saving, setSaving] = useState(false);

  const inputClass = "w-full border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-tertiary)]";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !targetAmount) return;
    setSaving(true);
    try {
      const res = await fetch("/api/finance/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, targetAmount: parseFloat(targetAmount), currentAmount: parseFloat(currentAmount) || 0, currency }),
      });
      if (!res.ok) throw new Error();
      toast.success("Goal created");
      router.push("/finance/goals");
    } catch {
      toast.error("Failed to create goal");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="premium-page animate-fade-in">
      <div className="premium-header animate-fade-in">
        <div className="premium-kicker">New Target</div>
        <h1 className="premium-title">Set Goal</h1>
        <p className="premium-subtitle">Define a financial target and track progress</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <section className="premium-panel animate-fade-in">
          <h2 className="premium-panel-title mb-3">Goal Details</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <F label="Goal Name"><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Emergency Fund" className={inputClass} required /></F>
            <F label="Currency"><select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClass}>{["USD", "EUR", "TRY", "MYR", "SAR", "GBP"].map((c) => <option key={c} value={c}>{c}</option>)}</select></F>
            <F label="Target Amount"><input type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder="10000" step="0.01" className={`${inputClass} font-mono`} required /></F>
            <F label="Current Amount"><input type="number" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} placeholder="0" step="0.01" className={`${inputClass} font-mono`} /></F>
          </div>
        </section>

        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-6 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] active:scale-[0.99]">Cancel</button>
          <button type="submit" disabled={saving || !name || !targetAmount} className="flex-1 rounded-lg border border-[rgba(215,181,109,0.34)] bg-[rgba(215,181,109,0.14)] px-6 py-2.5 text-sm font-semibold text-[var(--accent)] shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] transition-all hover:border-[rgba(215,181,109,0.55)] hover:bg-[rgba(215,181,109,0.2)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-35">{saving ? "Creating..." : "Set Goal"}</button>
        </div>
      </form>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">{label}</label>{children}</div>;
}
