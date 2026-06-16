import Link from "next/link";
import { db } from "@/lib/db";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function RecurringPage() {
  const recurring = await db.recurringTransaction.findMany({
    where: { isActive: true },
    orderBy: { nextDate: "asc" },
    include: { account: true, category: true },
  });

  const upcoming = recurring.filter((r) => new Date(r.nextDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  const later = recurring.filter((r) => new Date(r.nextDate) > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

  const monthlyTotal = recurring.filter((r) => r.type === "expense").reduce((s, r) => {
    if (r.frequency === "monthly") return s + r.amount;
    if (r.frequency === "yearly") return s + r.amount / 12;
    if (r.frequency === "weekly") return s + (r.amount * 52) / 12;
    return s + (r.amount * 30) / r.frequencyCount;
  }, 0);

  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="premium-kicker">Forward Obligations</div>
          <h1 className="premium-title">Recurring Bills</h1>
          <p className="premium-subtitle">{recurring.length} scheduled payments</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Monthly Outflow</div>
          <div className="font-mono text-2xl font-semibold text-[var(--amber)]">{monthlyTotal.toFixed(0)}</div>
        </div>
      </div>

      {recurring.length === 0 ? (
        <section className="premium-panel animate-fade-in">
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="mb-1 text-sm font-semibold text-[var(--text)]">No recurring bills</h3>
            <p className="mb-4 max-w-xs text-xs text-[var(--text-tertiary)]">Schedule your subscriptions, bills, and recurring payments.</p>
            <Link href="/finance/recurring/new" className="premium-action">Add Bill</Link>
          </div>
        </section>
      ) : (
        <>
          <Section title="Upcoming (30 Days)" kicker={`${upcoming.length}`}>
            <div className="space-y-1">
              {upcoming.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-[var(--surface-hover)]">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-[var(--text)]">{r.description}</div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="text-xs capitalize text-[var(--text-tertiary)]">{r.frequency}</span>
                      <span className="text-xs text-[var(--text-tertiary)]">{r.account.name}</span>
                      <span className="text-xs text-[var(--amber)]">Due {format(new Date(r.nextDate), "MMM d")}</span>
                    </div>
                  </div>
                  <span className={`shrink-0 font-mono text-sm font-semibold ${r.type === "expense" ? "text-[var(--rose)]" : "text-[var(--emerald)]"}`}>
                    {r.type === "expense" ? "-" : "+"}{r.amount.toFixed(2)} {r.currency}
                  </span>
                </div>
              ))}
            </div>
          </Section>
          {later.length > 0 && (
            <Section title="Later" kicker={`${later.length}`}>
              <div className="space-y-1">
                {later.map((r) => (
                  <div key={r.id} className="flex items-center justify-between gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-[var(--surface-hover)]">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-[var(--text)]">{r.description}</div>
                      <div className="mt-0.5 text-xs text-[var(--text-tertiary)]">Next {format(new Date(r.nextDate), "MMM d, yyyy")}</div>
                    </div>
                    <span className="shrink-0 font-mono text-sm font-semibold text-[var(--text-secondary)]">{r.amount.toFixed(2)} {r.currency}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </>
      )}
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
