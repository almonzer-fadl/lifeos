import Link from "next/link";
import { db } from "@/lib/db";
import { format, subDays, startOfYear } from "date-fns";
import { Odometer } from "@/components/ui/odometer";
import { Fab } from "@/components/ui/fab";
import { DateRangeSwitch } from "@/components/modules/finance/date-range-switch";
import { centsToDollars } from "@/lib/money";

export const dynamic = "force-dynamic";

type TxLike = { id: string; accountId: string; type: string; amount: number; currency: string; date: Date; description: string | null; account: { name: string } | null; category: { name: string } | null; status: string };
type Tone = "positive" | "negative" | "gold" | "steel" | "amber" | "neutral";

function $(cents: number) { return centsToDollars(cents); }
function f$(cents: number) { return $(cents).toFixed(2); }
function s$(cents: number) { return Math.round($(cents)).toLocaleString(); }

export default async function FinancePage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const { range } = await searchParams;
  const [accounts, allTransactions, categories, assets, recurring, goals] = await Promise.all([
    db.account.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    db.transaction.findMany({ orderBy: { date: "desc" }, include: { account: true, category: true } }),
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.asset.findMany({ orderBy: { name: "asc" } }),
    db.recurringTransaction.findMany({ where: { isActive: true }, orderBy: { nextDate: "asc" }, include: { account: true, category: true } }),
    db.financialGoal.findMany({ orderBy: { status: "asc" }, include: { account: true } }),
  ]);

  // Full ledger balance calculation
  const accountsWithBalance = accounts.map((a) => {
    const txs = allTransactions.filter((t) => t.accountId === a.id);
    const bal = txs.reduce((s, t) => t.type === "income" ? s + t.amount : t.type === "expense" ? s - t.amount : s, a.initialBalance);
    return { ...a, balanceCents: bal };
  });

  const cashBalance = accountsWithBalance.filter((a) => !a.isDebt).reduce((s, a) => s + a.balanceCents, 0);
  const debtBalance = accountsWithBalance.filter((a) => a.isDebt).reduce((s, a) => s + Math.abs(a.balanceCents), 0);
  const assetValue = assets.reduce((s, a) => s + a.currentValue, 0);
  const netWorth = cashBalance + assetValue - debtBalance;

  const rangeDays = range === "7d" ? 7 : range === "90d" ? 90 : range === "ytd" ? "ytd" : 30;
  const rangeStart = rangeDays === "ytd" ? startOfYear(new Date()) : subDays(new Date(), rangeDays as number);
  const rangeLabel = range === "7d" ? "7D" : range === "90d" ? "90D" : range === "ytd" ? "YTD" : "30D";

  const recentTxs = allTransactions.filter((t) => new Date(t.date) >= rangeStart);
  const income = recentTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expenses = recentTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const byCat: Record<string, number> = {};
  recentTxs.filter((t) => t.type === "expense" && t.category).forEach((t) => { byCat[t.category!.name] = (byCat[t.category!.name] || 0) + t.amount; });
  const topCats = Object.entries(byCat).sort(([, a], [, b]) => b - a).slice(0, 5);

  const upcomingBills = recurring.filter((r) => new Date(r.nextDate) <= subDays(new Date(), -14)).slice(0, 5);

  const monthlyRecurring = recurring.filter((r) => r.type === "expense").reduce((s, r) => {
    if (r.frequency === "monthly") return s + r.amount;
    if (r.frequency === "yearly") return s + r.amount / 12;
    if (r.frequency === "weekly") return s + (r.amount * 52) / 12;
    return s + (r.amount * 30) / r.frequencyCount;
  }, 0);

  const currencies = [...new Set<string>(accounts.map((a) => a.currency))];

  return (
    <div className="premium-page animate-fade-in">
      <div className="premium-header animate-fade-in flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="premium-kicker">Private Ledger</div>
          <h1 className="premium-title">Finance Command</h1>
          <p className="premium-subtitle">Net worth, exposure, liabilities, cashflow, and capital control</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-right sm:min-w-80">
          <MarketChip label="Base" value={currencies[0] || "USD"} />
          <MarketChip label="Window" value="Full" />
          <MarketChip label="Status" value="Local" />
        </div>
      </div>

      <div className="premium-command-grid">
        <section className="premium-command-card">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-tertiary)]">Period</div>
            <DateRangeSwitch />
          </div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-tertiary)]">Total Net Worth</div>
              <Odometer
                value={$(netWorth)}
                prefix={netWorth >= 0 ? "" : "-"}
                className={`mt-2 block font-mono text-5xl font-semibold leading-none tracking-tight sm:text-6xl ${netWorth >= 0 ? "text-[var(--emerald)]" : "text-[var(--rose)]"}`}
              />
              <div className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">{currencies[0] || "USD"}</div>
            </div>
            <div className="rounded-md border border-[rgba(215,181,109,0.28)] bg-[var(--accent-soft)] px-2.5 py-1.5 text-right">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Cashflow</div>
              <div className={`font-mono text-sm font-semibold ${income >= expenses ? "text-[var(--emerald)]" : "text-[var(--rose)]"}`}>{s$(income - expenses)}</div>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2">
            <Exposure label="Cash" value={$(cashBalance)} tone="steel" />
            <Exposure label="Assets" value={$(assetValue)} tone="gold" />
            <Exposure label="Debts" value={$(debtBalance)} tone="negative" prefix="-" />
          </div>
        </section>

        <section className="grid grid-cols-2 gap-2 animate-stagger">
          <Stat l={`Income ${rangeLabel}`} v={`+${s$(income)}`} u="" tone="positive" link="/finance/accounts" />
          <Stat l={`Expenses ${rangeLabel}`} v={`-${s$(expenses)}`} u="" tone="negative" link="/finance/accounts" />
          <Stat l="Bills / Mo" v={s$(monthlyRecurring)} u="" tone="amber" link="/finance/recurring" />
          <Stat l="Accounts" v={`${accounts.length}`} u={`${assets.length} assets`} tone="neutral" link="/finance/accounts" />
        </section>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Section title="Accounts" kicker="Cash" action={{ label: "All", href: "/finance/accounts" }}>
          {accountsWithBalance.filter((a) => !a.isDebt).length === 0 ? (
            <Empty icon="M3 10h18M3 14h18M3 6h18M3 18h18" title="No cash accounts" description="Track your checking, savings, and cash accounts." action={{ label: "Add Account", href: "/finance/accounts/new" }} />
          ) : (
            <div className="space-y-1 animate-stagger">
              {accountsWithBalance.filter((a) => !a.isDebt).slice(0, 4).map((a) => (
                <Link key={a.id} href={`/finance/accounts/${a.id}`} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-[var(--surface-hover)]">
                  <div className="min-w-0"><div className="truncate text-sm font-medium text-[var(--text)]">{a.name}</div><div className="text-xs capitalize text-[var(--text-tertiary)]">{a.type}</div></div>
                  <span className={`shrink-0 font-mono text-sm font-semibold ${a.balanceCents >= 0 ? "text-[var(--emerald)]" : "text-[var(--rose)]"}`}>{f$(a.balanceCents)}</span>
                </Link>
              ))}
            </div>
          )}
        </Section>

        <Section title="Upcoming Bills" kicker="Due" action={{ label: "All", href: "/finance/recurring" }}>
          {upcomingBills.length === 0 ? (
            <Empty icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" title="No upcoming bills" description="Schedule your recurring payments." action={{ label: "Add Bill", href: "/finance/recurring/new" }} />
          ) : (
            <div className="space-y-1 animate-stagger">
              {upcomingBills.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-[var(--surface-hover)]">
                  <div className="min-w-0"><div className="truncate text-sm font-medium text-[var(--text)]">{r.description}</div><div className="text-xs text-[var(--text-tertiary)]">Due {format(new Date(r.nextDate), "MMM d")} | {r.account.name}</div></div>
                  <span className="shrink-0 font-mono text-sm font-semibold text-[var(--amber)]">{s$(r.amount)} {r.currency}</span>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Goals" kicker="Target" action={{ label: "All", href: "/finance/goals" }}>
          {goals.length === 0 ? (
            <Empty icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" title="No goals yet" description="Set savings targets and track progress." action={{ label: "Set Goal", href: "/finance/goals/new" }} />
          ) : (
            <div className="space-y-3 animate-stagger">
              {goals.slice(0, 4).map((g) => {
                const pct = g.targetAmount > 0 ? Math.min((g.currentAmount / g.targetAmount) * 100, 100) : 0;
                return (
                  <Link key={g.id} href={`/finance/goals/${g.id}`} className="block rounded-lg p-3 transition-colors hover:bg-[var(--surface-hover)]">
                    <div className="mb-2 flex items-center justify-between gap-3"><span className="truncate text-sm font-medium text-[var(--text)]">{g.name}</span><span className="shrink-0 font-mono text-xs text-[var(--text-secondary)]">{s$(g.currentAmount)} / {s$(g.targetAmount)}</span></div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[var(--border-light)]"><div className="h-full rounded-full bg-[var(--emerald)] transition-all" style={{ width: `${pct}%` }} /></div>
                    <div className="mt-1 text-[11px] text-[var(--text-tertiary)]">{pct.toFixed(0)}% complete</div>
                  </Link>
                );
              })}
            </div>
          )}
        </Section>

        <Section title="Top Spending" kicker={rangeLabel} action={{ label: "Reports", href: "/finance/reports" }}>
          {topCats.length === 0 ? (
            <Empty icon="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" title="No spending data" description="Categorize transactions to see spending breakdowns." action={{ label: "View Accounts", href: "/finance/accounts" }} />
          ) : (
            <div className="space-y-2.5 animate-stagger">
              {topCats.map(([name, amt]) => (
                <div key={name} className="flex items-center gap-3 px-3 py-1">
                  <span className="flex-1 text-sm font-medium text-[var(--text-secondary)]">{name}</span>
                  <span className="font-mono text-sm font-semibold text-[var(--rose)]">{s$(amt)}</span>
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--border-light)]"><div className="h-full rounded-full bg-[var(--rose)]" style={{ width: `${expenses > 0 ? (amt / expenses) * 100 : 0}%` }} /></div>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

      <Section title="Recent Ledger" kicker="Transactions" action={{ label: "View All", href: "/finance/accounts" }}>
        {allTransactions.length === 0 ? (
          <Empty icon="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" title="No transactions yet" description="Start tracking your money by adding transactions." action={{ label: "Add Transaction", href: "/finance/accounts" }} />
        ) : (
          <div className="overflow-hidden rounded-lg border border-[var(--border-light)] animate-stagger">
            {allTransactions.slice(0, 8).map((t) => (
              <div key={t.id} className="flex items-center gap-3 border-b border-[var(--border-light)] px-3 py-2.5 transition-colors last:border-b-0 hover:bg-[var(--surface-hover)]">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-[var(--text)]">{t.description || t.category?.name || "Transaction"}</div>
                  <div className="text-xs text-[var(--text-tertiary)]">{format(new Date(t.date), "MMM d")}{t.account && ` | ${t.account.name}`}{t.category && ` | ${t.category.name}`}{t.status !== "pending" && ` · ${t.status}`}</div>
                </div>
                <span className={`whitespace-nowrap font-mono text-sm font-semibold ${t.type === "income" ? "text-[var(--emerald)]" : t.type === "expense" ? "text-[var(--rose)]" : "text-[var(--text-tertiary)]"}`}>{t.type === "income" ? "+" : t.type === "expense" ? "-" : ""}{f$(t.amount)} {t.currency}</span>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Liabilities" kicker="Debts" action={{ label: "Manage", href: "/finance/debts" }}>
        {accountsWithBalance.filter((a) => a.isDebt).length === 0 ? (
          <Empty icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" title="No liabilities" description="Track credit cards, loans, and mortgages." action={{ label: "Add Account", href: "/finance/accounts/new" }} />
        ) : (
          <div className="space-y-1 animate-stagger">
            {accountsWithBalance.filter((a) => a.isDebt).map((a) => (
              <Link key={a.id} href={`/finance/accounts/${a.id}`} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-[var(--surface-hover)]">
                <div className="min-w-0"><div className="truncate text-sm font-medium text-[var(--text)]">{a.name}</div><div className="text-xs text-[var(--text-tertiary)]">{a.interestRate != null && `${a.interestRate}% APR`}{a.minimumPayment != null && ` | Min ${s$(a.minimumPayment)}`}</div></div>
                <span className="shrink-0 font-mono text-sm font-semibold text-[var(--rose)]">{s$(Math.abs(a.balanceCents))} {a.currency}</span>
              </Link>
            ))}
          </div>
        )}
      </Section>
      <Fab href="/finance/accounts" icon="M12 6v6m0 0v6m0-6h6m-6 0H6" label="Add Transaction" />
    </div>
  );
}

function toneClass(tone: Tone) {
  const tones: Record<Tone, string> = { positive: "text-[var(--emerald)]", negative: "text-[var(--rose)]", gold: "text-[var(--accent)]", steel: "text-[var(--sky)]", amber: "text-[var(--amber)]", neutral: "text-[var(--text)]" };
  return tones[tone];
}

function MarketChip({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md border border-[var(--border)] bg-[rgba(255,255,255,0.025)] px-2 py-1.5 shadow-[0_1px_0_rgba(255,255,255,0.035)_inset]"><div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">{label}</div><div className="font-mono text-xs font-semibold text-[var(--text)]">{value}</div></div>;
}

function Stat({ l, v, u, tone, link }: { l: string; v: string; u: string; tone: Tone; link?: string }) {
  const c = <div className="premium-stat cursor-pointer transition-all hover:border-[var(--border-strong)] hover:shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_24px_76px_rgba(0,0,0,0.38)]"><div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">{l}</div><div className={`mt-2 font-mono text-2xl font-semibold tracking-tight ${toneClass(tone)}`}>{v}</div>{u && <div className="mt-1 text-xs text-[var(--text-tertiary)]">{u}</div>}</div>;
  if (link) return <Link href={link}>{c}</Link>;
  return c;
}

function Exposure({ label, value, tone, prefix = "" }: { label: string; value: number; tone: Tone; prefix?: string }) {
  return <Link href="/finance/accounts" className="block rounded-md border border-[var(--border-light)] bg-[rgba(255,255,255,0.025)] p-2.5 transition-all hover:border-[var(--border)] hover:bg-[rgba(255,255,255,0.04)]"><div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">{label}</div><div className={`mt-1 font-mono text-lg font-semibold ${toneClass(tone)}`}>{prefix}{Math.round(value).toLocaleString()}</div></Link>;
}

function Section({ title, kicker, children, action }: { title: string; kicker: string; children: React.ReactNode; action?: { label: string; href: string } }) {
  return <section className="premium-panel animate-fade-in"><div className="mb-3 flex items-center justify-between gap-3"><h2 className="text-sm font-semibold text-[var(--text)]">{title}</h2><div className="flex items-center gap-2"><span className="rounded border border-[var(--border-light)] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">{kicker}</span>{action && <Link href={action.href} className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]">{action.label} →</Link>}</div></div>{children}</section>;
}

function Empty({ icon, title, description, action }: { icon: string; title: string; description: string; action?: { label: string; href: string } }) {
  return <div className="flex flex-col items-center justify-center py-10 px-4 text-center"><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={icon} /></svg></div><h3 className="mb-1 text-sm font-semibold text-[var(--text)]">{title}</h3><p className="mb-4 max-w-xs text-xs text-[var(--text-tertiary)]">{description}</p>{action && <Link href={action.href} className="premium-action text-xs">{action.label}</Link>}</div>;
}
