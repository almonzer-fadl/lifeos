import { db } from "@/lib/db";
import { TransactionForm } from "@/components/modules/finance/transaction-form";
import { format, subDays } from "date-fns";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const thirtyDaysAgo = subDays(new Date(), 30);
  const [accounts, transactions, categories] = await Promise.all([
    db.account.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    db.transaction.findMany({ where: { date: { gte: thirtyDaysAgo } }, orderBy: { date: "desc" }, take: 100, include: { account: true, category: true } }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const balances = accounts.map(a => {
    const txs = transactions.filter(t => t.accountId === a.id);
    const bal = txs.reduce((s, t) => t.type === "income" ? s + t.amount : t.type === "expense" ? s - t.amount : s, a.initialBalance);
    return { ...a, balance: bal };
  });
  const netWorth = balances.reduce((s, a) => s + a.balance, 0);
  const income = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const byCat: Record<string, number> = {};
  transactions.filter(t => t.type === "expense" && t.category).forEach(t => { byCat[t.category!.name] = (byCat[t.category!.name] || 0) + t.amount; });
  const topCats = Object.entries(byCat).sort(([,a],[,b]) => b - a).slice(0, 5);
  const currencies = [...new Set(accounts.map(a => a.currency))];

  return (
    <div className="p-5 lg:p-8 space-y-5">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">Finance</h1>
        <p className="text-sm text-stone-500 mt-0.5">Accounts, transactions, and budgeting</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-stagger">
        <Stat l="Net Worth" v={`${netWorth.toFixed(0)}`} u={currencies.join("/")} c="text-sky-700" />
        <Stat l="Income (30d)" v={`+${income.toFixed(0)}`} u="" c="text-emerald-600" />
        <Stat l="Expenses (30d)" v={`-${expenses.toFixed(0)}`} u="" c="text-rose-600" />
        <Stat l="Cashflow" v={`${(income - expenses).toFixed(0)}`} u="" c={income >= expenses ? "text-emerald-600" : "text-rose-600"} />
      </div>

      {balances.length > 0 && (
        <Section title="Accounts">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {balances.map(a => (
              <div key={a.id} className="p-4 rounded-xl bg-stone-50 border border-[var(--border-light)]">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-semibold text-stone-700">{a.name}</div>
                  <span className="text-[10px] uppercase font-semibold text-stone-400 bg-white px-1.5 py-0.5 rounded-md border border-[var(--border-light)]">{a.currency}</span>
                </div>
                <div className={`text-xl font-bold font-mono ${a.balance >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{a.balance.toFixed(2)}</div>
                <div className="text-xs text-stone-400 capitalize mt-0.5">{a.type}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {topCats.length > 0 && (
        <Section title="Top Spending">
          <div className="space-y-2.5">
            {topCats.map(([name, amt]) => (
              <div key={name} className="flex items-center gap-3">
                <span className="text-sm flex-1 text-stone-600 font-medium">{name}</span>
                <span className="text-sm font-mono font-semibold text-rose-600">{amt.toFixed(0)}</span>
                <div className="w-20 h-1.5 bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-rose-200 rounded-full" style={{ width: `${expenses > 0 ? (amt / expenses) * 100 : 0}%` }} /></div>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section title="Add Transaction">
        <TransactionForm accounts={accounts} categories={categories} currencies={currencies} />
      </Section>

      <Section title="Recent">
        {transactions.length === 0 ? <Empty msg="No transactions yet." /> : (
          <div className="space-y-1">
            {transactions.slice(0, 30).map(t => (
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl bg-white border border-[var(--border)] shadow-[var(--shadow-card)] p-5 animate-fade-in"><h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">{title}</h2>{children}</section>;
}

function Empty({ msg }: { msg: string }) {
  return <div className="py-8 text-center text-sm text-stone-400">{msg}</div>;
}
