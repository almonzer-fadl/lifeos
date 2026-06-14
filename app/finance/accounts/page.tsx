import Link from "next/link";
import { db } from "@/lib/db";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

type AcctLike = { id: string; name: string; currency: string; type: string; initialBalance: number; isDebt: boolean; createdAt: Date; interestRate: number | null; minimumPayment: number | null };

export default async function AccountsPage() {
  const accounts = await db.account.findMany({
    where: { isActive: true },
    orderBy: [{ isDebt: "asc" }, { name: "asc" }],
  });

  const totalCash = accounts.filter((a) => !a.isDebt).length;
  const totalDebt = accounts.filter((a) => a.isDebt).length;

  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in">
        <div className="premium-kicker">Capital Registry</div>
        <h1 className="premium-title">Accounts</h1>
        <p className="premium-subtitle">{totalCash} cash accounts, {totalDebt} liabilities</p>
      </div>

      {accounts.length === 0 ? (
        <section className="premium-panel animate-fade-in">
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M3 6h18M3 18h18" />
              </svg>
            </div>
            <h3 className="mb-1 text-sm font-semibold text-[var(--text)]">No accounts yet</h3>
            <p className="mb-4 max-w-xs text-xs text-[var(--text-tertiary)]">Create your first account to start tracking your money.</p>
            <Link href="/finance/accounts/new" className="premium-action">Create Account</Link>
          </div>
        </section>
      ) : (
        <>
          {accounts.filter((a) => !a.isDebt).length > 0 && (
            <Section title="Cash Accounts" kicker={`${totalCash}`}>
              <div className="space-y-1">
                {accounts.filter((a) => !a.isDebt).map((a: AcctLike) => (
                  <Link
                    key={a.id}
                    href={`/finance/accounts/${a.id}`}
                    className="flex items-center justify-between gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-[var(--surface-hover)]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-[var(--text)]">{a.name}</div>
                      <div className="mt-0.5 flex items-center gap-2">
                        <span className="text-xs capitalize text-[var(--text-tertiary)]">{a.type}</span>
                        <span className="rounded border border-[var(--border-light)] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[var(--text-tertiary)]">{a.currency}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm font-semibold text-[var(--emerald)]">{a.initialBalance.toFixed(2)}</div>
                      <div className="text-[10px] text-[var(--text-tertiary)]">{format(new Date(a.createdAt), "MMM d, yyyy")}</div>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </Section>
          )}

          {accounts.filter((a) => a.isDebt).length > 0 && (
            <Section title="Liabilities" kicker={`${totalDebt}`}>
              <div className="space-y-1">
                {accounts.filter((a) => a.isDebt).map((a: AcctLike) => (
                  <Link
                    key={a.id}
                    href={`/finance/accounts/${a.id}`}
                    className="flex items-center justify-between gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-[var(--surface-hover)]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-[var(--text)]">{a.name}</div>
                      <div className="mt-0.5 flex items-center gap-2">
                        <span className="text-xs capitalize text-[var(--text-tertiary)]">{a.type}</span>
                        {a.interestRate != null && (
                          <span className="text-[10px] text-[var(--amber)]">{a.interestRate}% APR</span>
                        )}
                        <span className="rounded border border-[var(--border-light)] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[var(--text-tertiary)]">{a.currency}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm font-semibold text-[var(--rose)]">{a.initialBalance.toFixed(2)}</div>
                      {a.minimumPayment != null && (
                        <div className="text-[10px] text-[var(--text-tertiary)]">Min {a.minimumPayment}</div>
                      )}
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
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
