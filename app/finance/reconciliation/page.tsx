"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { centsToDollars } from "@/lib/money";
import { toast } from "@/lib/toast";

function f$(cents: number) { return centsToDollars(cents).toFixed(2); }

interface ReconData {
  accountId: string;
  accountName: string;
  statementDate: string;
  statementBalance: number;
  clearedBalance: number;
  difference: number;
  isReconciled: boolean;
  transactionCounts: { total: number; pending: number; cleared: number; reconciled: number };
  pendingTransactions: { id: string; date: string; description: string | null; amount: number; status: string; type: string }[];
}

export default function ReconciliationPage() {
  const router = useRouter();
  const [accountId, setAccountId] = useState("");
  const [accounts, setAccounts] = useState<{ id: string; name: string }[]>([]);
  const [statementBalance, setStatementBalance] = useState("");
  const [statementDate, setStatementDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReconData | null>(null);

  useState(() => {
    fetch("/api/finance/accounts").then((r) => r.json()).then(setAccounts);
  });

  async function check() {
    if (!accountId || !statementBalance || !statementDate) return;
    setLoading(true);
    const res = await fetch("/api/finance/reconciliation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId, statementBalance, statementDate }),
    });
    if (res.ok) setData(await res.json());
    setLoading(false);
  }

  async function finishReconciliation() {
    if (!accountId || !statementDate || !data || data.difference !== 0) return;
    const res = await fetch("/api/finance/reconciliation", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId, statementDate }),
    });
    if (res.ok) {
      toast.success("Reconciliation complete");
      router.refresh();
      setData(null);
    } else {
      toast.error("Failed to complete reconciliation");
    }
  }

  const inputClass = "w-full border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-tertiary)]";

  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in"><div className="premium-kicker">Audit Workspace</div><h1 className="premium-title">Reconciliation</h1><p className="premium-subtitle">Match your ledger to bank statements</p></div>

      <section className="premium-panel animate-fade-in">
        <h2 className="premium-panel-title mb-3">Statement Details</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div><label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Account</label><select value={accountId} onChange={(e) => setAccountId(e.target.value)} className={inputClass}><option value="">Select...</option>{accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
          <div><label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Statement Balance</label><input type="number" value={statementBalance} onChange={(e) => setStatementBalance(e.target.value)} step="0.01" placeholder="0.00" className={inputClass} /></div>
          <div><label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Statement Date</label><input type="date" value={statementDate} onChange={(e) => setStatementDate(e.target.value)} className={inputClass} /></div>
        </div>
        <button onClick={check} disabled={loading || !accountId || !statementBalance} className="premium-action w-full mt-4">{loading ? "Checking..." : "Check Reconciliation"}</button>
      </section>

      {data && (
        <>
          <div className="grid grid-cols-3 gap-2">
            <div className="premium-stat"><div className="premium-label">Statement</div><div className="premium-value font-mono">{f$(data.statementBalance)}</div></div>
            <div className="premium-stat"><div className="premium-label">Cleared</div><div className="premium-value font-mono">{f$(data.clearedBalance)}</div></div>
            <div className="premium-stat"><div className="premium-label">Difference</div><div className={`premium-value font-mono ${data.difference === 0 ? "text-[var(--emerald)]" : "text-[var(--rose)]"}`}>{data.difference > 0 ? "+" : ""}{f$(data.difference)}</div></div>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="premium-stat"><div className="premium-label">Total</div><div className="premium-value">{data.transactionCounts.total}</div></div>
            <div className="premium-stat"><div className="premium-label">Pending</div><div className="premium-value text-[var(--amber)]">{data.transactionCounts.pending}</div></div>
            <div className="premium-stat"><div className="premium-label">Cleared</div><div className="premium-value text-[var(--sky)]">{data.transactionCounts.cleared}</div></div>
            <div className="premium-stat"><div className="premium-label">Reconciled</div><div className="premium-value text-[var(--emerald)]">{data.transactionCounts.reconciled}</div></div>
          </div>
          {data.isReconciled ? (
            <button onClick={finishReconciliation} className="premium-action w-full">Finish Reconciliation</button>
          ) : (
            <section className="premium-panel animate-fade-in"><h2 className="premium-panel-title mb-3">Pending Transactions</h2>
              <div className="space-y-1">{data.pendingTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded px-3 py-2 bg-[var(--surface)]"><span className="text-sm text-[var(--text-secondary)]">{t.description || "Transaction"}</span><span className="font-mono text-sm text-[var(--text)]">{f$(t.amount)}</span></div>
              ))}</div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
