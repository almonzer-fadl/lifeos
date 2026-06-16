import Link from "next/link";
import { db } from "@/lib/db";
import { format, subDays } from "date-fns";

export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const entries = await db.journalEntry.findMany({ orderBy: { createdAt: "desc" }, take: 30 });

  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in">
        <div className="premium-kicker">Personal Log</div>
        <h1 className="premium-title">Journal</h1>
        <p className="premium-subtitle">{entries.length} entries</p>
      </div>
      <section className="premium-panel animate-fade-in">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </div>
            <p className="text-sm text-[var(--text-tertiary)]">No journal entries yet</p>
            <Link href="/journal/new" className="premium-action mt-3 text-xs">Write First Entry</Link>
          </div>
        ) : (
          <div className="space-y-4 animate-stagger">
            {entries.map((e) => (
              <Link key={e.id} href={`/journal/${e.id}`} className="block rounded-lg border border-[var(--border-light)] bg-[var(--surface-raised)] p-4 transition-all hover:border-[var(--border)]">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--text-tertiary)]">{format(new Date(e.createdAt), "MMM d, yyyy · HH:mm")}</span>
                    {e.mood && <span className="text-xs">{e.mood}</span>}
                  </div>
                </div>
                <p className="text-sm text-[var(--text-secondary)] line-clamp-3">{e.content}</p>
                {e.tags && <div className="mt-2 flex gap-1 flex-wrap">{e.tags.split(",").map((t: string) => <span key={t} className="premium-chip">{t.trim()}</span>)}</div>}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
