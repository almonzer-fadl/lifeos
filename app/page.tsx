import Link from "next/link";
import { db } from "@/lib/db";
import { subDays } from "date-fns";
import { Fab } from "@/components/ui/fab";
import { AIDashboardWidget } from "@/components/modules/ai/insights-widget";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const thirtyDaysAgo = subDays(new Date(), 30);
  const sevenDaysAgo = subDays(new Date(), 7);

  const [accounts, transactions, habits, tasks, sleepSessions, glucoseReadings] = await Promise.all([
    db.account.findMany({ where: { isActive: true } }),
    db.transaction.findMany({ where: { date: { gte: thirtyDaysAgo } }, include: { category: true } }),
    db.habit.findMany({ include: { logs: { where: { date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } } } }),
    db.task.findMany({ where: { status: { in: ["todo", "in_progress"] } }, orderBy: { createdAt: "desc" }, take: 5 }),
    db.sleepSession.findMany({ where: { startTime: { gte: sevenDaysAgo } }, orderBy: { startTime: "desc" }, take: 7 }),
    db.glucoseReading.findMany({ where: { timestamp: { gte: subDays(new Date(), 1) } }, orderBy: { timestamp: "desc" }, take: 1 }),
  ]);

  const cashBalance = accounts.filter((a) => !a.isDebt).reduce((s, a) => s + a.initialBalance, 0);
  const debtBalance = accounts.filter((a) => a.isDebt).reduce((s, a) => s + Math.abs(a.initialBalance), 0);
  const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const habitsDone = habits.filter((h) => h.logs.some((l) => l.completed)).length;
  const pendingTasks = tasks.length;
  const avgSleep = sleepSessions.length > 0
    ? sleepSessions.reduce((s, x) => s + (new Date(x.endTime).getTime() - new Date(x.startTime).getTime()) / 3600000, 0) / sleepSessions.length
    : 0;
  const latestGlucose = glucoseReadings[0]?.value || null;

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="premium-page animate-fade-in">
      <div className="premium-header">
        <div className="premium-kicker">{new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(now)}</div>
        <h1 className="premium-title">{greeting}, Almonzer</h1>
        <p className="premium-subtitle">Your private office is up to date with your latest wellness and management metrics.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 animate-stagger">
        <Widget label="Total Capital" value={cashBalance - debtBalance > 0 ? `+${(cashBalance - debtBalance).toFixed(0)}` : `${(cashBalance - debtBalance).toFixed(0)}`} tone={cashBalance >= debtBalance ? "positive" : "negative"} href="/finance" />
        <Widget label="Monthly Flow" value={income >= expenses ? `+${(income - expenses).toFixed(0)}` : `${(income - expenses).toFixed(0)}`} tone={income >= expenses ? "positive" : "negative"} href="/finance" />
        <Widget label="Habit Streak" value={`${habitsDone}/${habits.length}`} tone={habitsDone === habits.length && habits.length > 0 ? "positive" : "neutral"} href="/habits" />
        <Widget label="Agenda" value={`${pendingTasks} Items`} tone={pendingTasks > 0 ? "amber" : "neutral"} href="/tasks" />
        {avgSleep > 0 && <Widget label="Rest Quality" value={`${avgSleep.toFixed(1)}h`} tone="steel" href="/sleep" />}
        {latestGlucose && <Widget label="Vital Sign" value={`${latestGlucose}`} tone={latestGlucose < 70 ? "negative" : latestGlucose > 180 ? "amber" : "positive"} href="/t1d" />}
        <Widget label="Holdings" value={`${accounts.length} Accounts`} tone="neutral" href="/finance/accounts" />
        <Widget label="Receipts" value={`+${income.toFixed(0)}`} tone="positive" href="/finance" />
      </div>

      <div className="my-4">
        <AIDashboardWidget />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {pendingTasks > 0 && (
          <section className="premium-panel">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-serif text-[var(--text)]">Daily Agenda</h2>
                <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">Immediate focus items</p>
              </div>
              <Link href="/tasks" className="text-[10px] font-semibold uppercase tracking-widest text-[var(--accent)] hover:underline">View All</Link>
            </div>
            <div className="space-y-1">
              {tasks.map((t) => (
                <Link key={t.id} href={`/tasks/${t.id}`} className="group flex items-center gap-4 rounded-xl px-4 py-3 transition-colors hover:bg-[rgba(255,255,255,0.03)]">
                  <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${t.status === "in_progress" ? "bg-[var(--sky)]" : "bg-[var(--accent)]"}`} />
                  <span className="truncate text-sm text-[var(--text-secondary)] group-hover:text-[var(--text)]">{t.title}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
        {transactions.length > 0 && (
          <section className="premium-panel">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-serif text-[var(--text)]">Recent Ledger</h2>
                <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">Latest financial movements</p>
              </div>
              <Link href="/finance/accounts" className="text-[10px] font-semibold uppercase tracking-widest text-[var(--accent)] hover:underline">Full Audit</Link>
            </div>
            <div className="space-y-1">
              {transactions.slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-xl px-4 py-3 transition-colors hover:bg-[rgba(255,255,255,0.02)]">
                  <span className="truncate text-sm text-[var(--text-secondary)]">{t.description || t.category?.name || "Private Transaction"}</span>
                  <span className={`shrink-0 ml-4 text-sm font-medium ${t.type === "income" ? "text-[var(--emerald)]" : "text-[var(--rose)]"}`}>{t.type === "income" ? "+" : "-"}{t.amount.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
      <Fab href="/t1d/log" icon="M12 6v6m0 0v6m0-6h6m-6 0H6" label="New Entry" />
    </div>
  );
}

function Widget({ label, value, tone, href }: { label: string; value: string; tone: string; href: string }) {
  const tones: Record<string, string> = { positive: "text-[var(--emerald)]", negative: "text-[var(--rose)]", amber: "text-[var(--amber)]", steel: "text-[var(--sky)]", neutral: "text-[var(--text)]" };
  return (
    <Link href={href} className="premium-stat group">
      <div className="premium-label transition-colors group-hover:text-[var(--accent)]">{label}</div>
      <div className={`premium-value ${tones[tone] || tones.neutral}`}>{value}</div>
    </Link>
  );
}
