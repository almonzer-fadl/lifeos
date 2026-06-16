import Link from "next/link";
import { db } from "@/lib/db";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function LabsPage() {
  const labs = await db.labResult.findMany({ orderBy: { date: "desc" }, take: 30 });
  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in"><div className="premium-kicker">Blood Work</div><h1 className="premium-title">Lab Results</h1><p className="premium-subtitle">{labs.length} results</p></div>
      <section className="premium-panel animate-fade-in">
        {labs.length === 0 ? (
          <div className="py-10 text-center"><p className="text-sm text-[var(--text-tertiary)]">No lab results</p><Link href="/body/log/labs" className="premium-action mt-3 text-xs">Log First Result</Link></div>
        ) : (
          <div className="divide-y divide-[var(--border-light)]">
            {labs.map((l) => (
              <Link key={l.id} href={`/body/labs/${l.id}`} className="flex items-center justify-between gap-3 px-3 py-3 transition-colors hover:bg-[var(--surface-hover)]">
                <div className="min-w-0 flex-1"><div className="text-sm font-semibold text-[var(--text)]">{l.testName}</div><div className="text-xs text-[var(--text-tertiary)]">{format(new Date(l.date), "MMM d, yyyy")}</div></div>
                <div className="text-right"><span className="font-mono text-sm font-semibold text-[var(--text)]">{l.value} <span className="text-[10px] text-[var(--text-tertiary)]">{l.unit}</span></span></div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
