"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmSheet } from "@/components/ui/confirm-sheet";
import { toast } from "@/lib/toast";

export function DeleteButton({
  url,
  label = "Delete",
  itemName = "this entry",
}: {
  url: string;
  label?: string;
  itemName?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleDelete() {
    setBusy(true);
    try {
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success(`${itemName} deleted`);
      router.refresh();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={busy}
        className="rounded-md border border-[rgba(255,95,109,0.22)] bg-[rgba(255,95,109,0.06)] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-tertiary)] transition-colors hover:border-[rgba(255,95,109,0.42)] hover:text-[var(--rose)] disabled:opacity-40"
      >
        {busy ? "..." : label}
      </button>

      <ConfirmSheet
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title={`Delete ${itemName}?`}
        description="This action cannot be undone. The entry will be permanently removed."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </>
  );
}
