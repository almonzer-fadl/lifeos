"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";

export function WaterForm() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount) return;
    setSaving(true);
    try {
      const res = await fetch("/api/health/water", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amountMl: parseInt(amount) }) });
      if (!res.ok) throw new Error();
      toast.success("Water logged");
      router.push("/nutrition");
    } catch { toast.error("Failed to log water"); } finally { setSaving(false); }
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
