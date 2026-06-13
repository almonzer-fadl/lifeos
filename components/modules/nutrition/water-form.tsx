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
    <form onSubmit={handleSubmit} className="grid grid-cols-[1fr_auto] gap-2 items-end">
      <div>
        <label className="premium-label mb-1 block">Water (ml)</label>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="250" step="50" min="50" className="w-full" required />
      </div>
      <button type="submit" disabled={saving} className="premium-action">Add Water</button>
    </form>
  );
}
