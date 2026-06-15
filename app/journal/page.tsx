import { db } from "@/lib/db";
import { JournalForm } from "@/components/modules/journal/journal-form";
import { format, subDays } from "date-fns";

export const dynamic = "force-dynamic";

const MOODS: Record<string, string> = { great: "😄", good: "🙂", okay: "😐", bad: "😔", terrible: "😞" };

export default async function JournalPage() {
  const thirtyDaysAgo = subDays(new Date(), 30);
  const entries = await db.journalEntry.findMany({ where: { date: { gte: thirtyDaysAgo } }, orderBy: { date: "desc" }, take: 31 });

  return (
    <div className="p-5 lg:p-8 space-y-5">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">Journal</h1>
        <p className="text-sm text-stone-500 mt-0.5">Daily notes and mood tracking</p>
      </div>

      <Section title="New Entry">
        <JournalForm />
      </Section>

      <div className="space-y-3 animate-stagger">
        {entries.length === 0 ? <Empty msg="No entries yet. Start journaling." /> : (
          entries.map((e: { id: string; date: Date; content: string; mood: string | null; tags: string | null }) => (
            <div key={e.id} className="rounded-2xl bg-white border border-[var(--border)] shadow-[var(--shadow-card)] p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold text-stone-500">{format(new Date(e.date), "EEEE, MMMM d, yyyy")}</span>
                {e.mood && <span className="text-xl">{MOODS[e.mood] || e.mood}</span>}
              </div>
              <div className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">{e.content}</div>
              {e.tags && (
                <div className="flex gap-1.5 mt-3 flex-wrap">
                  {e.tags.split(",").filter(Boolean).map(tag => (
                    <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 border border-[var(--border-light)]">#{tag.trim()}</span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl bg-white border border-[var(--border)] shadow-[var(--shadow-card)] p-5 animate-fade-in"><h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">{title}</h2>{children}</section>;
}

function Empty({ msg }: { msg: string }) {
  return <div className="rounded-2xl bg-white border border-[var(--border)] shadow-[var(--shadow-card)] p-8 text-center text-sm text-stone-400">{msg}</div>;
}
