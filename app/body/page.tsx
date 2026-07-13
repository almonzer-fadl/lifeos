import Link from "next/link";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { BodyDashboard } from "@/components/modules/body/body-dashboard";

export const dynamic = "force-dynamic";

export default async function BodyPage() {
  const measurements = await db.bodyMeasurement.findMany({ orderBy: { date: "desc" }, take: 10 });
  const latest = measurements[0];

  return (
    <div className="premium-page animate-fade-in">
      <div className="premium-header animate-fade-in">
        <div className="premium-kicker">Composition Desk</div>
        <h1 className="premium-title">Body Command</h1>
        <p className="premium-subtitle">Weight, measurements, labs, and supplements</p>
      </div>

      <BodyDashboard />

      {latest && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 animate-stagger">
          {latest.weight && <Tile l="Weight" v={`${latest.weight}`} u="kg" />}
          {latest.bodyFatPct && <Tile l="Body Fat" v={`${latest.bodyFatPct}`} u="%" />}
          {latest.waist && <Tile l="Waist" v={`${latest.waist}`} u="cm" />}
          {latest.chest && <Tile l="Chest" v={`${latest.chest}`} u="cm" />}
        </div>
      )}

      <Section title="Quick Actions" kicker="Log" action={{ label: "Full Log", href: "/body/log" }}>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Link href="/body/log" className="premium-action">Log Weight</Link>
          <Link href="/body/log/labs" className="premium-action">Add Lab Result</Link>
          <Link href="/body/supplements" className="premium-action">Log Supplement</Link>
        </div>
      </Section>

      <Section title="Measurement History" kicker={String(measurements.length)} action={{ label: "All", href: "/body/measurements" }}>
        {measurements.length === 0 ? (
          <div className="py-8 text-center"><p className="text-sm text-[var(--text-tertiary)]">No measurements yet</p></div>
        ) : (
          <div className="space-y-1">
            {measurements.slice(0, 5).map((m) => (
              <Link key={m.id} href={`/body/measurements`} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-[var(--surface-hover)]">
                <div className="min-w-0"><div className="text-sm font-medium text-[var(--text)]">{format(new Date(m.date), "MMM d, yyyy")}</div><div className="text-xs text-[var(--text-tertiary)]">
                  {[m.weight && `${m.weight}kg`, m.bodyFatPct && `${m.bodyFatPct}%`, m.waist && `Waist ${m.waist}cm`].filter(Boolean).join(" · ")}
                </div></div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </Link>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function Tile({ l, v, u }: { l: string; v: string; u: string }) {
  return <div className="premium-stat"><div className="premium-label">{l}</div><div className="premium-value">{v}<span className="text-sm font-normal text-[var(--text-tertiary)] ml-0.5">{u}</span></div></div>;
}

function Section({ title, kicker, children, action }: { title: string; kicker: string; children: React.ReactNode; action?: { label: string; href: string } }) {
  return (
    <section className="premium-panel animate-fade-in">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-[var(--text)]">{title}</h2>
        <div className="flex items-center gap-2"><span className="premium-panel-kicker">{kicker}</span>{action && <Link href={action.href} className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]">{action.label} →</Link>}</div>
      </div>
      {children}
    </section>
  );
}
