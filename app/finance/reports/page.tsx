"use client";

import { useState, useEffect } from "react";
import { centsToDollars } from "@/lib/money";

function s$(cents: number) { return Math.round(centsToDollars(cents)).toLocaleString(); }

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [months, setMonths] = useState(12);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/finance/reports?months=${months}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [months]);

  if (loading) return <div className="premium-page"><div className="skeleton h-20 w-full rounded-lg mb-3" /><div className="skeleton h-60 w-full rounded-lg mb-3" /><div className="skeleton h-40 w-full rounded-lg" /></div>;

  if (!data) return <div className="premium-page"><section className="premium-panel"><p className="py-8 text-center text-sm text-[var(--text-tertiary)]">No data available.</p></section></div>;

  const monthlySorted = Object.entries(data.monthly).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><div className="premium-kicker">Analytics</div><h1 className="premium-title">Reports</h1><p className="premium-subtitle">Last {months} months</p></div>
        <select value={months} onChange={(e) => setMonths(parseInt(e.target.value))} className="border-[var(--border)] bg-[var(--bg)] text-[var(--text)] rounded-md px-3 py-1.5 text-sm">
          {[3, 6, 12, 24].map((m) => <option key={m} value={m}>{m} months</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="premium-stat"><div className="premium-label">Total Income</div><div className="premium-value text-[var(--emerald)]">+{s$(data.summary.totalIncome)}</div></div>
        <div className="premium-stat"><div className="premium-label">Total Expenses</div><div className="premium-value text-[var(--rose)]">-{s$(data.summary.totalExpense)}</div></div>
        <div className="premium-stat"><div className="premium-label">Net Savings</div><div className={`premium-value ${data.summary.netSavings >= 0 ? "text-[var(--emerald)]" : "text-[var(--rose)]"}`}>{s$(data.summary.netSavings)}</div></div>
        <div className="premium-stat"><div className="premium-label">Savings Rate</div><div className="premium-value text-[var(--accent)]">{data.summary.savingsRate}%</div></div>
      </div>

      <section className="premium-panel animate-fade-in">
        <h2 className="premium-panel-title mb-3">Monthly Income vs Expenses</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b border-[var(--border)]"><th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Month</th><th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Income</th><th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Expenses</th><th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Net</th></tr></thead>
            <tbody>
              {monthlySorted.map(([month, m]: [string, any]) => (
                <tr key={month} className="border-b border-[var(--border-light)] hover:bg-[var(--surface-hover)]">
                  <td className="px-3 py-2 text-xs text-[var(--text-secondary)]">{month}</td>
                  <td className="px-3 py-2 text-right font-mono text-sm text-[var(--emerald)]">{m.income > 0 ? `+${s$(m.income)}` : "—"}</td>
                  <td className="px-3 py-2 text-right font-mono text-sm text-[var(--rose)]">{m.expense > 0 ? `-${s$(m.expense)}` : "—"}</td>
                  <td className={`px-3 py-2 text-right font-mono text-sm font-semibold ${m.net >= 0 ? "text-[var(--emerald)]" : "text-[var(--rose)]"}`}>{m.net >= 0 ? "+" : ""}{s$(m.net)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {data.categoryBreakdown.length > 0 && (
        <section className="premium-panel animate-fade-in">
          <h2 className="premium-panel-title mb-3">Spending by Category</h2>
          <div className="space-y-2">
            {data.categoryBreakdown.slice(0, 10).map((c: any) => (
              <div key={c.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm"><span className="text-[var(--text-secondary)]">{c.name}</span><span className="font-mono text-[var(--rose)]">{s$(c.amount)}</span></div>
                <div className="h-1.5 rounded-full bg-[var(--border-light)] overflow-hidden"><div className="h-full rounded-full bg-[var(--rose)]" style={{ width: `${data.summary.totalExpense > 0 ? Math.min((c.amount / data.summary.totalExpense) * 100, 100) : 0}%` }} /></div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="premium-panel animate-fade-in">
        <h2 className="premium-panel-title mb-3">Accounts & Assets</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="premium-stat"><div className="premium-label">Accounts</div><div className="premium-value">{data.summary.accountCount}</div></div>
          <div className="premium-stat"><div className="premium-label">Assets</div><div className="premium-value">{data.summary.assetCount}</div></div>
          <div className="premium-stat"><div className="premium-label">Goals</div><div className="premium-value">{data.summary.goalCount}</div></div>
          <div className="premium-stat"><div className="premium-label">Period</div><div className="premium-value text-lg">{months}m</div></div>
        </div>
      </section>
    </div>
  );
}
