import { WorkoutLogger } from "@/components/modules/activity/workout-logger";

export default function LogGymPage() {
  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in">
        <div className="premium-kicker">New Session</div>
        <h1 className="premium-title">Log Gym Workout</h1>
        <p className="premium-subtitle">Log exercises, sets, reps, and weight</p>
      </div>
      <section className="premium-panel animate-fade-in">
        <WorkoutLogger />
      </section>
    </div>
  );
}
