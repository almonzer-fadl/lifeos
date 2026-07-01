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
      <div className="premium-header flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="premium-kicker">Confidential Ledger</div>
          <h1 className="premium-title">Financial Command</h1>
          <p className="premium-subtitle">Comprehensive management of net worth, exposure, and capital flow.</p>
        </div>
        <div className="flex gap-2">
          <MarketChip label="Currency" value={currencies[0] || "USD"} />
          <MarketChip label="Status" value="Verified" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <section className="premium-panel lg:col-span-7">
          <div className="mb-6 flex items-center justify-between">
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">Capital Position</div>
            <DateRangeSwitch />
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">Consolidated Net Worth</div>
            <div className="flex items-baseline gap-3">
              <Odometer
                value={$(netWorth)}
                prefix={netWorth >= 0 ? "" : "-"}
                className={`font-serif text-5xl font-normal leading-tight tracking-tight sm:text-6xl ${netWorth >= 0 ? "text-[var(--text)]" : "text-[var(--rose)]"}`}
              />
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">{currencies[0] || "USD"}</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${income >= expenses ? "bg-[var(--emerald-soft)] text-[var(--emerald)]" : "bg-[var(--rose-soft)] text-[var(--rose)]"}`}>
                {income >= expenses ? "↑" : "↓"} {s$(Math.abs(income - expenses))}
              </div>
              <span className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)]">Cashflow {rangeLabel}</span>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3">
            <Exposure label="Cash" value={$(cashBalance)} tone="neutral" />
            <Exposure label="Assets" value={$(assetValue)} tone="gold" />
            <Exposure label="Liabilities" value={$(debtBalance)} tone="negative" prefix="-" />
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 lg:col-span-5">
          <Stat l={`Income ${rangeLabel}`} v={`+${s$(income)}`} tone="positive" link="/finance/accounts" />
          <Stat l={`Expenses ${rangeLabel}`} v={`-${s$(expenses)}`} tone="negative" link="/finance/accounts" />
          <Stat l="Recurring Mo." v={s$(monthlyRecurring)} tone="amber" link="/finance/recurring" />
          <Stat l="Asset Count" v={`${assets.length}`} u={`${accounts.length} Accounts`} tone="neutral" link="/finance/accounts" />
        </section>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Section title="Cash Accounts" kicker="Liquidity" action={{ label: "Manage", href: "/finance/accounts" }}>
          <div className="space-y-1">
            {accountsWithBalance.filter((a) => !a.isDebt).slice(0, 4).map((a) => (
              <Link key={a.id} href={`/finance/accounts/${a.id}`} className="flex items-center justify-between gap-4 rounded-xl px-4 py-3 transition-colors hover:bg-[rgba(255,255,255,0.03)]">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-[var(--text)]">{a.name}</div>
                  <div className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">{a.type}</div>
                </div>
                <span className={`shrink-0 text-sm font-medium ${a.balanceCents >= 0 ? "text-[var(--text)]" : "text-[var(--rose)]"}`}>{f$(a.balanceCents)}</span>
              </Link>
            ))}
          </div>
        </Section>

        <Section title="Upcoming Bills" kicker="Obligations" action={{ label: "View All", href: "/finance/recurring" }}>
          <div className="space-y-1">
            {upcomingBills.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-4 rounded-xl px-4 py-3 transition-colors hover:bg-[rgba(255,255,255,0.02)]">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-[var(--text)]">{r.description}</div>
                  <div className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">Due {format(new Date(r.nextDate), "MMM d")}</div>
                </div>
                <span className="shrink-0 text-sm font-medium text-[var(--amber)]">{s$(r.amount)}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Section title="Recent Activity" kicker="Ledger" action={{ label: "Full Audit", href: "/finance/accounts" }}>
        <div className="overflow-hidden rounded-2xl border border-[var(--border-light)]">
          {allTransactions.slice(0, 8).map((t) => (
            <div key={t.id} className="flex items-center gap-4 border-b border-[var(--border-light)] px-5 py-4 transition-colors last:border-b-0 hover:bg-[rgba(255,255,255,0.02)]">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-[var(--text)]">{t.description || t.category?.name || "Private Transaction"}</div>
                <div className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
                  {format(new Date(t.date), "MMMM d")}{t.account && ` · ${t.account.name}`}
                </div>
              </div>
              <span className={`whitespace-nowrap text-sm font-medium ${t.type === "income" ? "text-[var(--emerald)]" : t.type === "expense" ? "text-[var(--rose)]" : "text-[var(--text-tertiary)]"}`}>
                {t.type === "income" ? "+" : t.type === "expense" ? "-" : ""}{f$(t.amount)}
              </span>
            </div>
          ))}
        </div>
      </Section>
      <Fab href="/finance/accounts" icon="M12 6v6m0 0v6m0-6h6m-6 0H6" label="Add Entry" />
    </div>
  );
}

function toneClass(tone: Tone) {
  const tones: Record<Tone, string> = { positive: "text-[var(--emerald)]", negative: "text-[var(--rose)]", gold: "text-[var(--accent)]", steel: "text-[var(--sky)]", amber: "text-[var(--amber)]", neutral: "text-[var(--text)]" };
  return tones[tone];
}

function MarketChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[rgba(255,255,255,0.02)] px-3 py-2">
      <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">{label}</div>
      <div className="text-xs font-medium text-[var(--text-secondary)]">{value}</div>
    </div>
  );
}

function Stat({ l, v, u, tone, link }: { l: string; v: string; u?: string; tone: Tone; link?: string }) {
  const c = (
    <div className="premium-stat group">
      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)] transition-colors group-hover:text-[var(--accent)]">{l}</div>
      <div className={`mt-3 text-2xl font-normal leading-none ${toneClass(tone)}`}>{v}</div>
      {u && <div className="mt-2 text-[10px] uppercase tracking-widest text-[var(--text-tertiary)]">{u}</div>}
    </div>
  );
  if (link) return <Link href={link}>{c}</Link>;
  return c;
}

function Exposure({ label, value, tone, prefix = "" }: { label: string; value: number; tone: Tone; prefix?: string }) {
  return (
    <div className="flex-1 rounded-xl border border-[var(--border-light)] bg-[rgba(255,255,255,0.01)] p-4 transition-all hover:bg-[rgba(255,255,255,0.03)]">
      <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">{label}</div>
      <div className={`mt-1 text-lg font-medium ${toneClass(tone)}`}>{prefix}{Math.round(value).toLocaleString()}</div>
    </div>
  );
}

function Section({ title, kicker, children, action }: { title: string; kicker: string; children: React.ReactNode; action?: { label: string; href: string } }) {
  return (
    <section className="premium-panel">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-serif text-[var(--text)]">{title}</h2>
          <p className="text-[9px] uppercase tracking-[0.2em] text-[var(--text-tertiary)]">{kicker}</p>
        </div>
        {action && (
          <Link href={action.href} className="text-[10px] font-semibold uppercase tracking-widest text-[var(--accent)] hover:underline">
            {action.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}


function Empty({ icon, title, description, action }: { icon: string; title: string; description: string; action?: { label: string; href: string } }) {
  return <div className="flex flex-col items-center justify-center py-10 px-4 text-center"><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={icon} /></svg></div><h3 className="mb-1 text-sm font-semibold text-[var(--text)]">{title}</h3><p className="mb-4 max-w-xs text-xs text-[var(--text-tertiary)]">{description}</p>{action && <Link href={action.href} className="premium-action text-xs">{action.label}</Link>}</div>;
}
