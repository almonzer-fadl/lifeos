import { db } from "@/lib/db";
import { SleepForm } from "@/components/modules/sleep/sleep-form";
import { format, subDays, differenceInMinutes } from "date-fns";

export const dynamic = "force-dynamic";

export default async function SleepPage() {
  const thirtyDaysAgo = subDays(new Date(), 30);
  const sessions = await db.sleepSession.findMany({ where: { startTime: { gte: thirtyDaysAgo } }, orderBy: { startTime: "desc" }, take: 31 });

  const avgDur = sessions.length > 0
    ? sessions.reduce((s, x) => s + differenceInMinutes(new Date(x.endTime), new Date(x.startTime)), 0) / sessions.length / 60 : null;
  const avgQ = sessions.filter(s => s.quality).length > 0
    ? sessions.reduce((s, x) => s + (x.quality || 0), 0) / sessions.filter(s => s.quality).length : null;
  const debt = avgDur && avgDur < 7 ? (7 - avgDur).toFixed(1) : null;
  const sorted = [...sessions].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  const consist = sessions.length >= 3 ? (() => {
    const mins = sorted.map(s => new Date(s.startTime).getHours() * 60 + new Date(s.startTime).getMinutes());
    const avg = mins.reduce((a, b) => a + b, 0) / mins.length;
    const std = Math.sqrt(mins.reduce((s, v) => s + (v - avg) ** 2, 0) / mins.length);
    return std < 30 ? "Excellent" : std < 60 ? "Good" : "Irregular";
  })() : null;

  return (
    <div className="p-5 lg:p-8 space-y-5">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">Sleep</h1>
        <p className="text-sm text-stone-500 mt-0.5">Duration, quality, and consistency</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-stagger">
        <Stat l="Avg Duration" v={avgDur ? `${avgDur.toFixed(1)}` : "--"} u="hours" c="text-indigo-600" />
        <Stat l="Avg Quality" v={avgQ ? `${avgQ.toFixed(1)}/5` : "--"} u="" c="text-amber-600" />
        <Stat l="Sleep Debt" v={debt ?? "--"} u={debt ? "hrs behind" : ""} c="text-rose-600" />
        <Stat l="Consistency" v={consist ?? "--"} u="" c="text-emerald-600" />
      </div>

      <Section title="Log Sleep"><SleepForm /></Section>

      <Section title="History">
        {sessions.length === 0 ? <Empty msg="No sleep data yet." /> : (
          <div className="space-y-2">
            {sessions.map(s => {
              const hrs = differenceInMinutes(new Date(s.endTime), new Date(s.startTime)) / 60;
              return (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-[var(--border-light)]">
                  <span className="text-2xl">{s.quality && s.quality >= 4 ? "😊" : s.quality && s.quality >= 2 ? "😐" : "😴"}</span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-stone-700">{hrs.toFixed(1)} hours</div>
                    <div className="text-xs text-stone-400">
                      {format(new Date(s.startTime), "HH:mm")} → {format(new Date(s.endTime), "HH:mm")}
                      {" · "}{format(new Date(s.startTime), "EEE, MMM d")}
                      {s.quality && ` · Quality: ${s.quality}/5`}
                    </div>
                    {s.notes && <div className="text-xs text-stone-400 mt-0.5">{s.notes}</div>}
                  </div>
                  <span className="text-[10px] text-stone-300 uppercase font-medium">{s.source}</span>
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
    <div className="p-4 rounded-2xl bg-white border border-[var(--border)] shadow-[var(--shadow-card)]">
      <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">{l}</div>
      <div className={`text-[1.75rem] font-bold tracking-tight mt-1 font-mono ${c}`}>{v}</div>
      <div className="text-xs text-stone-400 mt-0.5">{u}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl bg-white border border-[var(--border)] shadow-[var(--shadow-card)] p-5 animate-fade-in"><h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">{title}</h2>{children}</section>;
}

function Empty({ msg }: { msg: string }) {
  return <div className="py-8 text-center text-sm text-stone-400">{msg}</div>;
}
