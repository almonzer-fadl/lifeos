import { EmptyState } from "@/components/ui/empty-state";

export default function BudgetPage() {
  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in">
        <div className="premium-kicker">Envelope System</div>
        <h1 className="premium-title">Budget</h1>
        <p className="premium-subtitle">Give every dollar a job</p>
      </div>
      <section className="premium-panel animate-fade-in">
        <EmptyState
          icon="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          title="Budgeting coming soon"
          description="Envelope budgeting with category assignments, monthly rollover, and spending targets is in development."
        />
      </section>
    </div>
  );
}
