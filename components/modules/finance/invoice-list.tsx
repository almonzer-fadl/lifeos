"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { formatMYR } from "@/lib/runway";

interface InvoiceSummary {
  id: string;
  invoiceNumber: string;
  clientId: string;
  status: string;
  total: number;
  currency: string;
  issuedDate: string;
  dueDate: string;
  paidDate: string | null;
  lineItems: { description: string; amount: number }[];
  payments: { amount: number }[];
}

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: {
    label: "Draft",
    className: "bg-[rgba(255,255,255,0.05)] text-[var(--text-tertiary)]",
  },
  sent: {
    label: "Sent",
    className: "bg-[var(--amber-soft)] text-[var(--amber)]",
  },
  paid: {
    label: "Paid",
    className: "bg-[var(--emerald-soft)] text-[var(--emerald)]",
  },
  overdue: {
    label: "Overdue",
    className: "bg-[var(--rose-soft)] text-[var(--rose)]",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-[rgba(255,255,255,0.03)] text-[var(--text-tertiary)] line-through",
  },
};

export function InvoiceList() {
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/finance/invoices?limit=10")
      .then((r) => r.json())
      .then(setInvoices)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="premium-panel animate-fade-in">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--text)]">Invoices</h2>
        </div>
        <div className="mt-3 h-16 animate-pulse rounded-xl bg-[rgba(255,255,255,0.02)]" />
      </div>
    );
  }

  const paidTotal = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.total, 0);
  const outstandingTotal = invoices
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .reduce((sum, i) => sum + i.total, 0);

  return (
    <div className="premium-panel animate-fade-in">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--text)]">Invoices</h2>
        <span className="rounded border border-[var(--border-light)] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
          {invoices.length}
        </span>
      </div>

      {/* Summary bar */}
      {invoices.length > 0 && (
        <div className="mb-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-[rgba(255,255,255,0.02)] p-2">
            <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
              Collected
            </div>
            <div className="font-serif text-sm text-[var(--emerald)]">
              {formatMYR(paidTotal)}
            </div>
          </div>
          <div className="rounded-lg bg-[rgba(255,255,255,0.02)] p-2">
            <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
              Outstanding
            </div>
            <div className="font-serif text-sm text-[var(--amber)]">
              {formatMYR(outstandingTotal)}
            </div>
          </div>
        </div>
      )}

      {/* Invoice list */}
      {invoices.length === 0 ? (
        <p className="py-3 text-center text-xs text-[var(--text-tertiary)]">
          No invoices yet
        </p>
      ) : (
        <div className="space-y-1">
          {invoices.slice(0, 5).map((inv) => {
            const cfg = statusConfig[inv.status] || statusConfig.draft;
            const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
            const remaining = inv.total - paid;

            return (
              <Link
                key={inv.id}
                href={`/finance/invoices/${inv.id}`}
                className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-[rgba(255,255,255,0.03)]"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-[var(--text)]">
                    {inv.invoiceNumber}
                  </div>
                  <div className="text-[10px] text-[var(--text-tertiary)]">
                    {inv.lineItems[0]?.description || "No items"}
                    {inv.lineItems.length > 1 && ` +${inv.lineItems.length - 1} more`}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-xs font-semibold tabular-nums text-[var(--text)]">
                    {formatMYR(inv.total)}
                  </span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${cfg.className}`}
                  >
                    {cfg.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Footer link */}
      <div className="mt-3 border-t border-[var(--border-light)] pt-3">
        <Link
          href="/finance/invoices"
          className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--accent)] hover:underline"
        >
          View all invoices &rarr;
        </Link>
      </div>
    </div>
  );
}
