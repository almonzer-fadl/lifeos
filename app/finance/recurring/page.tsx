"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { centsToDollars } from "@/lib/money";
import { toast } from "@/lib/toast";

function s$(cents: number) { return Math.round(centsToDollars(cents)).toLocaleString(); }

interface RecurringItem {
  id: string;
  type: string;
  amount: number;
  currency: string;
  description: string;
  frequency: string;
  nextDate: string;
  account: { name: string };
  category: { name: string } | null;
}

interface ForecastDay {
  date: string;
  income: number;
  expense: number;
  balance: number;
}

export default function RecurringPage() {
  const [data, setData] = useState<{ items: RecurringItem[]; monthlyOutflow: number; forecast: ForecastDay[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/finance/recurring")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  async function skip(id: string) {
    const res = await fetch("/api/finance/recurring", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (res.ok) {
      toast.success("Advanced to next occurrence");
      const d = await fetch("/api/finance/recurring").then((r) => r.json());
      setData(d);
    } else {
      toast.error("Failed");
    }
  }

  if (loading) return <div className="premium-page animate-fade-in"><div className="skeleton h-20 w-full rounded-lg mb-3" /><div className="skeleton h-60 w-full rounded-lg" /></div>;
  if (!data) return <div className="premium-page animate-fade-in"><section className="premium-panel"><p className="py-8 text-center text-sm text-[var(--text-tertiary)]">Could not load data.</p></section></div>;

  const upcoming = data.items.filter((r) => new Date(r.nextDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  const later = data.items.filter((r) => new Date(r.nextDate) > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

  return (
    <div className="premium-page animate-fade-in">
      <div className="premium-header animate-fade-in flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><div className="premium-kicker">Forward Obligations</div><h1 className="premium-title">Recurring Bills</h1><p className="premium-subtitle">{data.items.length} scheduled payments</p></div>
        <div className="text-right"><div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Monthly Outflow</div><div className="font-mono text-2xl font-semibold text-[var(--amber)]">{s$(data.monthlyOutflow)}</div></div>
      </div>

      {data.items.length === 0 ? (
        <section className="premium-panel animate-fade-in"><div className="flex flex-col items-center justify-center py-16 px-4 text-center"><div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div><h3 className="mb-1 text-sm font-semibold text-[var(--text)]">No recurring bills</h3><p className="mb-4 max-w-xs text-xs text-[var(--text-tertiary)]">Schedule your subscriptions, bills, and recurring payments.</p><Link href="/finance/recurring/new" className="premium-action">Add Bill</Link></div></section>
      ) : (
        <>
          <Section title="Upcoming (30 Days)" kicker={`${upcoming.length}`}>
            <div className="space-y-1">{upcoming.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-[var(--surface-hover)]">
                <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium text-[var(--text)]">{r.description}</div><div className="mt-0.5 flex items-center gap-2"><span className="text-xs capitalize text-[var(--text-tertiary)]">{r.frequency}</span><span className="text-xs text-[var(--text-tertiary)]">{r.account.name}</span><span className="text-xs text-[var(--amber)]">Due {format(new Date(r.nextDate), "MMM d")}</span></div></div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`font-mono text-sm font-semibold ${r.type === "expense" ? "text-[var(--rose)]" : "text-[var(--emerald)]"}`}>{r.type === "expense" ? "-" : "+"}{s$(r.amount)} {r.currency}</span>
                  <button onClick={() => skip(r.id)} className="rounded border border-[var(--border-light)] px-1.5 py-0.5 text-[9px] text-[var(--text-tertiary)] hover:text-[var(--accent)]" title="Skip to next">→</button>
                </div>
              </div>
            ))}</div>
          </Section>
          {later.length > 0 && (
            <Section title="Later" kicker={`${later.length}`}>
              <div className="space-y-1">{later.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-[var(--surface-hover)]"><div className="min-w-0 flex-1"><div className="truncate text-sm font-medium text-[var(--text)]">{r.description}</div><div className="mt-0.5 text-xs text-[var(--text-tertiary)]">Next {format(new Date(r.nextDate), "MMM d, yyyy")}</div></div><span className="shrink-0 font-mono text-sm font-semibold text-[var(--text-secondary)]">{s$(r.amount)} {r.currency}</span></div>
              ))}</div>
            </Section>
          )}
        </>
      )}

      {data.forecast.length > 0 && (
        <Section title="Cashflow Forecast" kicker="30D">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b border-[var(--border)]"><th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Date</th><th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">In</th><th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Out</th><th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Balance</th></tr></thead>
              <tbody>
                {data.forecast.filter((d) => d.income > 0 || d.expense > 0).slice(0, 14).map((d) => (
                  <tr key={d.date} className="border-b border-[var(--border-light)] hover:bg-[var(--surface-hover)]">
                    <td className="px-3 py-2 text-xs text-[var(--text-tertiary)]">{format(new Date(d.date + "T00:00:00"), "EEE, MMM d")}</td>
                    <td className="px-3 py-2 text-right font-mono text-sm text-[var(--emerald)]">{d.income > 0 ? `+${s$(d.income)}` : "—"}</td>
                    <td className="px-3 py-2 text-right font-mono text-sm text-[var(--rose)]">{d.expense > 0 ? `-${s$(d.expense)}` : "—"}</td>
                    <td className={`px-3 py-2 text-right font-mono text-sm font-semibold ${d.balance >= 0 ? "text-[var(--text)]" : "text-[var(--rose)]"}`}>{s$(d.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, kicker, children }: { title: string; kicker: string; children: React.ReactNode }) {
  return <section className="premium-panel animate-fade-in"><div className="mb-3 flex items-center justify-between gap-3"><h2 className="text-sm font-semibold text-[var(--text)]">{title}</h2><span className="rounded border border-[var(--border-light)] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">{kicker}</span></div>{children}</section>;
}
