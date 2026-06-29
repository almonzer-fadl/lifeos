"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";

export default function NewAssetPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState("investment");
  const [purchaseValue, setPurchaseValue] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [saving, setSaving] = useState(false);

  const inputClass = "w-full border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-tertiary)]";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;
    setSaving(true);
    try {
      const res = await fetch("/api/finance/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, purchaseValue: parseFloat(purchaseValue) || 0, currentValue: parseFloat(currentValue) || parseFloat(purchaseValue) || 0, currency }),
      });
      if (!res.ok) throw new Error();
      toast.success("Asset added");
      router.push("/finance/assets");
    } catch {
      toast.error("Failed to add asset");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="premium-page animate-fade-in">
      <div className="premium-header animate-fade-in">
        <div className="premium-kicker">New Holding</div>
        <h1 className="premium-title">Add Asset</h1>
        <p className="premium-subtitle">Investment, property, vehicle, crypto, or collectible</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <section className="premium-panel animate-fade-in">
          <h2 className="premium-panel-title mb-3">Asset Type</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(["investment", "property", "vehicle", "crypto", "gold", "collectible", "other"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`rounded-lg border px-3 py-3 text-xs font-semibold capitalize transition-all ${
                  type === t
                    ? "border-[rgba(215,181,109,0.34)] bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "border-[var(--border-light)] text-[var(--text-tertiary)] hover:border-[var(--border)] hover:text-[var(--text-secondary)]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        <section className="premium-panel animate-fade-in">
          <h2 className="premium-panel-title mb-3">Valuation</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <F label="Asset Name"><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Bitcoin, House" className={inputClass} required /></F>
            <F label="Currency"><select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClass}>{["USD", "EUR", "TRY", "MYR", "SAR", "GBP"].map((c) => <option key={c} value={c}>{c}</option>)}</select></F>
            <F label="Purchase Value"><input type="number" value={purchaseValue} onChange={(e) => setPurchaseValue(e.target.value)} placeholder="10000" step="0.01" className={`${inputClass} font-mono`} /></F>
            <F label="Current Value"><input type="number" value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} placeholder="12000" step="0.01" className={`${inputClass} font-mono`} /></F>
          </div>
        </section>

        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-6 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] active:scale-[0.99]">Cancel</button>
          <button type="submit" disabled={saving || !name} className="flex-1 rounded-lg border border-[rgba(215,181,109,0.34)] bg-[rgba(215,181,109,0.14)] px-6 py-2.5 text-sm font-semibold text-[var(--accent)] shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] transition-all hover:border-[rgba(215,181,109,0.55)] hover:bg-[rgba(215,181,109,0.2)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-35">{saving ? "Adding..." : "Add Asset"}</button>
        </div>
      </form>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">{label}</label>{children}</div>;
}
