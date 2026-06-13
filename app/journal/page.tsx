import { db } from "@/lib/db";
import { JournalForm } from "@/components/modules/journal/journal-form";
import { format, subDays } from "date-fns";

export const dynamic = "force-dynamic";

const MOODS: Record<string, string> = { great: "Great", good: "Good", okay: "Okay", bad: "Bad", terrible: "Terrible" };

export default async function JournalPage() {
  const thirtyDaysAgo = subDays(new Date(), 30);
  const entries = await db.journalEntry.findMany({ where: { date: { gte: thirtyDaysAgo } }, orderBy: { date: "desc" }, take: 31 });

  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in">
        <div className="premium-kicker">Reflection Desk</div>
        <h1 className="premium-title">Journal Command</h1>
        <p className="premium-subtitle">Daily notes, mood tracking, and private entries</p>
      </div>

      <Section title="New Entry">
        <JournalForm />
      </Section>

      <div className="space-y-3 animate-stagger">
        {entries.length === 0 ? <Empty msg="No entries yet. Start journaling." /> : (
          entries.map((e: { id: string; date: Date; content: string; mood: string | null; tags: string | null }) => (
            <div key={e.id} className="premium-panel">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold text-[var(--text-secondary)]">{format(new Date(e.date), "EEEE, MMMM d, yyyy")}</span>
                {e.mood && <span className="premium-chip">{MOODS[e.mood] || e.mood}</span>}
              </div>
              <div className="text-sm text-[var(--text)] whitespace-pre-wrap leading-relaxed">{e.content}</div>
              {e.tags && (
                <div className="flex gap-1.5 mt-3 flex-wrap">
                  {e.tags.split(",").filter(Boolean).map(tag => (
                    <span key={tag} className="premium-chip">#{tag.trim()}</span>
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
  return <section className="premium-panel animate-fade-in"><div className="mb-3 flex items-center justify-between gap-3"><h2 className="premium-panel-title">{title}</h2><span className="premium-panel-kicker">Private</span></div>{children}</section>;
}

function Empty({ msg }: { msg: string }) {
  return <div className="premium-empty">{msg}</div>;
}
