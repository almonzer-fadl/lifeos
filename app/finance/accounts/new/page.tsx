"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";

export default function NewAccountPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState("checking");
  const [currency, setCurrency] = useState("USD");
  const [initialBalance, setInitialBalance] = useState("0");
  const [isDebt, setIsDebt] = useState(false);
  const [interestRate, setInterestRate] = useState("");
  const [minPayment, setMinPayment] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [saving, setSaving] = useState(false);

  const inputClass = "w-full border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-tertiary)]";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;
    setSaving(true);
    try {
      const res = await fetch("/api/finance/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          type,
          currency,
          initialBalance: parseFloat(initialBalance) || 0,
          isDebt,
          interestRate: interestRate ? parseFloat(interestRate) : null,
          minimumPayment: minPayment ? parseFloat(minPayment) : null,
          creditLimit: creditLimit ? parseFloat(creditLimit) : null,
          paymentDueDay: dueDay ? parseInt(dueDay) : null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Account created");
      router.push("/finance/accounts");
      router.refresh();
    } catch {
      toast.error("Failed to create account");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in">
        <div className="premium-kicker">New Entry</div>
        <h1 className="premium-title">Create Account</h1>
        <p className="premium-subtitle">Checking, savings, credit, loans, and investments</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <section className="premium-panel animate-fade-in">
          <h2 className="premium-panel-title mb-3">Account Type</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(["checking", "savings", "cash", "credit", "investment", "loan", "mortgage"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setType(t); setIsDebt(t === "loan" || t === "mortgage" || t === "credit"); }}
                className={`rounded-lg border px-3 py-3 text-xs font-semibold capitalize transition-all ${
                  type === t
                    ? (t === "loan" || t === "mortgage" || t === "credit")
                      ? "border-[rgba(255,95,109,0.34)] bg-[var(--rose-soft)] text-[var(--rose)]"
                      : "border-[rgba(215,181,109,0.34)] bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "border-[var(--border-light)] text-[var(--text-tertiary)] hover:border-[var(--border)] hover:text-[var(--text-secondary)]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        <section className="premium-panel animate-fade-in">
          <h2 className="premium-panel-title mb-3">Details</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <F label="Account Name">
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Main Checking" className={inputClass} required />
            </F>
            <F label="Currency">
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClass}>
                {["USD", "EUR", "TRY", "MYR", "SAR", "GBP"].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </F>
            <F label="Initial Balance">
              <input type="number" value={initialBalance} onChange={(e) => setInitialBalance(e.target.value)} step="0.01" className={`${inputClass} font-mono`} />
            </F>
          </div>
        </section>

        {isDebt && (
          <section className="premium-panel animate-fade-in border-[rgba(255,95,109,0.22)]">
            <h2 className="premium-panel-title mb-3 text-[var(--rose)]">Liability Details</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <F label="Interest Rate (%)">
                <input type="number" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} placeholder="5.5" step="0.1" className={inputClass} />
              </F>
              <F label="Minimum Payment">
                <input type="number" value={minPayment} onChange={(e) => setMinPayment(e.target.value)} placeholder="200" step="0.01" className={`${inputClass} font-mono`} />
              </F>
              <F label="Credit Limit">
                <input type="number" value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)} placeholder="5000" step="0.01" className={`${inputClass} font-mono`} />
              </F>
              <F label="Payment Due Day">
                <input type="number" value={dueDay} onChange={(e) => setDueDay(e.target.value)} placeholder="15" min="1" max="31" className={inputClass} />
              </F>
            </div>
          </section>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-6 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] active:scale-[0.99]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !name}
            className="flex-1 rounded-lg border border-[rgba(215,181,109,0.34)] bg-[rgba(215,181,109,0.14)] px-6 py-2.5 text-sm font-semibold text-[var(--accent)] shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] transition-all hover:border-[rgba(215,181,109,0.55)] hover:bg-[rgba(215,181,109,0.2)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-35"
          >
            {saving ? "Creating..." : "Create Account"}
          </button>
        </div>
      </form>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">{label}</label>{children}</div>;
}
