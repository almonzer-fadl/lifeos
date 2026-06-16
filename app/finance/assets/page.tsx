import Link from "next/link";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { centsToDollars } from "@/lib/money";

export const dynamic = "force-dynamic";

function s$(cents: number) { return Math.round(centsToDollars(cents)).toLocaleString(); }

export default async function AssetsPage() {
  const assets = await db.asset.findMany({ orderBy: { createdAt: "desc" } });
  const totalValue = assets.reduce((s, a) => s + a.currentValue, 0);
  const totalCost = assets.reduce((s, a) => s + a.purchaseValue, 0);

  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><div className="premium-kicker">Capital Holdings</div><h1 className="premium-title">Assets</h1><p className="premium-subtitle">{assets.length} holdings tracked</p></div>
        <div className="text-right"><div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Total Value</div><div className="font-mono text-2xl font-semibold text-[var(--accent)]">{s$(totalValue)}</div><div className="text-[10px] text-[var(--text-tertiary)]">Gain {s$(totalValue - totalCost)}</div></div>
      </div>
      {assets.length === 0 ? (
        <section className="premium-panel animate-fade-in"><div className="flex flex-col items-center justify-center py-16 px-4 text-center"><div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg></div><h3 className="mb-1 text-sm font-semibold text-[var(--text)]">No assets tracked</h3><p className="mb-4 max-w-xs text-xs text-[var(--text-tertiary)]">Track investments, property, vehicles, and other holdings.</p><Link href="/finance/assets/new" className="premium-action">Add Asset</Link></div></section>
      ) : (
        <section className="premium-panel animate-fade-in">
          <div className="space-y-2">{assets.map((a) => { const pnl = a.currentValue - a.purchaseValue; return (
            <Link key={a.id} href={`/finance/assets/${a.id}`} className="flex items-center justify-between gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-[var(--surface-hover)]">
              <div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold text-[var(--text)]">{a.name}</div><div className="mt-0.5 flex items-center gap-2"><span className="rounded border border-[rgba(215,181,109,0.24)] bg-[rgba(215,181,109,0.08)] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[var(--accent)]">{a.type}</span><span className="text-xs text-[var(--text-tertiary)]">{format(new Date(a.createdAt), "MMM yyyy")}</span></div></div>
              <div className="text-right"><div className="font-mono text-sm font-semibold text-[var(--accent)]">{s$(a.currentValue)} {a.currency}</div><div className={`text-[10px] font-mono ${pnl >= 0 ? "text-[var(--emerald)]" : "text-[var(--rose)]"}`}>{pnl >= 0 ? "+" : ""}{s$(pnl)}</div></div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </Link>
          )})}</div>
        </section>
      )}
    </div>
  );
}
