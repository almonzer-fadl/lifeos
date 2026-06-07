"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Account = { id: string; name: string; currency: string };
type Category = { id: string; name: string; type: string };

export function TransactionForm({ accounts, categories, currencies }: { accounts: Account[]; categories: Category[]; currencies: string[] }) {
  const router = useRouter();
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(currencies[0] || "USD");
  const [accountId, setAccountId] = useState(accounts[0]?.id || "");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const filtered = categories.filter(c => c.type === type);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !accountId) return;
    setSaving(true);
    await fetch("/api/finance/transactions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, amount: parseFloat(amount), currency, accountId, categoryId: categoryId || null, description: description || null }) });
    setAmount(""); setDescription(""); setSaving(false); router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-1.5">
        <button type="button" onClick={() => setType("expense")} className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all active:scale-[0.97] ${type === "expense" ? "bg-rose-100 text-rose-700 border border-rose-300 shadow-sm" : "bg-stone-50 text-stone-500 border border-[var(--border-light)]"}`}>Expense</button>
        <button type="button" onClick={() => setType("income")} className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all active:scale-[0.97] ${type === "income" ? "bg-emerald-100 text-emerald-700 border border-emerald-300 shadow-sm" : "bg-stone-50 text-stone-500 border border-[var(--border-light)]"}`}>Income</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <F label="Amount"><input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="50.00" step="0.01" min="0" className="w-full" required /></F>
        <F label="Currency"><select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full">{["USD","EUR","TRY","MYR","SAR","GBP"].map(c => <option key={c} value={c}>{c}</option>)}</select></F>
        <F label="Account"><select value={accountId} onChange={e => setAccountId(e.target.value)} className="w-full" required><option value="">Select...</option>{accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></F>
        <F label="Category"><select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full"><option value="">None</option>{filtered.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></F>
      </div>
      <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="w-full" />
      <button type="submit" disabled={saving || !amount || !accountId} className="w-full py-2.5 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700 disabled:opacity-40 transition-all active:scale-[0.98] shadow-sm">{saving ? "Saving..." : `Add ${type}`}</button>
    </form>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-[11px] font-medium text-stone-400 block mb-1">{label}</label>{children}</div>;
}
