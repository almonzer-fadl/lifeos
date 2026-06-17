import { GlucoseForm } from "@/components/modules/t1d/glucose-form";

export default function LogPage() {
  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in">
        <div className="premium-kicker">New Reading</div>
        <h1 className="premium-title">Quick Log</h1>
        <p className="premium-subtitle">Log glucose, insulin, or carbs</p>
      </div>
      <section className="premium-panel animate-fade-in">
        <h2 className="premium-panel-title mb-4">Glucose Reading</h2>
        <GlucoseForm />
      </section>
      <Section title="Insulin Dose" kicker="Optional">
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <p className="text-xs text-[var(--text-tertiary)]">Insulin logging is available on the dashboard.</p>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, kicker, children }: { title: string; kicker: string; children: React.ReactNode }) {
  return (
    <section className="premium-panel animate-fade-in">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-[var(--text)]">{title}</h2>
        <span className="premium-panel-kicker">{kicker}</span>
      </div>
      {children}
    </section>
  );
}
