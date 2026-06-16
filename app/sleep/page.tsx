import { db } from "@/lib/db";
import { SleepForm } from "@/components/modules/sleep/sleep-form";
import { DeleteButton } from "@/components/ui/delete-button";
import { format, subDays, differenceInMinutes } from "date-fns";

export const dynamic = "force-dynamic";

export default async function SleepPage() {
  const thirtyDaysAgo = subDays(new Date(), 30);
  const sessions = await db.sleepSession.findMany({ where: { startTime: { gte: thirtyDaysAgo } }, orderBy: { startTime: "desc" }, take: 31 });

  const avgDur = sessions.length > 0
    ? sessions.reduce((s: number, x: { endTime: Date; startTime: Date }) => s + differenceInMinutes(new Date(x.endTime), new Date(x.startTime)), 0) / sessions.length / 60 : null;
  const avgQ = sessions.filter((s: { quality: number | null }) => s.quality).length > 0
    ? sessions.reduce((s: number, x: { quality: number | null }) => s + (x.quality || 0), 0) / sessions.filter((s: { quality: number | null }) => s.quality).length : null;
  const debt = avgDur && avgDur < 7 ? (7 - avgDur).toFixed(1) : null;
  const sorted = [...sessions].sort((a: { startTime: Date }, b: { startTime: Date }) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  const consist = sessions.length >= 3 ? (() => {
    const mins = sorted.map((s: { startTime: Date }) => new Date(s.startTime).getHours() * 60 + new Date(s.startTime).getMinutes());
    const avg = mins.reduce((a, b) => a + b, 0) / mins.length;
    const std = Math.sqrt(mins.reduce((s, v) => s + (v - avg) ** 2, 0) / mins.length);
    return std < 30 ? "Excellent" : std < 60 ? "Good" : "Irregular";
  })() : null;

  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in">
        <div className="premium-kicker">Recovery Desk</div>
        <h1 className="premium-title">Sleep Command</h1>
        <p className="premium-subtitle">Duration, quality, debt, and consistency</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-stagger">
        <Stat l="Avg Duration" v={avgDur ? `${avgDur.toFixed(1)}` : "--"} u="hours" c="text-[var(--indigo)]" />
        <Stat l="Avg Quality" v={avgQ ? `${avgQ.toFixed(1)}/5` : "--"} u="" c="text-[var(--amber)]" />
        <Stat l="Sleep Debt" v={debt ?? "--"} u={debt ? "hrs behind" : ""} c="text-[var(--rose)]" />
        <Stat l="Consistency" v={consist ?? "--"} u="" c="text-[var(--emerald)]" />
      </div>

      <Section title="Log Sleep"><SleepForm /></Section>

      <Section title="History">
        {sessions.length === 0 ? <Empty msg="No sleep data yet." /> : (
          <div className="space-y-2">
            {sessions.map((s: { id: string; startTime: Date; endTime: Date; quality: number | null; source: string; notes: string | null }) => {
              const hrs = differenceInMinutes(new Date(s.endTime), new Date(s.startTime)) / 60;
              return (
                <div key={s.id} className="premium-row flex items-center gap-3">
                  <span className="premium-chip shrink-0">{s.quality ? `Q${s.quality}` : "SLP"}</span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-[var(--text)]">{hrs.toFixed(1)} hours</div>
                    <div className="text-xs text-[var(--text-tertiary)]">
                      {format(new Date(s.startTime), "HH:mm")} → {format(new Date(s.endTime), "HH:mm")}
                      {" · "}{format(new Date(s.startTime), "EEE, MMM d")}
                      {s.quality && ` · Quality: ${s.quality}/5`}
                    </div>
                    {s.notes && <div className="text-xs text-[var(--text-tertiary)] mt-0.5">{s.notes}</div>}
                  </div>
                  <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-medium">{s.source}</span>
                  <DeleteButton url={`/api/health/sleep?id=${s.id}`} />
                </div>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
}

function Stat({ l, v, u, c }: { l: string; v: string; u: string; c: string }) {
  return (
    <div className="premium-stat">
      <div className="premium-label">{l}</div>
      <div className={`text-[1.75rem] font-bold tracking-tight mt-1 font-mono ${c}`}>{v}</div>
      <div className="text-xs text-[var(--text-tertiary)] mt-0.5">{u}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="premium-panel animate-fade-in"><div className="mb-3 flex items-center justify-between gap-3"><h2 className="premium-panel-title">{title}</h2><span className="premium-panel-kicker">Recovery</span></div>{children}</section>;
}

function Empty({ msg }: { msg: string }) {
  return <div className="premium-empty">{msg}</div>;
}
