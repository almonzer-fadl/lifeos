import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { DeleteButton } from "@/components/ui/delete-button";

export const dynamic = "force-dynamic";

export default async function SleepDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await db.sleepSession.findUnique({ where: { id } });
  if (!session) notFound();

  const durMin = (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000;
  const durH = (durMin / 60).toFixed(1);
  const bedtime = format(new Date(session.startTime), "HH:mm");
  const wakeTime = format(new Date(session.endTime), "HH:mm");

  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in">
        <div className="flex items-center gap-2">
          <Link href="/sleep" className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div className="premium-kicker">Sleep Detail</div>
        </div>
        <h1 className="premium-title">{format(new Date(session.startTime), "EEEE, MMMM d")}</h1>
        <p className="premium-subtitle">{bedtime} → {wakeTime} · {durH}h</p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="premium-stat"><div className="premium-label">Duration</div><div className="premium-value">{durH}<span className="text-sm font-normal text-[var(--text-tertiary)]">h</span></div></div>
        <div className="premium-stat"><div className="premium-label">Bedtime</div><div className="premium-value text-xl">{bedtime}</div></div>
        <div className="premium-stat"><div className="premium-label">Wake Time</div><div className="premium-value text-xl">{wakeTime}</div></div>
        {session.quality && <div className="premium-stat"><div className="premium-label">Quality</div><div className="premium-value text-[var(--sky)]">{session.quality}<span className="text-sm font-normal text-[var(--text-tertiary)]">/5</span></div></div>}
      </div>
      {session.notes && (
        <section className="premium-panel animate-fade-in"><h2 className="premium-panel-title mb-2">Notes</h2><p className="text-sm text-[var(--text-secondary)]">{session.notes}</p></section>
      )}
      <div className="flex justify-end"><DeleteButton url={`/api/health/sleep?id=${session.id}`} itemName="sleep session" /></div>
    </div>
  );
}
