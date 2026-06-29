import { EmptyState } from "@/components/ui/empty-state";

export default function HabitCalendarPage() {
  return (
    <div className="premium-page animate-fade-in"><div className="premium-header animate-fade-in"><div className="premium-kicker">Overview</div><h1 className="premium-title">Calendar</h1><p className="premium-subtitle">Monthly habit completion view</p></div>
    <section className="premium-panel animate-fade-in"><EmptyState icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" title="Coming soon" description="Calendar heatmap view is in development." /></section></div>
  );
}
