import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function GoalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const goal = await db.financialGoal.findUnique({ where: { id }, include: { account: true } });
  if (!goal) notFound();

  const pct = goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0;
  const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);

  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/finance/goals" className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <span className="rounded border border-[var(--border-light)] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[var(--text-tertiary)]">{goal.status}</span>
          </div>
          <h1 className="premium-title">{goal.name}</h1>
          <p className="premium-subtitle">{goal.currency}</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Progress</div>
          <div className="font-mono text-3xl font-semibold text-[var(--emerald)]">{pct.toFixed(0)}%</div>
        </div>
      </div>

      <section className="premium-command-card">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Target</div>
          <span className="font-mono text-lg font-semibold text-[var(--text)]">{goal.currentAmount.toFixed(2)} / {goal.targetAmount.toFixed(2)} {goal.currency}</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-[var(--border-light)]">
          <div className="h-full rounded-full bg-[var(--emerald)] transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-2 text-xs text-[var(--text-tertiary)]">{remaining.toFixed(2)} {goal.currency} remaining</div>
      </section>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <div className="premium-stat">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Current</div>
          <div className="mt-2 font-mono text-lg font-semibold text-[var(--emerald)]">{goal.currentAmount.toFixed(2)}</div>
        </div>
        <div className="premium-stat">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Target</div>
          <div className="mt-2 font-mono text-lg font-semibold text-[var(--accent)]">{goal.targetAmount.toFixed(2)}</div>
        </div>
        <div className="premium-stat">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Remaining</div>
          <div className="mt-2 font-mono text-lg font-semibold text-[var(--rose)]">{remaining.toFixed(2)}</div>
        </div>
      </div>

      <section className="premium-panel animate-fade-in">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-[var(--text)]">Details</h2>
          <span className="rounded border border-[var(--border-light)] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Created {format(new Date(goal.createdAt), "MMM d, yyyy")}</span>
        </div>
        <div className="space-y-3 text-sm">
          {goal.account && <div className="flex justify-between"><span className="text-[var(--text-tertiary)]">Linked Account</span><span className="text-[var(--text)]">{goal.account.name}</span></div>}
          {goal.targetDate && <div className="flex justify-between"><span className="text-[var(--text-tertiary)]">Target Date</span><span className="text-[var(--text)]">{format(new Date(goal.targetDate), "MMMM d, yyyy")}</span></div>}
          {goal.notes && <div className="flex justify-between"><span className="text-[var(--text-tertiary)]">Notes</span><span className="text-[var(--text-secondary)] text-right max-w-xs">{goal.notes}</span></div>}
          <div className="flex justify-between"><span className="text-[var(--text-tertiary)]">Status</span><span className="capitalize text-[var(--text)]">{goal.status}</span></div>
        </div>
      </section>
    </div>
  );
}
