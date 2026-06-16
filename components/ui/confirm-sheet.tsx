"use client";

import { Sheet } from "./sheet";

interface ConfirmSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
}

export function ConfirmSheet({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  destructive = true,
  onConfirm,
}: ConfirmSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={title}>
      <p className="text-sm text-[var(--text-secondary)] mb-6">{description}</p>
      <div className="flex gap-3">
        <button
          onClick={() => onOpenChange(false)}
          className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] active:scale-[0.99]"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            onConfirm();
            onOpenChange(false);
          }}
          className={
            destructive
              ? "flex-1 rounded-lg border border-[rgba(255,95,109,0.34)] bg-[var(--rose-soft)] px-4 py-2.5 text-sm font-semibold text-[var(--rose)] transition-colors hover:bg-[rgba(255,95,109,0.14)] active:scale-[0.99]"
              : "flex-1 rounded-lg border border-[rgba(215,181,109,0.34)] bg-[var(--accent-soft)] px-4 py-2.5 text-sm font-semibold text-[var(--accent)] transition-colors hover:bg-[rgba(215,181,109,0.16)] active:scale-[0.99]"
          }
        >
          {confirmLabel}
        </button>
      </div>
    </Sheet>
  );
}
