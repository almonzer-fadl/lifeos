import Link from "next/link";
import { db } from "@/lib/db";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function BudgetPage() {
  const [categories, transactions, accounts] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.transaction.findMany({ where: { date: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }, include: { category: true } }),
    db.account.findMany({ where: { isActive: true } }),
  ]);

  const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const byCat: Record<string, number> = {};
  transactions.filter((t) => t.type === "expense" && t.category).forEach((t) => { byCat[t.category!.name] = (byCat[t.category!.name] || 0) + t.amount; });

  const expCats = categories.filter((c) => c.type === "expense");
  const incomeCats = categories.filter((c) => c.type === "income");
  const remainder = income - expenses;

  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in">
        <div className="premium-kicker">{format(new Date(), "MMMM yyyy")}</div>
        <h1 className="premium-title">Budget</h1>
        <p className="premium-subtitle">Monthly income and expense overview</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="premium-stat"><div className="premium-label">Income</div><div className="premium-value text-[var(--emerald)]">+{income.toFixed(0)}</div></div>
        <div className="premium-stat"><div className="premium-label">Expenses</div><div className="premium-value text-[var(--rose)]">-{expenses.toFixed(0)}</div></div>
        <div className="premium-stat"><div className="premium-label">Remaining</div><div className={`premium-value ${remainder >= 0 ? "text-[var(--emerald)]" : "text-[var(--rose)]"}`}>{remainder >= 0 ? "+" : ""}{remainder.toFixed(0)}</div></div>
      </div>

      {Object.keys(byCat).length > 0 && (
        <section className="premium-panel animate-fade-in">
          <h2 className="premium-panel-title mb-3">Spending by Category</h2>
          <div className="space-y-2">
            {Object.entries(byCat).sort(([, a], [, b]) => b - a).map(([name, amt]) => (
              <div key={name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">{name}</span>
                  <span className="font-mono text-[var(--rose)]">{amt.toFixed(0)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--border-light)] overflow-hidden">
                  <div className="h-full rounded-full bg-[var(--rose)]" style={{ width: `${expenses > 0 ? Math.min((amt / expenses) * 100, 100) : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="premium-panel animate-fade-in">
        <h2 className="premium-panel-title mb-3">Categories</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <div className="premium-label mb-2">Expense Categories ({expCats.length})</div>
            <div className="space-y-1">{expCats.map((c) => <div key={c.id} className="flex items-center justify-between rounded px-2 py-1.5 text-sm hover:bg-[var(--surface-hover)]"><span className="text-[var(--text-secondary)]">{c.name}</span><span className="font-mono text-xs text-[var(--text-tertiary)]">{byCat[c.name] ? byCat[c.name].toFixed(0) : "0"}</span></div>)}</div>
          </div>
          <div>
            <div className="premium-label mb-2">Income Categories ({incomeCats.length})</div>
            <div className="space-y-1">{incomeCats.map((c) => <div key={c.id} className="rounded px-2 py-1.5 text-sm text-[var(--text-secondary)]">{c.name}</div>)}</div>
          </div>
        </div>
      </section>
    </div>
  );
}
