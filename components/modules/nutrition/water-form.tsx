"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function WaterForm() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount) return;
    setSaving(true);
    await fetch("/api/health/water", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountMl: parseInt(amount) }),
    });
    setAmount("");
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <div>
        <label className="text-[11px] font-medium text-stone-400 block mb-1">Water (ml)</label>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="250" step="50" min="50" className="w-24" required />
      </div>
      <button type="submit" disabled={saving} className="px-4 py-2 bg-cyan-600 text-white rounded-xl text-sm font-semibold hover:bg-cyan-700 disabled:opacity-40 transition-all active:scale-[0.97] shadow-sm">Add Water</button>
    </form>
  );
}
