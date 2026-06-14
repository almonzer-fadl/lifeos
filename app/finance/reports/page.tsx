import { EmptyState } from "@/components/ui/empty-state";

export default function ReportsPage() {
  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in">
        <div className="premium-kicker">Analytics</div>
        <h1 className="premium-title">Reports</h1>
        <p className="premium-subtitle">Net worth trends, spending analysis, cashflow</p>
      </div>
      <section className="premium-panel animate-fade-in">
        <EmptyState
          icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          title="Reports coming soon"
          description="Charts, trends, CSV export, and spending breakdowns are in development."
        />
      </section>
    </div>
  );
}
