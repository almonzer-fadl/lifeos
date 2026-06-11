import { db } from "@/lib/db";
import { TransactionForm } from "@/components/modules/finance/transaction-form";
import { FinanceForms } from "@/components/modules/finance/finance-forms";
import { DeleteButton } from "@/components/ui/delete-button";
import { format, subDays } from "date-fns";

export const dynamic = "force-dynamic";

type TxLike = { id: string; accountId: string; type: string; amount: number; currency: string; date: Date; description: string | null; account: { name: string } | null; category: { name: string } | null };
type AcctLike = { id: string; name: string; currency: string; type: string; initialBalance: number; isDebt: boolean; interestRate: number | null; minimumPayment: number | null; creditLimit: number | null; paymentDueDay: number | null; payoffTarget: Date | null; balance?: number };

export default async function FinancePage() {
  const thirtyDaysAgo = subDays(new Date(), 30);

  const [accounts, transactions, categories, assets, recurring, goals] = await Promise.all([
    db.account.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    db.transaction.findMany({ where: { date: { gte: thirtyDaysAgo } }, orderBy: { date: "desc" }, take: 100, include: { account: true, category: true } }),
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.asset.findMany({ orderBy: { name: "asc" } }),
    db.recurringTransaction.findMany({ where: { isActive: true }, orderBy: { nextDate: "asc" }, include: { account: true, category: true } }),
    db.financialGoal.findMany({ orderBy: { status: "asc" }, include: { account: true } }),
  ]);

  // Calculate balances per account
  const accountsWithBalance = accounts.map((a: AcctLike) => {
    const txs = transactions.filter((t: TxLike) => t.accountId === a.id);
    const bal = txs.reduce((s: number, t: TxLike) => t.type === "income" ? s + t.amount : t.type === "expense" ? s - t.amount : s, a.initialBalance);
    return { ...a, balance: bal };
  });

  // Net worth = cash accounts + assets - debts
  const cashBalance = accountsWithBalance.filter((a: AcctLike & { balance: number }) => !a.isDebt).reduce((s: number, a: AcctLike & { balance: number }) => s + a.balance, 0);
  const debtBalance = accountsWithBalance.filter((a: AcctLike & { balance: number }) => a.isDebt).reduce((s: number, a: AcctLike & { balance: number }) => s + Math.abs(a.balance), 0);
  const assetValue = assets.reduce((s: number, a: { currentValue: number }) => s + a.currentValue, 0);
  const netWorth = cashBalance + assetValue - debtBalance;

  const income = transactions.filter((t: TxLike) => t.type === "income").reduce((s: number, t: TxLike) => s + t.amount, 0);
  const expenses = transactions.filter((t: TxLike) => t.type === "expense").reduce((s: number, t: TxLike) => s + t.amount, 0);

  const byCat: Record<string, number> = {};
  transactions.filter((t: TxLike) => t.type === "expense" && t.category).forEach((t: TxLike) => { byCat[t.category!.name] = (byCat[t.category!.name] || 0) + t.amount; });
  const topCats = Object.entries(byCat).sort(([, a]: [string, number], [, b]: [string, number]) => b - a).slice(0, 5);

  // Upcoming recurring (next 30 days)
  const upcomingBills = recurring
    .filter((r: { nextDate: Date }) => new Date(r.nextDate) <= subDays(new Date(), -30))
    .slice(0, 8);

  const monthlyRecurring = recurring
    .filter((r: { type: string }) => r.type === "expense")
    .reduce((s: number, r: { amount: number; frequency: string; frequencyCount: number }) => {
      if (r.frequency === "monthly") return s + r.amount;
      if (r.frequency === "yearly") return s + r.amount / 12;
      if (r.frequency === "weekly") return s + (r.amount * 52) / 12;
      return s + (r.amount * 30) / r.frequencyCount;
    }, 0);

  const currencies = [...new Set<string>(accounts.map((a: AcctLike) => a.currency))];

  return (
    <div className="p-5 lg:p-8 space-y-5">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">Finance</h1>
        <p className="text-sm text-stone-500 mt-0.5">Net worth, accounts, assets, and debts</p>
      </div>

      {/* Net worth overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-stagger">
        <Stat l="Net Worth" v={`${netWorth.toFixed(0)}`} u={currencies[0] || "USD"} c={netWorth >= 0 ? "text-emerald-600" : "text-rose-600"} />
        <Stat l="Cash" v={`${cashBalance.toFixed(0)}`} u="" c="text-sky-700" />
        <Stat l="Assets" v={`${assetValue.toFixed(0)}`} u="" c="text-amber-600" />
        <Stat l="Debts" v={`-${debtBalance.toFixed(0)}`} u="" c="text-rose-600" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat l="Income (30d)" v={`+${income.toFixed(0)}`} u="" c="text-emerald-600" />
        <Stat l="Expenses (30d)" v={`-${expenses.toFixed(0)}`} u="" c="text-rose-600" />
        <Stat l="Monthly Bills" v={`${monthlyRecurring.toFixed(0)}`} u="/mo" c="text-orange-600" />
        <Stat l="Cashflow" v={`${(income - expenses).toFixed(0)}`} u="" c={income >= expenses ? "text-emerald-600" : "text-rose-600"} />
      </div>

      {/* Add forms */}
      <Section title="Add"><FinanceForms accounts={accounts} currencies={currencies} /></Section>

      {/* Accounts + Cash */}
      {accountsWithBalance.length > 0 && (
        <Section title="Accounts">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {accountsWithBalance.filter((a: AcctLike & { balance: number }) => !a.isDebt).map((a: AcctLike & { balance: number }) => (
              <AccountCard key={a.id} a={a} />
            ))}
          </div>
        </Section>
      )}

      {/* Assets */}
      {assets.length > 0 && (
        <Section title="Assets">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {assets.map((a: { id: string; name: string; type: string; currentValue: number; purchaseValue: number; currency: string }) => (
              <div key={a.id} className="p-4 rounded-xl bg-amber-50/50 border border-amber-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-stone-700">{a.name}</span>
                  <span className="text-[10px] uppercase text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-md font-medium capitalize">{a.type}</span>
                </div>
                <div className="text-xl font-bold font-mono text-amber-700">{a.currentValue.toFixed(0)} <span className="text-xs font-normal text-amber-500">{a.currency}</span></div>
                <div className="text-xs text-stone-400 mt-0.5">Purchased: {a.purchaseValue.toFixed(0)} · Gain: <span className={a.currentValue >= a.purchaseValue ? "text-emerald-600" : "text-rose-600"}>{(a.currentValue - a.purchaseValue).toFixed(0)}</span></div>
                <DeleteButton url={`/api/finance/assets?id=${a.id}`} />
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Debts */}
      {accountsWithBalance.filter((a: AcctLike & { balance: number }) => a.isDebt).length > 0 && (
        <Section title="Debts & Liabilities">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {accountsWithBalance.filter((a: AcctLike & { balance: number }) => a.isDebt).map((a: AcctLike & { balance: number }) => (
              <div key={a.id} className="p-4 rounded-xl bg-rose-50/50 border border-rose-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-stone-700">{a.name}</span>
                  <span className="text-[10px] uppercase text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded-md font-medium">{a.currency}</span>
                </div>
                <div className="text-xl font-bold font-mono text-rose-700">{Math.abs(a.balance).toFixed(0)} <span className="text-xs font-normal text-rose-500">remaining</span></div>
                <div className="text-xs text-stone-400 mt-1 space-y-0.5">
                  {a.interestRate != null && <div>Interest: {a.interestRate}% APR</div>}
                  {a.minimumPayment != null && <div>Min payment: {a.minimumPayment} {a.currency}</div>}
                  {a.paymentDueDay != null && <div>Due: day {a.paymentDueDay}</div>}
                  {a.payoffTarget && <div>Payoff target: {format(new Date(a.payoffTarget), "MMM yyyy")}</div>}
                  {a.creditLimit != null && <div>Credit limit: {a.creditLimit.toFixed(0)} {a.currency}</div>}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Recurring */}
      {upcomingBills.length > 0 && (
        <Section title="Upcoming Bills">
          <div className="space-y-1.5">
            {upcomingBills.map((r: { id: string; description: string; amount: number; currency: string; nextDate: Date; frequency: string; account: { name: string } }) => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-[var(--border-light)]">
                <div>
                  <div className="text-sm font-medium text-stone-700">{r.description}</div>
                  <div className="text-xs text-stone-400 capitalize">{r.frequency} · {r.account.name} · next: {format(new Date(r.nextDate), "MMM d")}</div>
                </div>
                <span className="text-sm font-mono font-bold text-orange-600">{r.amount.toFixed(0)} {r.currency}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Goals */}
      {goals.length > 0 && (
        <Section title="Financial Goals">
          <div className="space-y-2">
            {goals.map((g: { id: string; name: string; targetAmount: number; currentAmount: number; currency: string; targetDate: Date | null; notes: string | null }) => {
              const pct = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
              return (
                <div key={g.id} className="p-4 rounded-xl bg-stone-50 border border-[var(--border-light)]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold text-stone-700">{g.name}</div>
                    <span className="text-xs text-stone-400 font-mono">{g.currentAmount.toFixed(0)} / {g.targetAmount.toFixed(0)} {g.currency}</span>
                  </div>
                  <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[11px] text-stone-400">{pct.toFixed(0)}% complete</span>
                    {g.targetDate && <span className="text-[11px] text-stone-400">Target: {format(new Date(g.targetDate), "MMM yyyy")}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Top spending */}
      {topCats.length > 0 && (
        <Section title="Top Spending">
          <div className="space-y-2.5">
            {topCats.map(([name, amt]: [string, number]) => (
              <div key={name} className="flex items-center gap-3">
                <span className="text-sm flex-1 text-stone-600 font-medium">{name}</span>
                <span className="text-sm font-mono font-semibold text-rose-600">{amt.toFixed(0)}</span>
                <div className="w-20 h-1.5 bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-rose-200 rounded-full" style={{ width: `${expenses > 0 ? (amt / expenses) * 100 : 0}%` }} /></div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Transactions */}
      <Section title="Add Transaction">
        <TransactionForm accounts={accounts} categories={categories} currencies={currencies} />
      </Section>

      <Section title="Recent Transactions">
        {transactions.length === 0 ? <Empty msg="No transactions yet." /> : (
          <div className="space-y-1">
            {transactions.slice(0, 30).map((t: TxLike) => (
              <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-stone-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-stone-700 font-medium truncate">{t.description || t.category?.name || "Transaction"}</div>
                  <div className="text-xs text-stone-400">{format(new Date(t.date), "MMM d")}{t.account && ` · ${t.account.name}`}{t.category && ` · ${t.category.name}`}</div>
                </div>
                <span className={`text-sm font-mono font-bold whitespace-nowrap ${t.type === "income" ? "text-emerald-600" : t.type === "expense" ? "text-rose-600" : "text-stone-400"}`}>
                  {t.type === "income" ? "+" : t.type === "expense" ? "−" : ""}{t.amount.toFixed(2)} {t.currency}
                </span>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function Stat({ l, v, u, c }: { l: string; v: string; u: string; c: string }) {
  return <div className="p-4 rounded-2xl bg-white border border-[var(--border)] shadow-[var(--shadow-card)]"><div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">{l}</div><div className={`text-[1.75rem] font-bold tracking-tight mt-1 font-mono ${c}`}>{v}</div><div className="text-xs text-stone-400 mt-0.5">{u}</div></div>;
}

function AccountCard({ a }: { a: AcctLike & { balance: number } }) {
  return (
    <div className="p-4 rounded-xl bg-stone-50 border border-[var(--border-light)]">
      <div className="flex items-center justify-between mb-1">
        <div className="text-sm font-semibold text-stone-700">{a.name}</div>
        <span className="text-[10px] uppercase font-semibold text-stone-400 bg-white px-1.5 py-0.5 rounded-md border border-[var(--border-light)]">{a.currency}</span>
      </div>
      <div className={`text-xl font-bold font-mono ${a.balance >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{a.balance.toFixed(2)}</div>
      <div className="text-xs text-stone-400 capitalize mt-0.5">{a.type}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl bg-white border border-[var(--border)] shadow-[var(--shadow-card)] p-5 animate-fade-in"><h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">{title}</h2>{children}</section>;
}

function Empty({ msg }: { msg: string }) {
  return <div className="py-8 text-center text-sm text-stone-400">{msg}</div>;
}
