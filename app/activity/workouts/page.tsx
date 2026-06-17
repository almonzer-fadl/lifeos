import { EmptyState } from "@/components/ui/empty-state";

export default function WorkoutsPage() {
  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in">
        <div className="premium-kicker">Templates</div>
        <h1 className="premium-title">Workouts</h1>
        <p className="premium-subtitle">Saved workout templates and routines</p>
      </div>
      <section className="premium-panel animate-fade-in">
        <EmptyState icon="M4 6h16M4 10h16M4 14h16M4 18h16" title="Coming soon" description="Workout templates and saved routines are in development." />
      </section>
    </div>
  );
}
