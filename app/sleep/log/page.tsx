import { SleepForm } from "@/components/modules/sleep/sleep-form";

export default function LogSleepPage() {
  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in">
        <div className="premium-kicker">New Session</div>
        <h1 className="premium-title">Log Sleep</h1>
        <p className="premium-subtitle">Record bedtime, wake time, and quality</p>
      </div>
      <section className="premium-panel animate-fade-in">
        <SleepForm />
      </section>
    </div>
  );
}
