export default function SettingsPage() {
  return (
    <div className="premium-page animate-fade-in">
      <div className="premium-header animate-fade-in">
        <div className="premium-kicker">System Desk</div>
        <h1 className="premium-title">Settings Command</h1>
        <p className="premium-subtitle">Local configuration, privacy, backup, and device preferences</p>
      </div>

      <section className="premium-panel">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="premium-panel-title">Configuration</h2>
          <span className="premium-panel-kicker">Local</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="premium-row">
            <div className="premium-label">Runtime</div>
            <div className="premium-value text-base">Docker Local</div>
            <div className="mt-1 text-xs text-[var(--text-tertiary)]">Laptop-hosted source of truth</div>
          </div>
          <div className="premium-row">
            <div className="premium-label">PWA</div>
            <div className="premium-value text-base">Standalone</div>
            <div className="mt-1 text-xs text-[var(--text-tertiary)]">Phone-first interface enabled</div>
          </div>
          <div className="premium-row">
            <div className="premium-label">Theme</div>
            <div className="premium-value text-base">Institutional Dark</div>
            <div className="mt-1 text-xs text-[var(--text-tertiary)]">Premium command-center skin</div>
          </div>
        </div>
      </section>
    </div>
  );
}
