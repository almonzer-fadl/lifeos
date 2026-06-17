"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { centsToDollars } from "@/lib/money";
import { SwipeableRow } from "@/components/ui/swipeable-row";
import { toast } from "@/lib/toast";

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

export function TransactionLedger({ transactions: initialTransactions }: { transactions: TxEntry[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [transactions, setTransactions] = useState(initialTransactions);

  async function deleteTransaction(id: string) {
    const optimistic = [...transactions];
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    try {
      const res = await fetch(`/api/finance/transactions?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Transaction deleted");
      router.refresh();
    } catch {
      setTransactions(optimistic);
      toast.error("Failed to delete transaction");
    }
  }

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
          <table className="w-full min-w-[580px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)] w-[4ch]">Date</th>
                <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Description</th>
                <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)] w-[80px]">Cat</th>
                <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)] w-[90px]">Amount</th>
                <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)] w-[100px]">Balance</th>
                <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)] w-[70px]">Stat</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
              {filtered.map((t) => (
                <motion.tr
                  key={t.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0, x: 40 }}
                  transition={{ duration: 0.2 }}
                >
                  <td colSpan={6} className="p-0">
                    <SwipeableRow
                      actions={[
                        {
                          label: "Delete",
                          destructive: true,
                          onPress: () => deleteTransaction(t.id),
                        },
                      ]}
                      className="border-b border-[var(--border-light)]"
                    >
                      <div className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-[var(--surface-hover)] bg-[var(--bg)]">
                        <span className="text-xs text-[var(--text-tertiary)] whitespace-nowrap w-[4ch]">{format(new Date(t.date), "MMM d")}</span>
                        <span className="flex-1 text-sm text-[var(--text)] truncate max-w-[200px]">{t.description || "—"}</span>
                        <span className="text-xs text-[var(--text-tertiary)] w-[80px] truncate">{t.category?.name || "—"}</span>
                        <span className={`text-right font-mono text-sm font-semibold whitespace-nowrap w-[80px] ${t.type === "income" ? "text-[var(--emerald)]" : t.type === "expense" ? "text-[var(--rose)]" : "text-[var(--text-tertiary)]"}`}>{t.type === "income" ? "+" : t.type === "expense" ? "-" : ""}{f$(t.amount)}</span>
                        <span className={`text-right font-mono text-sm font-semibold whitespace-nowrap w-[90px] ${t.balance >= 0 ? "text-[var(--text)]" : "text-[var(--rose)]"}`}>{f$(t.balance)}</span>
                        <span className="text-[10px] capitalize text-[var(--text-tertiary)] w-[70px]">{t.status}</span>
                      </div>
                    </SwipeableRow>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            </tbody>
          </table>
          <div className="px-3 py-2 text-[10px] text-[var(--text-tertiary)] text-center">← swipe left to delete entry</div>
        </div>
      )}
    </section>
  );
}
