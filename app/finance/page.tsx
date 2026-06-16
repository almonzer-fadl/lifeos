import { FinanceForms } from "@/components/modules/finance/finance-forms";
import { TransactionForm } from "@/components/modules/finance/transaction-form";
import { DeleteButton } from "@/components/ui/delete-button";
import { db } from "@/lib/db";
import { format, subDays } from "date-fns";

export const dynamic = "force-dynamic";

type TxLike = { id: string; accountId: string; type: string; amount: number; currency: string; date: Date; description: string | null; account: { name: string } | null; category: { name: string } | null };
type AcctLike = { id: string; name: string; currency: string; type: string; initialBalance: number; isDebt: boolean; interestRate: number | null; minimumPayment: number | null; creditLimit: number | null; paymentDueDay: number | null; payoffTarget: Date | null; balance?: number };
type Tone = "positive" | "negative" | "gold" | "steel" | "amber" | "neutral";

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

  const accountsWithBalance = accounts.map((a: AcctLike) => {
    const txs = transactions.filter((t: TxLike) => t.accountId === a.id);
    const bal = txs.reduce((s: number, t: TxLike) => t.type === "income" ? s + t.amount : t.type === "expense" ? s - t.amount : s, a.initialBalance);
    return { ...a, balance: bal };
  });

  const cashBalance = accountsWithBalance.filter((a: AcctLike & { balance: number }) => !a.isDebt).reduce((s: number, a: AcctLike & { balance: number }) => s + a.balance, 0);
  const debtBalance = accountsWithBalance.filter((a: AcctLike & { balance: number }) => a.isDebt).reduce((s: number, a: AcctLike & { balance: number }) => s + Math.abs(a.balance), 0);
  const assetValue = assets.reduce((s: number, a: { currentValue: number }) => s + a.currentValue, 0);
  const netWorth = cashBalance + assetValue - debtBalance;

  const income = transactions.filter((t: TxLike) => t.type === "income").reduce((s: number, t: TxLike) => s + t.amount, 0);
  const expenses = transactions.filter((t: TxLike) => t.type === "expense").reduce((s: number, t: TxLike) => s + t.amount, 0);

  const byCat: Record<string, number> = {};
  transactions.filter((t: TxLike) => t.type === "expense" && t.category).forEach((t: TxLike) => { byCat[t.category!.name] = (byCat[t.category!.name] || 0) + t.amount; });
  const topCats = Object.entries(byCat).sort(([, a]: [string, number], [, b]: [string, number]) => b - a).slice(0, 5);

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
    <div className="premium-page">
      <div className="premium-header animate-fade-in flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="premium-kicker">Private Ledger</div>
          <h1 className="premium-title">Finance Command</h1>
          <p className="premium-subtitle">Net worth, exposure, liabilities, cashflow, and capital control</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-right sm:min-w-80">
          <MarketChip label="Base" value={currencies[0] || "USD"} />
          <MarketChip label="Window" value="30D" />
          <MarketChip label="Status" value="Local" />
        </div>
      </div>

      <div className="premium-command-grid">
        <section className="premium-command-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-tertiary)]">Total Net Worth</div>
              <div className={`mt-2 font-mono text-5xl font-semibold leading-none tracking-tight sm:text-6xl ${netWorth >= 0 ? "text-[var(--emerald)]" : "text-[var(--rose)]"}`}>{netWorth.toFixed(0)}</div>
              <div className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">{currencies[0] || "USD"}</div>
            </div>
            <div className="rounded-md border border-[rgba(215,181,109,0.28)] bg-[var(--accent-soft)] px-2.5 py-1.5 text-right">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Cashflow</div>
              <div className={`font-mono text-sm font-semibold ${income >= expenses ? "text-[var(--emerald)]" : "text-[var(--rose)]"}`}>{(income - expenses).toFixed(0)}</div>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2">
            <Exposure label="Cash" value={cashBalance} tone="steel" />
            <Exposure label="Assets" value={assetValue} tone="gold" />
            <Exposure label="Debts" value={debtBalance} tone="negative" prefix="-" />
          </div>
        </section>

        <section className="grid grid-cols-2 gap-2">
          <Stat l="Income 30D" v={`+${income.toFixed(0)}`} u="" tone="positive" />
          <Stat l="Expenses 30D" v={`-${expenses.toFixed(0)}`} u="" tone="negative" />
          <Stat l="Bills / Mo" v={`${monthlyRecurring.toFixed(0)}`} u="" tone="amber" />
          <Stat l="Accounts" v={`${accounts.length}`} u={`${assets.length} assets`} tone="neutral" />
        </section>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[0.85fr_1.15fr]">
        <Section title="Capital Entry" kicker="Add">
          <FinanceForms accounts={accounts} currencies={currencies} />
        </Section>

        <Section title="Transaction Entry" kicker="Post">
          <TransactionForm accounts={accounts} categories={categories} currencies={currencies} />
        </Section>
      </div>

      <Section title="Cash Accounts" kicker="Accounts">
        {accountsWithBalance.filter((a: AcctLike & { balance: number }) => !a.isDebt).length === 0 ? <Empty msg="No cash accounts configured." /> : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {accountsWithBalance.filter((a: AcctLike & { balance: number }) => !a.isDebt).map((a: AcctLike & { balance: number }) => (
              <AccountCard key={a.id} a={a} />
            ))}
          </div>
        )}
      </Section>

      <Section title="Asset Register" kicker="Assets">
        {assets.length === 0 ? <Empty msg="No assets tracked yet." /> : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {assets.map((a: { id: string; name: string; type: string; currentValue: number; purchaseValue: number; currency: string }) => (
              <div key={a.id} className="rounded-lg border border-[rgba(215,181,109,0.2)] bg-[rgba(215,181,109,0.06)] p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-[var(--text)]">{a.name}</span>
                  <span className="rounded border border-[rgba(215,181,109,0.24)] bg-[rgba(215,181,109,0.08)] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[var(--accent)]">{a.type}</span>
                </div>
                <div className="font-mono text-xl font-semibold text-[var(--accent)]">{a.currentValue.toFixed(0)} <span className="text-xs font-normal text-[var(--text-tertiary)]">{a.currency}</span></div>
                <div className="mt-1 text-xs text-[var(--text-tertiary)]">Purchased {a.purchaseValue.toFixed(0)} | Gain <span className={a.currentValue >= a.purchaseValue ? "text-[var(--emerald)]" : "text-[var(--rose)]"}>{(a.currentValue - a.purchaseValue).toFixed(0)}</span></div>
                <DeleteButton url={`/api/finance/assets?id=${a.id}`} />
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Liability Desk" kicker="Debts">
        {accountsWithBalance.filter((a: AcctLike & { balance: number }) => a.isDebt).length === 0 ? <Empty msg="No liabilities tracked yet." /> : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {accountsWithBalance.filter((a: AcctLike & { balance: number }) => a.isDebt).map((a: AcctLike & { balance: number }) => (
              <div key={a.id} className="rounded-lg border border-[rgba(255,95,109,0.22)] bg-[rgba(255,95,109,0.055)] p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-[var(--text)]">{a.name}</span>
                  <span className="rounded border border-[rgba(255,95,109,0.22)] bg-[rgba(255,95,109,0.08)] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[var(--rose)]">{a.currency}</span>
                </div>
                <div className="font-mono text-xl font-semibold text-[var(--rose)]">{Math.abs(a.balance).toFixed(0)} <span className="text-xs font-normal text-[var(--text-tertiary)]">remaining</span></div>
                <div className="mt-2 space-y-0.5 text-xs text-[var(--text-tertiary)]">
                  {a.interestRate != null && <div>Interest: {a.interestRate}% APR</div>}
                  {a.minimumPayment != null && <div>Min payment: {a.minimumPayment} {a.currency}</div>}
                  {a.paymentDueDay != null && <div>Due: day {a.paymentDueDay}</div>}
                  {a.payoffTarget && <div>Payoff target: {format(new Date(a.payoffTarget), "MMM yyyy")}</div>}
                  {a.creditLimit != null && <div>Credit limit: {a.creditLimit.toFixed(0)} {a.currency}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Forward Obligations" kicker="Bills">
        {upcomingBills.length === 0 ? <Empty msg="No upcoming recurring bills." /> : (
          <div className="space-y-1">
            {upcomingBills.map((r: { id: string; description: string; amount: number; currency: string; nextDate: Date; frequency: string; account: { name: string } }) => (
              <div key={r.id} className="flex items-center justify-between gap-3 border-b border-[var(--border-light)] px-1 py-2 last:border-b-0">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-[var(--text)]">{r.description}</div>
                  <div className="text-xs capitalize text-[var(--text-tertiary)]">{r.frequency} | {r.account.name} | next {format(new Date(r.nextDate), "MMM d")}</div>
                </div>
                <span className="shrink-0 font-mono text-sm font-semibold text-[var(--amber)]">{r.amount.toFixed(0)} {r.currency}</span>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Capital Objectives" kicker="Goals">
        {goals.length === 0 ? <Empty msg="No financial goals defined." /> : (
          <div className="space-y-2">
            {goals.map((g: { id: string; name: string; targetAmount: number; currentAmount: number; currency: string; targetDate: Date | null; notes: string | null }) => {
              const pct = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
              return (
                <div key={g.id} className="rounded-lg border border-[var(--border-light)] bg-[var(--surface-raised)] p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="min-w-0 truncate text-sm font-semibold text-[var(--text)]">{g.name}</div>
                    <span className="shrink-0 font-mono text-xs text-[var(--text-secondary)]">{g.currentAmount.toFixed(0)} / {g.targetAmount.toFixed(0)} {g.currency}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[var(--border-light)]">
                    <div className="h-full rounded-full bg-[var(--emerald)] transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-[11px] text-[var(--text-tertiary)]">{pct.toFixed(0)}% complete</span>
                    {g.targetDate && <span className="text-[11px] text-[var(--text-tertiary)]">Target {format(new Date(g.targetDate), "MMM yyyy")}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      <Section title="Expense Concentration" kicker="Spend">
        {topCats.length === 0 ? <Empty msg="No categorized spending concentration yet." /> : (
          <div className="space-y-2.5">
            {topCats.map(([name, amt]: [string, number]) => (
              <div key={name} className="flex items-center gap-3">
                <span className="flex-1 text-sm font-medium text-[var(--text-secondary)]">{name}</span>
                <span className="font-mono text-sm font-semibold text-[var(--rose)]">{amt.toFixed(0)}</span>
                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[var(--border-light)]"><div className="h-full rounded-full bg-[var(--rose)]" style={{ width: `${expenses > 0 ? (amt / expenses) * 100 : 0}%` }} /></div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Recent Ledger" kicker="Transactions">
        {transactions.length === 0 ? <Empty msg="No transactions yet." /> : (
          <div className="overflow-hidden rounded-lg border border-[var(--border-light)]">
            {transactions.slice(0, 30).map((t: TxLike) => (
              <div key={t.id} className="flex items-center gap-3 border-b border-[var(--border-light)] px-3 py-2.5 transition-colors last:border-b-0 hover:bg-[var(--surface-hover)]">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-[var(--text)]">{t.description || t.category?.name || "Transaction"}</div>
                  <div className="text-xs text-[var(--text-tertiary)]">{format(new Date(t.date), "MMM d")}{t.account && ` | ${t.account.name}`}{t.category && ` | ${t.category.name}`}</div>
                </div>
                <span className={`whitespace-nowrap font-mono text-sm font-semibold ${t.type === "income" ? "text-[var(--emerald)]" : t.type === "expense" ? "text-[var(--rose)]" : "text-[var(--text-tertiary)]"}`}>
                  {t.type === "income" ? "+" : t.type === "expense" ? "-" : ""}{t.amount.toFixed(2)} {t.currency}
                </span>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function toneClass(tone: Tone) {
  const tones: Record<Tone, string> = {
    positive: "text-[var(--emerald)]",
    negative: "text-[var(--rose)]",
    gold: "text-[var(--accent)]",
    steel: "text-[var(--sky)]",
    amber: "text-[var(--amber)]",
    neutral: "text-[var(--text)]",
  };
  return tones[tone];
}

function MarketChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[rgba(255,255,255,0.025)] px-2 py-1.5 shadow-[0_1px_0_rgba(255,255,255,0.035)_inset]">
      <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">{label}</div>
      <div className="font-mono text-xs font-semibold text-[var(--text)]">{value}</div>
    </div>
  );
}

function Stat({ l, v, u, tone }: { l: string; v: string; u: string; tone: Tone }) {
  return (
    <div className="premium-stat">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">{l}</div>
      <div className={`mt-2 font-mono text-2xl font-semibold tracking-tight ${toneClass(tone)}`}>{v}</div>
      {u && <div className="mt-1 text-xs text-[var(--text-tertiary)]">{u}</div>}
    </div>
  );
}

function Exposure({ label, value, tone, prefix = "" }: { label: string; value: number; tone: Tone; prefix?: string }) {
  return (
    <div className="rounded-md border border-[var(--border-light)] bg-[rgba(255,255,255,0.025)] p-2.5">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">{label}</div>
      <div className={`mt-1 font-mono text-lg font-semibold ${toneClass(tone)}`}>{prefix}{value.toFixed(0)}</div>
    </div>
  );
}

function AccountCard({ a }: { a: AcctLike & { balance: number } }) {
  return (
    <div className="rounded-lg border border-[var(--border-light)] bg-[var(--surface-raised)] p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="truncate text-sm font-semibold text-[var(--text)]">{a.name}</div>
        <span className="rounded border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[var(--text-secondary)]">{a.currency}</span>
      </div>
      <div className={`font-mono text-xl font-semibold ${a.balance >= 0 ? "text-[var(--emerald)]" : "text-[var(--rose)]"}`}>{a.balance.toFixed(2)}</div>
      <div className="mt-1 text-xs capitalize text-[var(--text-tertiary)]">{a.type}</div>
    </div>
  );
}

function Section({ title, kicker, children }: { title: string; kicker: string; children: React.ReactNode }) {
  return (
    <section className="premium-panel animate-fade-in">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-[var(--text)]">{title}</h2>
        <span className="rounded border border-[var(--border-light)] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">{kicker}</span>
      </div>
      {children}
    </section>
  );
}

function Empty({ msg }: { msg: string }) {
  return <div className="rounded-lg border border-dashed border-[var(--border)] py-8 text-center text-sm text-[var(--text-tertiary)]">{msg}</div>;
}
