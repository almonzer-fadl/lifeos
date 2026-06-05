import { db } from "@/lib/db";
import { TransactionForm } from "@/components/modules/finance/transaction-form";
import { format, subDays } from "date-fns";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const thirtyDaysAgo = subDays(new Date(), 30);

  const [accounts, transactions, categories] = await Promise.all([
    db.account.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    db.transaction.findMany({
      where: { date: { gte: thirtyDaysAgo } },
      orderBy: { date: "desc" },
      take: 100,
      include: { account: true, category: true },
    }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  // Calculate balances
  const accountBalances = accounts.map((a) => {
    const txs = transactions.filter((t) => t.accountId === a.id);
    const balance = txs.reduce((sum, t) => {
      if (t.type === "income") return sum + t.amount;
      if (t.type === "expense") return sum - t.amount;
      return sum;
    }, a.initialBalance);
    return { ...a, balance };
  });

  const totalNetWorth = accountBalances.reduce((sum, a) => sum + a.balance, 0);

  // Monthly stats
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  // Group expenses by category
  const byCategory: Record<string, number> = {};
  transactions
    .filter((t) => t.type === "expense" && t.category)
    .forEach((t) => {
      const cat = t.category?.name || "Uncategorized";
      byCategory[cat] = (byCategory[cat] || 0) + t.amount;
    });

  const topCategories = Object.entries(byCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Get unique currencies
  const currencies = [...new Set(accounts.map((a) => a.currency))];

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Finance</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Accounts, transactions, and budgeting
        </p>
      </div>

      {/* Net worth and stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Net Worth" value={`${totalNetWorth.toFixed(0)}`} unit={currencies.join("/")} color="text-yellow-400" />
        <StatCard label="Income (30d)" value={`+${income.toFixed(0)}`} unit="" color="text-green-400" />
        <StatCard label="Expenses (30d)" value={`-${expenses.toFixed(0)}`} unit="" color="text-red-400" />
        <StatCard label="Cashflow" value={`${(income - expenses).toFixed(0)}`} unit="" color={income >= expenses ? "text-green-400" : "text-red-400"} />
      </div>

      {/* Accounts */}
      <section className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Accounts</h2>
        {accountBalances.length === 0 ? (
          <div className="text-zinc-600 text-sm py-4 text-center">No accounts set up.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {accountBalances.map((a) => (
              <div key={a.id} className="p-3 rounded-lg bg-zinc-800/30 border border-zinc-800/50">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{a.name}</div>
                  <span className="text-[10px] uppercase text-zinc-500">{a.currency}</span>
                </div>
                <div className={`text-xl font-bold mt-1 ${a.balance >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {a.balance.toFixed(2)}
                </div>
                <div className="text-xs text-zinc-500 capitalize">{a.type}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Top spending categories */}
      {topCategories.length > 0 && (
        <section className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Top Spending</h2>
          <div className="space-y-2">
            {topCategories.map(([name, amount]) => (
              <div key={name} className="flex items-center gap-2">
                <span className="text-sm flex-1 text-zinc-300">{name}</span>
                <span className="text-sm font-medium text-red-400">{amount.toFixed(0)}</span>
                <div className="w-24 h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500/50 rounded-full"
                    style={{ width: `${expenses > 0 ? (amount / expenses) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Add transaction */}
      <section className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Add Transaction</h2>
        <TransactionForm accounts={accounts} categories={categories} currencies={currencies} />
      </section>

      {/* Recent transactions */}
      <section className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Recent Transactions</h2>
        {transactions.length === 0 ? (
          <div className="text-zinc-600 text-sm py-4 text-center">No transactions yet.</div>
        ) : (
          <div className="space-y-1">
            {transactions.slice(0, 30).map((t) => (
              <div key={t.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/30 text-sm">
                <div className="flex-1 min-w-0">
                  <div className="text-zinc-200 truncate">
                    {t.description || t.category?.name || "Transaction"}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {format(new Date(t.date), "MMM d")}
                    {t.account && ` · ${t.account.name}`}
                    {t.category && ` · ${t.category.name}`}
                  </div>
                </div>
                <span className={`font-semibold text-sm whitespace-nowrap ${t.type === "income" ? "text-green-400" : t.type === "expense" ? "text-red-400" : "text-zinc-400"}`}>
                  {t.type === "income" ? "+" : t.type === "expense" ? "-" : ""}
                  {t.amount.toFixed(2)} {t.currency}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, unit, color }: { label: string; value: string; unit: string; color: string }) {
  return (
    <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${color}`}>{value}</div>
      <div className="text-xs text-zinc-600">{unit}</div>
    </div>
  );
}
