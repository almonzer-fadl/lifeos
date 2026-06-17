import { ActivityForm } from "@/components/modules/activity/activity-form";

export default function LogCardioPage() {
  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in">
        <div className="premium-kicker">New Session</div>
        <h1 className="premium-title">Log Cardio</h1>
        <p className="premium-subtitle">Track your run, bike, swim, or walk</p>
      </div>
      <section className="premium-panel animate-fade-in">
        <ActivityForm />
      </section>
    </div>
  );
}
