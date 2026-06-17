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
        <h1 className="premium-title">Welcome home, Almonzer.</h1>
        <p className="premium-subtitle">Your estate is currently operating within optimal parameters. Here is your daily summary.</p>
      </div>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 animate-stagger">
        <Widget label="Consolidated Capital" value={cashBalance - debtBalance > 0 ? `+${(cashBalance - debtBalance).toFixed(0)}` : `${(cashBalance - debtBalance).toFixed(0)}`} tone={cashBalance >= debtBalance ? "positive" : "negative"} href="/finance" />
        <Widget label="Monthly Cashflow" value={income >= expenses ? `+${(income - expenses).toFixed(0)}` : `${(income - expenses).toFixed(0)}`} tone={income >= expenses ? "positive" : "negative"} href="/finance" />
        <Widget label="Discipline Streak" value={`${habitsDone}/${habits.length}`} tone={habitsDone === habits.length && habits.length > 0 ? "positive" : "neutral"} href="/habits" />
        <Widget label="Pending Actions" value={`${pendingTasks}`} tone={pendingTasks > 0 ? "amber" : "neutral"} href="/tasks" />
      </div>

      <div className="my-8">
        <AIDashboardWidget />
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <section className="space-y-8">
            <div>
              <h2 className="text-xl font-serif text-[var(--text)]">Daily Agenda</h2>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-tertiary)] mt-1">Priority Tasks</p>
            </div>
            <div className="space-y-1">
              {tasks.map((t) => (
                <Link key={t.id} href={`/tasks/${t.id}`} className="group flex items-center gap-4 rounded-2xl p-4 transition-all hover:bg-white hover:shadow-md">
                  <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${t.status === "in_progress" ? "bg-[var(--sky)]" : "bg-[var(--accent)]"}`} />
                  <span className="truncate text-sm text-[var(--text-secondary)] group-hover:text-[var(--text)]">{t.title}</span>
                </Link>
              ))}
            </div>
            <Link href="/tasks" className="premium-action text-xs">View Full Agenda</Link>
          </section>
        </div>

        <div className="lg:col-span-8">
          <section className="space-y-8">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-xl font-serif text-[var(--text)]">Financial Ledger</h2>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-tertiary)] mt-1">Recent Movements</p>
              </div>
              <Link href="/finance/accounts" className="text-[10px] font-semibold uppercase tracking-widest text-[var(--accent)] hover:underline">Full Audit →</Link>
            </div>
            <div className="overflow-hidden rounded-[40px] bg-white p-2 shadow-lg">
              {transactions.slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-[32px] px-8 py-5 transition-colors hover:bg-[var(--bg)]">
                  <span className="truncate text-sm font-medium text-[var(--text-secondary)]">{t.description || t.category?.name || "Private Transaction"}</span>
                  <span className={`shrink-0 ml-4 text-sm font-serif ${t.type === "income" ? "text-[var(--emerald)]" : "text-[var(--rose)]"}`}>{t.type === "income" ? "+" : "-"}{t.amount.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
      <Fab href="/t1d/log" icon="M12 6v6m0 0v6m0-6h6m-6 0H6" label="New Registry" />
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
