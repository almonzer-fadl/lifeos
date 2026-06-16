"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Account = { id: string; name: string; currency: string };
type Category = { id: string; name: string; type: string };

const inputClass = "w-full border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-tertiary)]";

export function TransactionForm({ accounts, categories, currencies }: { accounts: Account[]; categories: Category[]; currencies: string[] }) {
  const router = useRouter();
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(currencies[0] || "USD");
  const [accountId, setAccountId] = useState(accounts[0]?.id || "");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const filtered = categories.filter((c) => c.type === type);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !accountId) return;
    setSaving(true);
    await fetch("/api/finance/transactions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, amount: parseFloat(amount), currency, accountId, categoryId: categoryId || null, description: description || null }) });
    setAmount(""); setDescription(""); setSaving(false); router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-1 rounded-lg border border-[var(--border-light)] bg-[var(--bg)] p-1">
        <button type="button" onClick={() => setType("expense")} className={`rounded-md py-2 text-xs font-semibold uppercase tracking-wide transition-all active:scale-[0.99] ${type === "expense" ? "bg-[var(--rose-soft)] text-[var(--rose)]" : "text-[var(--text-tertiary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-secondary)]"}`}>Expense</button>
        <button type="button" onClick={() => setType("income")} className={`rounded-md py-2 text-xs font-semibold uppercase tracking-wide transition-all active:scale-[0.99] ${type === "income" ? "bg-[var(--emerald-soft)] text-[var(--emerald)]" : "text-[var(--text-tertiary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-secondary)]"}`}>Income</button>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
        <F label="Amount"><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="50.00" step="0.01" min="0" className={`${inputClass} font-mono`} required /></F>
        <F label="Currency"><select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClass}>{["USD", "EUR", "TRY", "MYR", "SAR", "GBP"].map((c) => <option key={c} value={c}>{c}</option>)}</select></F>
        <F label="Account"><select value={accountId} onChange={(e) => setAccountId(e.target.value)} className={inputClass} required><option value="">Select...</option>{accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></F>
        <F label="Category"><select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}><option value="">None</option>{filtered.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></F>
      </div>
      <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className={inputClass} />
      <button type="submit" disabled={saving || !amount || !accountId} className="w-full rounded-lg border border-[rgba(115,167,216,0.34)] bg-[var(--sky-soft)] px-3 py-2.5 text-sm font-semibold text-[var(--sky)] shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] transition-all hover:border-[rgba(115,167,216,0.55)] hover:bg-[rgba(115,167,216,0.18)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-35">
        {saving ? "Saving..." : `Add ${type}`}
      </button>
    </form>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">{label}</label>{children}</div>;
}
