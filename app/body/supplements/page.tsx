import Link from "next/link";

export default function SupplementsPage() {
  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in"><div className="premium-kicker">Stack</div><h1 className="premium-title">Supplements</h1><p className="premium-subtitle">Daily supplement tracking</p></div>
      <section className="premium-panel animate-fade-in">
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <p className="text-sm text-[var(--text-tertiary)]">Coming soon</p>
          <p className="text-xs text-[var(--text-tertiary)]">Supplement logging is in development.</p>
        </div>
      </section>
    </div>
  );
}
