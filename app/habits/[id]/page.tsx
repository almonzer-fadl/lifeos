import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { DeleteButton } from "@/components/ui/delete-button";

export const dynamic = "force-dynamic";

export default async function HabitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const habit = await db.habit.findUnique({ where: { id }, include: { logs: { orderBy: { date: "desc" }, take: 90 } } });
  if (!habit) notFound();

  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const doneToday = habit.logs.some((l) => new Date(l.date).getTime() === today.getTime() && l.completed);
  let streak = 0;
  const sorted = [...habit.logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  for (const log of sorted) {
    if (log.completed) streak++;
    else break;
  }

  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in">
        <div className="flex items-center gap-2"><Link href="/habits" className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg></Link><div className="premium-kicker">{habit.frequency}</div></div>
        <h1 className="premium-title">{habit.name}</h1>
        <p className="premium-subtitle">{doneToday ? "Done today" : "Not yet today"}</p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="premium-stat"><div className="premium-label">Current Streak</div><div className="premium-value font-mono">{streak}</div><div className="text-xs text-[var(--text-tertiary)]">days</div></div>
        <div className="premium-stat"><div className="premium-label">Total Logs</div><div className="premium-value font-mono">{habit.logs.length}</div></div>
        <div className="premium-stat"><div className="premium-label">Frequency</div><div className="premium-value text-lg capitalize">{habit.frequency}</div></div>
        {habit.timeOfDay && <div className="premium-stat"><div className="premium-label">Time</div><div className="premium-value text-lg capitalize">{habit.timeOfDay}</div></div>}
      </div>
      <div className="flex justify-end"><DeleteButton url={`/api/productivity/habits?id=${habit.id}`} itemName={habit.name} /></div>
    </div>
  );
}
