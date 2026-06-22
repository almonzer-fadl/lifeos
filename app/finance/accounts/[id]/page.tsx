import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { TransactionForm } from "@/components/modules/finance/transaction-form";
import { centsToDollars } from "@/lib/money";

export const dynamic = "force-dynamic";

function f$(cents: number) { return centsToDollars(cents).toFixed(2); }
function s$(cents: number) { return Math.round(centsToDollars(cents)).toLocaleString(); }

export default async function AccountRegisterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const account = await db.account.findUnique({ where: { id } });
  if (!account) notFound();

  const transactions = await db.transaction.findMany({
    where: { accountId: id },
    orderBy: { date: "desc" },
    include: { category: true },
  });

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  let runningBalance = account.initialBalance;
  const txWithBalance = transactions.map((tx) => {
    if (tx.type === "income") runningBalance += tx.amount;
    else if (tx.type === "expense") runningBalance -= tx.amount;
    return { ...tx, balance: runningBalance };
  });

  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/finance/accounts" className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg></Link>
            <div className="premium-kicker">{account.isDebt ? "Liability" : "Asset Account"}</div>
          </div>
          <h1 className="premium-title">{account.name}</h1>
          <p className="premium-subtitle capitalize">{account.type} | {account.currency}</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Current Balance</div>
          <div className={`font-mono text-3xl font-semibold tracking-tight ${runningBalance >= 0 ? "text-[var(--emerald)]" : "text-[var(--rose)]"}`}>{f$(runningBalance)} {account.currency}</div>
        </div>
      </div>

      {account.isDebt && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {account.interestRate != null && <div className="premium-stat"><div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">APR</div><div className="mt-2 font-mono text-lg font-semibold text-[var(--amber)]">{account.interestRate}%</div></div>}
          {account.minimumPayment != null && <div className="premium-stat"><div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Min Payment</div><div className="mt-2 font-mono text-lg font-semibold text-[var(--text)]">{s$(account.minimumPayment)}</div></div>}
          {account.creditLimit != null && <div className="premium-stat"><div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Credit Limit</div><div className="mt-2 font-mono text-lg font-semibold text-[var(--sky)]">{s$(account.creditLimit)}</div></div>}
          {account.paymentDueDay != null && <div className="premium-stat"><div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Due Day</div><div className="mt-2 font-mono text-lg font-semibold text-[var(--text)]">Day {account.paymentDueDay}</div></div>}
        </div>
      )}

      <section className="premium-panel animate-fade-in">
        <h2 className="premium-panel-title mb-3">Add Transaction</h2>
        <TransactionForm accounts={[{ id: account.id, name: account.name, currency: account.currency }]} categories={categories} currencies={[account.currency]} />
      </section>

      <section className="premium-panel animate-fade-in">
        <div className="mb-3 flex items-center justify-between gap-3"><h2 className="text-sm font-semibold text-[var(--text)]">Transaction Ledger</h2><span className="rounded border border-[var(--border-light)] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">{transactions.length} entries</span></div>
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center"><p className="text-sm text-[var(--text-tertiary)]">No transactions yet</p><p className="text-xs text-[var(--text-tertiary)]">Add your first transaction above</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead><tr className="border-b border-[var(--border)]"><th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Date</th><th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Description</th><th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Category</th><th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Amount</th><th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Balance</th><th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Status</th></tr></thead>
              <tbody className="animate-stagger">
                {txWithBalance.map((t) => (
                  <tr key={t.id} className="border-b border-[var(--border-light)] transition-colors hover:bg-[var(--surface-hover)]">
                    <td className="px-3 py-2.5 text-xs text-[var(--text-tertiary)] whitespace-nowrap">{format(new Date(t.date), "MMM d")}</td>
                    <td className="px-3 py-2.5 text-sm text-[var(--text)] truncate max-w-[200px]">{t.description || "—"}</td>
                    <td className="px-3 py-2.5 text-xs text-[var(--text-tertiary)]">{t.category?.name || "—"}</td>
                    <td className={`px-3 py-2.5 text-right font-mono text-sm font-semibold whitespace-nowrap ${t.type === "income" ? "text-[var(--emerald)]" : t.type === "expense" ? "text-[var(--rose)]" : "text-[var(--text-tertiary)]"}`}>{t.type === "income" ? "+" : t.type === "expense" ? "-" : ""}{f$(t.amount)}</td>
                    <td className={`px-3 py-2.5 text-right font-mono text-sm font-semibold whitespace-nowrap ${t.balance >= 0 ? "text-[var(--text)]" : "text-[var(--rose)]"}`}>{f$(t.balance)}</td>
                    <td className="px-3 py-2.5 text-[10px] capitalize text-[var(--text-tertiary)]">{t.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
