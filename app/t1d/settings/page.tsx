export default function T1DSettingsPage() {
  return (
    <div className="premium-page animate-fade-in">
      <div className="premium-header animate-fade-in">
        <div className="premium-kicker">Configuration</div>
        <h1 className="premium-title">T1D Settings</h1>
        <p className="premium-subtitle">Targets, ratios, and preferences</p>
      </div>
      <section className="premium-panel animate-fade-in">
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <p className="text-sm text-[var(--text-tertiary)]">Settings are in development.</p>
          <p className="text-xs text-[var(--text-tertiary)]">Basal rates, I:C ratio, correction factor, target range, units.</p>
        </div>
      </section>
    </div>
  );
}
