import { EmptyState } from "@/components/ui/empty-state";

export default function MealsPage() {
  return (
    <div className="premium-page animate-fade-in">
      <div className="premium-header animate-fade-in"><div className="premium-kicker">Library</div><h1 className="premium-title">Saved Meals</h1><p className="premium-subtitle">Common meals and favorites</p></div>
      <section className="premium-panel animate-fade-in"><EmptyState icon="M4 6h16M4 10h16M4 14h16M4 18h16" title="Coming soon" description="Saved meals and meal templates are in development." /></section>
    </div>
  );
}
