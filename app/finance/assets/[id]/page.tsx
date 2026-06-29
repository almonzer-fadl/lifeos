import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { centsToDollars } from "@/lib/money";

export const dynamic = "force-dynamic";

function f$(cents: number) { return centsToDollars(cents).toFixed(2); }
function s$(cents: number) { return Math.round(centsToDollars(cents)).toLocaleString(); }

export default async function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const asset = await db.asset.findUnique({ where: { id } });
  if (!asset) notFound();

  const pnl = asset.currentValue - asset.purchaseValue;
  const pnlPct = asset.purchaseValue > 0 ? ((asset.currentValue - asset.purchaseValue) / asset.purchaseValue) * 100 : 0;

  return (
    <div className="premium-page animate-fade-in">
      <div className="premium-header animate-fade-in flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2"><Link href="/finance/assets" className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg></Link><span className="rounded border border-[rgba(215,181,109,0.24)] bg-[rgba(215,181,109,0.08)] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[var(--accent)]">{asset.type}</span></div>
          <h1 className="premium-title">{asset.name}</h1>
          <p className="premium-subtitle">{asset.currency}</p>
        </div>
        <div className="text-right"><div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Current Value</div><div className="font-mono text-3xl font-semibold text-[var(--accent)]">{f$(asset.currentValue)}</div></div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="premium-stat"><div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Purchase</div><div className="mt-2 font-mono text-lg font-semibold text-[var(--text)]">{f$(asset.purchaseValue)}</div></div>
        <div className="premium-stat"><div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Current</div><div className="mt-2 font-mono text-lg font-semibold text-[var(--text)]">{f$(asset.currentValue)}</div></div>
        <div className={`premium-stat`}><div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Gain/Loss</div><div className={`mt-2 font-mono text-lg font-semibold ${pnl >= 0 ? "text-[var(--emerald)]" : "text-[var(--rose)]"}`}>{pnl >= 0 ? "+" : ""}{f$(pnl)}</div></div>
        <div className="premium-stat"><div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Return</div><div className={`mt-2 font-mono text-lg font-semibold ${pnlPct >= 0 ? "text-[var(--emerald)]" : "text-[var(--rose)]"}`}>{pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%</div></div>
      </div>
      <section className="premium-panel animate-fade-in">
        <div className="mb-3 flex items-center justify-between gap-3"><h2 className="text-sm font-semibold text-[var(--text)]">Details</h2><span className="rounded border border-[var(--border-light)] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Registered {format(new Date(asset.createdAt), "MMM d, yyyy")}</span></div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-[var(--text-tertiary)]">Type</span><span className="capitalize text-[var(--text)]">{asset.type}</span></div>
          <div className="flex justify-between"><span className="text-[var(--text-tertiary)]">Currency</span><span className="text-[var(--text)]">{asset.currency}</span></div>
          <div className="flex justify-between"><span className="text-[var(--text-tertiary)]">Purchase Value</span><span className="font-mono text-[var(--text)]">{f$(asset.purchaseValue)}</span></div>
          <div className="flex justify-between"><span className="text-[var(--text-tertiary)]">Current Value</span><span className="font-mono text-[var(--accent)]">{f$(asset.currentValue)}</span></div>
          <div className="flex justify-between"><span className="text-[var(--text-tertiary)]">Unrealized P&L</span><span className={`font-mono ${pnl >= 0 ? "text-[var(--emerald)]" : "text-[var(--rose)]"}`}>{pnl >= 0 ? "+" : ""}{f$(pnl)} ({pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%)</span></div>
        </div>
      </section>
    </div>
  );
}
