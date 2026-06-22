"use client";

import { useState, useEffect } from "react";
import { centsToDollars } from "@/lib/money";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";

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

  const monthlySorted: [string, any][] = Object.entries(data.monthly).sort(([a], [b]) => a.localeCompare(b));

  const chartData = monthlySorted.map(([month, m]) => ({
    month,
    income: Math.round(centsToDollars(m.income)),
    expense: Math.round(centsToDollars(m.expense)),
    net: Math.round(centsToDollars(m.net)),
  }));

  const netWorthData = (data.netWorthTrend || []).map((n: any) => ({
    month: n.month,
    value: Math.round(centsToDollars(n.netWorth)),
  }));

  const categoryChartData = (data.categoryBreakdown || []).slice(0, 8).map((c: any) => ({
    name: c.name,
    value: Math.round(centsToDollars(c.amount)),
  }));

  const catColors = ["var(--rose)", "var(--amber)", "var(--sky)", "var(--violet)", "var(--orange)", "var(--indigo)", "var(--text-tertiary)", "var(--text-secondary)"];

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

      {chartData.length > 0 && (
        <section className="premium-panel animate-fade-in">
          <h2 className="premium-panel-title mb-4">Income vs Expenses</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="month" tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} axisLine={{ stroke: "var(--border)" }} />
                <YAxis tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} axisLine={{ stroke: "var(--border)" }} />
                <Tooltip contentStyle={{ background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 13 }} />
                <Line type="monotone" dataKey="income" stroke="var(--emerald)" strokeWidth={2} dot={false} name="Income" />
                <Line type="monotone" dataKey="expense" stroke="var(--rose)" strokeWidth={2} dot={false} name="Expenses" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {categoryChartData.length > 0 && (
        <section className="premium-panel animate-fade-in">
          <h2 className="premium-panel-title mb-4">Spending by Category</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} layout="vertical" margin={{ left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" horizontal={false} />
                <XAxis type="number" tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} axisLine={{ stroke: "var(--border)" }} />
                <YAxis type="category" dataKey="name" tick={{ fill: "var(--text-secondary)", fontSize: 12 }} axisLine={false} tickLine={false} width={100} />
                <Tooltip contentStyle={{ background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)" }} formatter={(v: number) => [`${v.toLocaleString()}`, "Amount"]} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {categoryChartData.map((_, i) => <Cell key={i} fill={catColors[i % catColors.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {netWorthData.length > 0 && (
        <section className="premium-panel animate-fade-in">
          <h2 className="premium-panel-title mb-4">Net Worth Trend</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={netWorthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="month" tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} axisLine={{ stroke: "var(--border)" }} />
                <YAxis tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} axisLine={{ stroke: "var(--border)" }} />
                <Tooltip contentStyle={{ background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)" }} formatter={(v: number) => [v.toLocaleString(), "Net Worth"]} />
                <Line type="monotone" dataKey="value" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--accent)" }} name="Net Worth" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      <section className="premium-panel animate-fade-in">
        <h2 className="premium-panel-title mb-3">Monthly Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b border-[var(--border)]"><th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Month</th><th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Income</th><th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Expenses</th><th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Net</th></tr></thead>
            <tbody>
              {monthlySorted.map(([month, m]) => (
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
    </div>
  );
}
