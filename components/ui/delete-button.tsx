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
      className="rounded-md border border-[rgba(255,95,109,0.22)] bg-[rgba(255,95,109,0.06)] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-tertiary)] transition-colors hover:border-[rgba(255,95,109,0.42)] hover:text-[var(--rose)] disabled:opacity-40"
    >
      {busy ? "..." : label}
    </button>
  );
}
