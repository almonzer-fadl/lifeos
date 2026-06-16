import { EmptyState } from "@/components/ui/empty-state";

export default function UpcomingPage() {
  return (
    <div className="premium-page"><div className="premium-header animate-fade-in"><div className="premium-kicker">Schedule</div><h1 className="premium-title">Upcoming</h1><p className="premium-subtitle">Scheduled and due tasks</p></div>
    <section className="premium-panel animate-fade-in"><EmptyState icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" title="Coming soon" description="Calendar view and scheduled tasks are in development." /></section></div>
  );
}
