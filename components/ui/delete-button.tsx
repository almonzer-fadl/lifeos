"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteButton({ url, label = "Delete" }: { url: string; label?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this entry?")) return;
    setBusy(true);
    await fetch(url, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={busy}
      className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-white border border-[var(--border)] text-stone-400 hover:text-rose-500 hover:border-rose-300 transition-colors"
    >
      {busy ? "..." : label}
    </button>
  );
}
