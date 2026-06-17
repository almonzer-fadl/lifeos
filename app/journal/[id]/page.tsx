import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { DeleteButton } from "@/components/ui/delete-button";

export const dynamic = "force-dynamic";

export default async function JournalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entry = await db.journalEntry.findUnique({ where: { id } });
  if (!entry) notFound();

  return (
    <div className="premium-page animate-fade-in">
      <div className="premium-header animate-fade-in">
        <div className="flex items-center gap-2"><Link href="/journal" className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg></Link><div className="premium-kicker">Journal Entry</div></div>
        <h1 className="premium-title">{format(new Date(entry.createdAt), "MMMM d, yyyy")}</h1>
        <p className="premium-subtitle">{format(new Date(entry.createdAt), "HH:mm")}{entry.mood ? ` · ${entry.mood}` : ""}</p>
      </div>
      <section className="premium-panel animate-fade-in">
        <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">{entry.content}</p>
        {entry.tags && <div className="mt-4 flex gap-1 flex-wrap">{entry.tags.split(",").map((t: string) => <span key={t} className="premium-chip">{t.trim()}</span>)}</div>}
      </section>
      <div className="flex justify-end"><DeleteButton url={`/api/productivity/journal?id=${entry.id}`} itemName="journal entry" /></div>
    </div>
  );
}
