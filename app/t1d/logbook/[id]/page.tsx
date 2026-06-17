import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { DeleteButton } from "@/components/ui/delete-button";

export const dynamic = "force-dynamic";

export default async function LogbookEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reading = await db.glucoseReading.findUnique({ where: { id } });
  if (!reading) notFound();

  const status = reading.value < 70 ? "Low" : reading.value > 180 ? "High" : "In Range";
  const statusColor = reading.value < 70 ? "var(--rose)" : reading.value > 180 ? "var(--amber)" : "var(--emerald)";

  return (
    <div className="premium-page animate-fade-in">
      <div className="premium-header animate-fade-in">
        <div className="flex items-center gap-2">
          <Link href="/t1d/logbook" className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div className="premium-kicker">Reading Detail</div>
        </div>
        <h1 className="premium-title">{reading.value} mg/dL</h1>
        <p className="premium-subtitle" style={{ color: statusColor }}>{status}</p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <div className="premium-stat"><div className="premium-label">Value</div><div className="premium-value font-mono">{reading.value}</div><div className="text-xs text-[var(--text-tertiary)]">mg/dL</div></div>
        <div className="premium-stat"><div className="premium-label">Status</div><div className="premium-value text-sm" style={{ color: statusColor }}>{status}</div></div>
        <div className="premium-stat"><div className="premium-label">Time</div><div className="premium-value text-lg">{format(new Date(reading.timestamp), "HH:mm")}</div><div className="text-xs text-[var(--text-tertiary)]">{format(new Date(reading.timestamp), "MMM d, yyyy")}</div></div>
      </div>
      {reading.notes && (
        <section className="premium-panel animate-fade-in"><h2 className="premium-panel-title mb-2">Notes</h2><p className="text-sm text-[var(--text-secondary)]">{reading.notes}</p></section>
      )}
      <div className="flex justify-end"><DeleteButton url={`/api/health/glucose?id=${reading.id}`} itemName="reading" /></div>
    </div>
  );
}
