"use client";

import { useState } from "react";
import { format } from "date-fns";
import { centsToDollars } from "@/lib/money";

function f$(cents: number) { return centsToDollars(cents).toFixed(2); }

type TxEntry = {
  id: string;
  date: Date;
  description: string | null;
  category: { name: string } | null;
  type: string;
  amount: number;
  balance: number;
  status: string;
};

export function TransactionLedger({ transactions }: { transactions: TxEntry[] }) {
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? transactions.filter((t) => {
        const q = search.toLowerCase();
        return (
          (t.description || "").toLowerCase().includes(q) ||
          (t.category?.name || "").toLowerCase().includes(q)
        );
      })
    : transactions;

  return (
    <section className="premium-panel animate-fade-in">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-[var(--text)]">Transaction Ledger</h2>
        <span className="rounded border border-[var(--border-light)] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">{filtered.length} entries</span>
      </div>

      <div className="mb-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search transactions..."
          className="w-full"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-[var(--text-tertiary)]">{search ? "No transactions match your search" : "No transactions yet"}</p>
          <p className="text-xs text-[var(--text-tertiary)]">{search ? "Try a different search term" : "Add your first transaction above"}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Date</th>
                <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Description</th>
                <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Category</th>
                <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Amount</th>
                <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Balance</th>
                <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Status</th>
              </tr>
            </thead>
            <tbody className="animate-stagger">
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-[var(--border-light)] transition-colors hover:bg-[var(--surface-hover)]">
                  <td className="px-3 py-2.5 text-xs text-[var(--text-tertiary)] whitespace-nowrap">{format(new Date(t.date), "MMM d")}</td>
                  <td className="px-3 py-2.5 text-sm text-[var(--text)] truncate max-w-[200px]">{t.description || "—"}</td>
                  <td className="px-3 py-2.5 text-xs text-[var(--text-tertiary)]">{t.category?.name || "—"}</td>
                  <td className={`px-3 py-2.5 text-right font-mono text-sm font-semibold whitespace-nowrap ${t.type === "income" ? "text-[var(--emerald)]" : t.type === "expense" ? "text-[var(--rose)]" : "text-[var(--text-tertiary)]"}`}>{t.type === "income" ? "+" : t.type === "expense" ? "-" : ""}{f$(t.amount)}</td>
                  <td className={`px-3 py-2.5 text-right font-mono text-sm font-semibold whitespace-nowrap ${t.balance >= 0 ? "text-[var(--text)]" : "text-[var(--rose)]"}`}>{f$(t.balance)}</td>
                  <td className="px-3 py-2.5 text-[10px] capitalize text-[var(--text-tertiary)]">{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
