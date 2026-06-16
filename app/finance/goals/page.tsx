import Link from "next/link";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { centsToDollars } from "@/lib/money";

export const dynamic = "force-dynamic";

function f$(cents: number) { return centsToDollars(cents).toFixed(2); }
function s$(cents: number) { return Math.round(centsToDollars(cents)).toLocaleString(); }

export default async function GoalsPage() {
  const goals = await db.financialGoal.findMany({ orderBy: { status: "asc" }, include: { account: true } });

  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in"><div className="premium-kicker">Capital Objectives</div><h1 className="premium-title">Goals</h1><p className="premium-subtitle">{goals.length} financial targets</p></div>
      {goals.length === 0 ? (
        <section className="premium-panel animate-fade-in"><div className="flex flex-col items-center justify-center py-16 px-4 text-center"><div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div><h3 className="mb-1 text-sm font-semibold text-[var(--text)]">No goals yet</h3><p className="mb-4 max-w-xs text-xs text-[var(--text-tertiary)]">Set savings targets and track your progress.</p><Link href="/finance/goals/new" className="premium-action">Set Goal</Link></div></section>
      ) : (
        <section className="premium-panel animate-fade-in">
          <div className="space-y-3">
            {goals.map((g) => {
              const pct = g.targetAmount > 0 ? Math.min((g.currentAmount / g.targetAmount) * 100, 100) : 0;
              return (
                <Link key={g.id} href={`/finance/goals/${g.id}`} className="block rounded-lg border border-[var(--border-light)] bg-[var(--surface-raised)] p-4 transition-all hover:border-[var(--border)]">
                  <div className="mb-3 flex items-center justify-between gap-4"><div className="min-w-0"><div className="truncate text-sm font-semibold text-[var(--text)]">{g.name}</div>{g.account && <div className="text-xs text-[var(--text-tertiary)]">Linked to {g.account.name}</div>}</div><span className="shrink-0 rounded border border-[var(--border-light)] px-2 py-1 text-[10px] font-semibold uppercase text-[var(--text-tertiary)]">{g.status}</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--border-light)]"><div className="h-full rounded-full bg-[var(--emerald)] transition-all" style={{ width: `${pct}%` }} /></div>
                  <div className="mt-2 flex items-center justify-between"><span className="text-[11px] text-[var(--text-tertiary)]">{pct.toFixed(0)}% complete</span><span className="font-mono text-xs text-[var(--text-secondary)]">{s$(g.currentAmount)} / {s$(g.targetAmount)} {g.currency}</span></div>
                  {g.targetDate && <div className="mt-1 text-[11px] text-[var(--text-tertiary)]">Target {format(new Date(g.targetDate), "MMM yyyy")}</div>}
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
