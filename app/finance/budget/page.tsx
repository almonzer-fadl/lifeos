"use client";

import { useState, useEffect, useCallback } from "react";
import { centsToDollars } from "@/lib/money";
import { toast } from "@/lib/toast";

function f$(cents: number) { return centsToDollars(cents).toFixed(2); }
function s$(cents: number) { return Math.round(centsToDollars(cents)).toLocaleString(); }

interface Envelope {
  categoryId: string;
  categoryName: string;
  budgetId: string | null;
  assigned: number;
  activity: number;
  available: number;
}

interface BudgetData {
  month: string;
  monthlyIncome: number;
  availableToAssign: number;
  totalAssigned: number;
  totalActivity: number;
  envelopes: Envelope[];
  incomeCategories: { id: string; name: string }[];
}

export default function BudgetPage() {
  const now = new Date();
  const [month, setMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
  const [data, setData] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editCat, setEditCat] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");

  const fetchBudget = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/finance/budget?month=${month}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, [month]);

  useEffect(() => { fetchBudget(); }, [fetchBudget]);

  async function assign(categoryId: string, amount: string) {
    const res = await fetch("/api/finance/budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId, month, amount }),
    });
    if (res.ok) {
      toast.success("Budget updated");
      fetchBudget();
    } else {
      toast.error("Failed to update budget");
    }
    setEditCat(null);
  }

  function quickAssign(categoryId: string, addCents: number) {
    const current = data?.envelopes.find((e) => e.categoryId === categoryId)?.assigned || 0;
    const newAmount = (current + addCents) / 100;
    assign(categoryId, String(newAmount));
  }

  function changeMonth(dir: number) {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(y, m - 1 + dir, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  const monthLabel = new Date(month + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="premium-kicker">Envelope System</div>
          <h1 className="premium-title">Budget</h1>
          <p className="premium-subtitle">Give every dollar a job</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => changeMonth(-1)} className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]">←</button>
          <span className="font-mono text-sm font-semibold text-[var(--text)] min-w-[120px] text-center">{monthLabel}</span>
          <button onClick={() => changeMonth(1)} className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]">→</button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="skeleton h-20 w-full rounded-lg" />
          <div className="skeleton h-60 w-full rounded-lg" />
        </div>
      ) : !data ? (
        <section className="premium-panel animate-fade-in"><p className="py-8 text-center text-sm text-[var(--text-tertiary)]">Could not load budget data.</p></section>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2">
            <div className="premium-stat"><div className="premium-label">Income</div><div className="premium-value text-[var(--emerald)]">+{s$(data.monthlyIncome)}</div></div>
            <div className="premium-stat"><div className="premium-label">Assigned</div><div className="premium-value text-[var(--amber)]">{s$(data.totalAssigned)}</div></div>
            <div className="premium-stat">
              <div className="premium-label">To Assign</div>
              <div className={`premium-value ${data.availableToAssign >= 0 ? "text-[var(--emerald)]" : "text-[var(--rose)]"}`}>{s$(data.availableToAssign)}</div>
            </div>
          </div>

          <section className="premium-panel animate-fade-in">
            <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold text-[var(--text)]">Envelopes</h2><span className="rounded border border-[var(--border-light)] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">{data.envelopes.length} categories</span></div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Category</th>
                    <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Assigned</th>
                    <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Activity</th>
                    <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Available</th>
                    <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]"></th>
                  </tr>
                </thead>
                <tbody>
                  {data.envelopes.map((e) => (
                    <tr key={e.categoryId} className={`border-b border-[var(--border-light)] transition-colors hover:bg-[var(--surface-hover)] ${e.available < 0 ? "bg-[var(--rose-soft)]" : ""}`}>
                      <td className="px-3 py-2.5 text-sm font-medium text-[var(--text)]">{e.categoryName}</td>
                      <td className="px-3 py-2.5 text-right">
                        {editCat === e.categoryId ? (
                          <form onSubmit={(ev) => { ev.preventDefault(); assign(e.categoryId, editAmount); }} className="flex items-center gap-1 justify-end">
                            <input type="number" value={editAmount} onChange={(ev) => setEditAmount(ev.target.value)} step="0.01" className="w-20 text-right font-mono text-sm border-[var(--border)] bg-[var(--bg)] text-[var(--text)] px-2 py-1 rounded" autoFocus />
                            <button type="submit" className="text-[10px] text-[var(--accent)] font-semibold">Save</button>
                          </form>
                        ) : (
                          <button onClick={() => { setEditCat(e.categoryId); setEditAmount((e.assigned / 100).toFixed(2)); }} className="font-mono text-sm font-semibold text-[var(--accent)] hover:underline">{f$(e.assigned)}</button>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-sm text-[var(--text-tertiary)]">{e.activity > 0 ? `-${s$(e.activity)}` : "0"}</td>
                      <td className={`px-3 py-2.5 text-right font-mono text-sm font-semibold ${e.available >= 0 ? "text-[var(--emerald)]" : "text-[var(--rose)]"}`}>{f$(e.available)}</td>
                      <td className="px-2 py-2.5">
                        <div className="flex gap-1">
                          <button onClick={() => quickAssign(e.categoryId, 1000)} className="rounded border border-[var(--border-light)] px-1.5 py-0.5 text-[9px] text-[var(--text-tertiary)] hover:text-[var(--text)]">+10</button>
                          <button onClick={() => quickAssign(e.categoryId, 5000)} className="rounded border border-[var(--border-light)] px-1.5 py-0.5 text-[9px] text-[var(--text-tertiary)] hover:text-[var(--text)]">+50</button>
                          <button onClick={() => quickAssign(e.categoryId, 10000)} className="rounded border border-[var(--border-light)] px-1.5 py-0.5 text-[9px] text-[var(--text-tertiary)] hover:text-[var(--text)]">+100</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="premium-panel animate-fade-in">
            <h2 className="premium-panel-title mb-3">Income Sources</h2>
            <div className="space-y-1">
              {data.incomeCategories.length === 0 ? (
                <p className="text-sm text-[var(--text-tertiary)]">No income categories defined.</p>
              ) : (
                data.incomeCategories.map((c) => (
                  <div key={c.id} className="rounded px-3 py-2 text-sm text-[var(--text-secondary)]">{c.name}</div>
                ))
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
