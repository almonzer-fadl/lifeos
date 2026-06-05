import { db } from "@/lib/db";
import { JournalForm } from "@/components/modules/journal/journal-form";
import { format, subDays } from "date-fns";

export const dynamic = "force-dynamic";

const MOODS: Record<string, string> = {
  great: "😄",
  good: "🙂",
  okay: "😐",
  bad: "😔",
  terrible: "😞",
};

export default async function JournalPage() {
  const thirtyDaysAgo = subDays(new Date(), 30);

  const entries = await db.journalEntry.findMany({
    where: { date: { gte: thirtyDaysAgo } },
    orderBy: { date: "desc" },
    take: 31,
  });

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Journal</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Daily notes and mood tracking
        </p>
      </div>

      {/* Quick entry */}
      <section className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          New Entry
        </h2>
        <JournalForm />
      </section>

      {/* Entries */}
      <section className="space-y-3">
        {entries.length === 0 ? (
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 text-zinc-600 text-sm text-center">
            No entries yet. Start journaling.
          </div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-zinc-300">
                  {format(new Date(entry.date), "EEEE, MMMM d, yyyy")}
                </span>
                {entry.mood && (
                  <span className="text-lg">
                    {MOODS[entry.mood] || entry.mood}
                  </span>
                )}
              </div>
              <div className="text-sm text-zinc-400 whitespace-pre-wrap leading-relaxed">
                {entry.content}
              </div>
              {entry.tags && (
                <div className="flex gap-1 mt-2 flex-wrap">
                  {entry.tags.split(",").filter(Boolean).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500"
                    >
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  );
}
