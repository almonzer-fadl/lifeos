import { EmptyState } from "@/components/ui/empty-state";

export default function WaterPage() {
  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in"><div className="premium-kicker">Hydration</div><h1 className="premium-title">Water</h1><p className="premium-subtitle">Daily water intake tracking</p></div>
      <section className="premium-panel animate-fade-in"><EmptyState icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" title="Coming soon" description="Water tracking with quick-add buttons is in development." /></section>
    </div>
  );
}
