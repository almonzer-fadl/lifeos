import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { DeleteButton } from "@/components/ui/delete-button";

export const dynamic = "force-dynamic";

export default async function LabDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lab = await db.labResult.findUnique({ where: { id } });
  if (!lab) notFound();

  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in">
        <div className="flex items-center gap-2"><Link href="/body/labs" className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg></Link><div className="premium-kicker">Lab Detail</div></div>
        <h1 className="premium-title">{lab.testName}</h1>
        <p className="premium-subtitle">{format(new Date(lab.date), "MMMM d, yyyy")}</p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <div className="premium-stat"><div className="premium-label">Value</div><div className="premium-value font-mono">{lab.value}<span className="text-sm font-normal text-[var(--text-tertiary)] ml-1">{lab.unit}</span></div></div>
        {lab.refRangeLow != null && lab.refRangeHigh != null && <div className="premium-stat"><div className="premium-label">Reference</div><div className="premium-value text-base">{lab.refRangeLow} – {lab.refRangeHigh} {lab.unit}</div></div>}
      </div>
      {lab.notes && <section className="premium-panel animate-fade-in"><h2 className="premium-panel-title mb-2">Notes</h2><p className="text-sm text-[var(--text-secondary)]">{lab.notes}</p></section>}
      <div className="flex justify-end"><DeleteButton url={`/api/health/lab-results?id=${lab.id}`} itemName="lab result" /></div>
    </div>
  );
}
