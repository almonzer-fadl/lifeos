"use client";

import { useState, useEffect } from "react";
import { centsToDollars } from "@/lib/money";
import { toast } from "@/lib/toast";

function s$(cents: number) { return Math.round(centsToDollars(cents)).toLocaleString(); }
function f$(cents: number) { return centsToDollars(cents).toFixed(2); }

interface DebtAccount {
  id: string;
  name: string;
  initialBalance: number;
  interestRate: number | null;
  minimumPayment: number | null;
  creditLimit: number | null;
  paymentDueDay: number | null;
}

interface PayoffPlan {
  name: string;
  monthsToPayoff: number;
  totalInterest: number;
  totalPaid: number;
  monthlyPayment: number;
  schedule: { month: number; payment: number; interest: number; principal: number; balance: number }[];
}

export default function DebtsPage() {
  const [debts, setDebts] = useState<DebtAccount[]>([]);
  const [strategy, setStrategy] = useState<"snowball" | "avalanche">("avalanche");
  const [extraPayment, setExtraPayment] = useState("0");
  const [plan, setPlan] = useState<PayoffPlan[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/finance/accounts")
      .then((r) => r.json())
      .then((accounts) => setDebts(accounts.filter((a: any) => a.isDebt)))
      .finally(() => setLoading(false));
  }, []);

  function calculate() {
    const debtsList = [...debts].map((d) => ({
      ...d,
      balance: Math.abs(d.initialBalance),
      rate: (d.interestRate || 0) / 100 / 12, // monthly rate
      minPayment: d.minimumPayment || Math.abs(d.initialBalance) * 0.02 || 10000,
    }));

    if (strategy === "avalanche") {
      debtsList.sort((a, b) => b.rate - a.rate); // highest interest first
    } else {
      debtsList.sort((a, b) => a.balance - b.balance); // smallest balance first
    }

    const extra = Math.round(parseFloat(extraPayment || "0") * 100);
    const plans: PayoffPlan[] = [];

    for (const debt of debtsList) {
      let balance = debt.balance;
      let month = 0;
      let totalInterest = 0;
      const schedule: PayoffPlan["schedule"] = [];

      while (balance > 0 && month < 600) {
        month++;
        const interest = Math.round(balance * debt.rate);
        totalInterest += interest;
        let payment = debt.minPayment;

        // Extra payment goes to this debt (first in sorted list)
        if (plans.length === 0 && month === 1) payment += extra;

        const principal = Math.min(payment - interest, balance);
        balance -= principal;
        if (balance < 0) balance = 0;

        if (month <= 12 || balance === 0) {
          schedule.push({ month, payment, interest, principal, balance });
        }
      }

      plans.push({
        name: debt.name,
        monthsToPayoff: month,
        totalInterest,
        totalPaid: debt.balance + totalInterest,
        monthlyPayment: debt.minPayment,
        schedule: schedule.slice(0, 12),
      });
    }

    setPlan(plans);
  }

  if (loading) return <div className="premium-page"><div className="skeleton h-20 w-full rounded-lg mb-3" /><div className="skeleton h-40 w-full rounded-lg" /></div>;

  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in"><div className="premium-kicker">Liability Command</div><h1 className="premium-title">Debt Planner</h1><p className="premium-subtitle">{debts.length} liabilities · Snowball & Avalanche strategies</p></div>

      {debts.length === 0 ? (
        <section className="premium-panel animate-fade-in"><p className="py-10 text-center text-sm text-[var(--text-tertiary)]">No liabilities tracked. Add a credit card, loan, or mortgage account.</p></section>
      ) : (
        <>
          <section className="premium-panel animate-fade-in">
            <h2 className="premium-panel-title mb-3">Strategy</h2>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button onClick={() => setStrategy("snowball")} className={`rounded-lg border px-4 py-3 text-sm font-semibold transition-all ${strategy === "snowball" ? "border-[var(--border-strong)] bg-[var(--surface-raised)] text-[var(--text)]" : "border-[var(--border-light)] text-[var(--text-tertiary)]"}`}>Snowball<small className="block text-[10px] font-normal text-[var(--text-tertiary)]">Smallest balance first</small></button>
              <button onClick={() => setStrategy("avalanche")} className={`rounded-lg border px-4 py-3 text-sm font-semibold transition-all ${strategy === "avalanche" ? "border-[var(--border-strong)] bg-[var(--surface-raised)] text-[var(--text)]" : "border-[var(--border-light)] text-[var(--text-tertiary)]"}`}>Avalanche<small className="block text-[10px] font-normal text-[var(--text-tertiary)]">Highest interest first</small></button>
            </div>
            <div className="flex gap-3 items-end">
              <div className="flex-1"><label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Extra Monthly Payment</label><input type="number" value={extraPayment} onChange={(e) => setExtraPayment(e.target.value)} placeholder="0" className="w-full border-[var(--border)] bg-[var(--bg)] text-[var(--text)]" /></div>
              <button onClick={calculate} className="premium-action">Calculate</button>
            </div>
          </section>

          <section className="premium-panel animate-fade-in">
            <h2 className="premium-panel-title mb-3">Current Debts</h2>
            <div className="space-y-2">{debts.map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-lg border border-[var(--border-light)] bg-[var(--surface)] p-3">
                <div><div className="text-sm font-semibold text-[var(--text)]">{d.name}</div><div className="text-xs text-[var(--text-tertiary)]">{d.interestRate ? `${d.interestRate}% APR` : "No APR"}{d.minimumPayment ? ` · Min ${f$(d.minimumPayment)}/mo` : ""}</div></div>
                <span className="font-mono text-sm font-semibold text-[var(--rose)]">{f$(Math.abs(d.initialBalance))}</span>
              </div>
            ))}</div>
          </section>

          {plan && (
            <section className="premium-panel animate-fade-in">
              <h2 className="premium-panel-title mb-3">Payoff Plan ({strategy})</h2>
              <div className="space-y-4">
                {plan.map((p) => (
                  <div key={p.name} className="rounded-lg border border-[var(--border-light)] bg-[var(--surface)] p-4">
                    <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold text-[var(--text)]">{p.name}</h3><span className="premium-chip">{p.monthsToPayoff} months</span></div>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center"><div className="text-xs text-[var(--text-tertiary)]">Total Paid</div><div className="font-mono text-sm text-[var(--text)]">{s$(p.totalPaid)}</div></div>
                      <div className="text-center"><div className="text-xs text-[var(--text-tertiary)]">Interest</div><div className="font-mono text-sm text-[var(--rose)]">{s$(p.totalInterest)}</div></div>
                      <div className="text-center"><div className="text-xs text-[var(--text-tertiary)]">Payment</div><div className="font-mono text-sm text-[var(--text)]">{s$(p.monthlyPayment)}/mo</div></div>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--border-light)] overflow-hidden"><div className="h-full rounded-full bg-[var(--emerald)]" style={{ width: `${Math.min(100, (p.schedule.length / 12) * 100)}%` }} /></div>
                    <div className="mt-2 text-[10px] text-[var(--text-tertiary)]">{p.monthsToPayoff <= 12 ? "Under 1 year" : `${(p.monthsToPayoff / 12).toFixed(1)} years`}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
