"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Account = { id: string; name: string; currency: string };
type Category = { id: string; name: string; type: string };

export function TransactionForm({
  accounts,
  categories,
  currencies,
}: {
  accounts: Account[];
  categories: Category[];
  currencies: string[];
}) {
  const router = useRouter();
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(currencies[0] || "USD");
  const [accountId, setAccountId] = useState(accounts[0]?.id || "");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const filteredCategories = categories.filter((c) => c.type === type);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !accountId) return;

    setSaving(true);
    await fetch("/api/finance/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        amount: parseFloat(amount),
        currency,
        accountId,
        categoryId: categoryId || null,
        description: description || null,
      }),
    });

    setAmount("");
    setDescription("");
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setType("expense")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${type === "expense" ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-400"}`}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => setType("income")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${type === "income" ? "bg-green-600 text-white" : "bg-zinc-800 text-zinc-400"}`}
        >
          Income
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div>
          <label className="text-xs text-zinc-500 block mb-1">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="50.00"
            step="0.01"
            min="0"
            className="w-full"
            required
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500 block mb-1">Currency</label>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full">
            {["USD", "EUR", "TRY", "MYR", "SAR", "GBP"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-zinc-500 block mb-1">Account</label>
          <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="w-full" required>
            <option value="">Select...</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-zinc-500 block mb-1">Category</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full">
            <option value="">None</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="w-full"
        />
      </div>

      <button
        type="submit"
        disabled={saving || !amount || !accountId}
        className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-500 disabled:opacity-50 transition-colors"
      >
        {saving ? "Saving..." : `Add ${type}`}
      </button>
    </form>
  );
}
