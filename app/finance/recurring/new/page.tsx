"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";

export default function NewRecurringPage() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [frequency, setFrequency] = useState("monthly");
  const [saving, setSaving] = useState(false);

  const inputClass = "w-full border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-tertiary)]";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description || !amount) return;
    setSaving(true);
    const now = new Date();
    try {
      const res = await fetch("/api/finance/recurring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, type, amount: parseFloat(amount), currency, frequency, startDate: now.toISOString(), nextDate: now.toISOString() }),
      });
      if (!res.ok) throw new Error();
      toast.success("Recurring bill added");
      router.push("/finance/recurring");
      router.refresh();
    } catch {
      toast.error("Failed to add recurring bill");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in">
        <div className="premium-kicker">New Schedule</div>
        <h1 className="premium-title">Add Recurring</h1>
        <p className="premium-subtitle">Schedule a bill, subscription, or recurring income</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <section className="premium-panel animate-fade-in">
          <h2 className="premium-panel-title mb-3">Type</h2>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setType("expense")} className={`rounded-lg border px-4 py-3 text-xs font-semibold uppercase tracking-wide transition-all ${
              type === "expense" ? "border-[rgba(255,95,109,0.34)] bg-[var(--rose-soft)] text-[var(--rose)]" : "border-[var(--border-light)] text-[var(--text-tertiary)] hover:border-[var(--border)] hover:text-[var(--text-secondary)]"
            }`}>Bill / Expense</button>
            <button type="button" onClick={() => setType("income")} className={`rounded-lg border px-4 py-3 text-xs font-semibold uppercase tracking-wide transition-all ${
              type === "income" ? "border-[rgba(66,211,146,0.34)] bg-[var(--emerald-soft)] text-[var(--emerald)]" : "border-[var(--border-light)] text-[var(--text-tertiary)] hover:border-[var(--border)] hover:text-[var(--text-secondary)]"
            }`}>Income</button>
          </div>
        </section>

        <section className="premium-panel animate-fade-in">
          <h2 className="premium-panel-title mb-3">Details</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <F label="Description"><input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Netflix" className={inputClass} required /></F>
            <F label="Amount"><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="15.99" step="0.01" className={`${inputClass} font-mono`} required /></F>
            <F label="Currency"><select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClass}>{["USD", "EUR", "TRY", "MYR", "SAR", "GBP"].map((c) => <option key={c} value={c}>{c}</option>)}</select></F>
            <F label="Frequency"><select value={frequency} onChange={(e) => setFrequency(e.target.value)} className={inputClass}><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select></F>
          </div>
        </section>

        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-6 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] active:scale-[0.99]">Cancel</button>
          <button type="submit" disabled={saving || !description || !amount} className="flex-1 rounded-lg border border-[rgba(215,181,109,0.34)] bg-[rgba(215,181,109,0.14)] px-6 py-2.5 text-sm font-semibold text-[var(--accent)] shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] transition-all hover:border-[rgba(215,181,109,0.55)] hover:bg-[rgba(215,181,109,0.2)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-35">{saving ? "Adding..." : "Add Recurring"}</button>
        </div>
      </form>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">{label}</label>{children}</div>;
}
