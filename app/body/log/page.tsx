import { BodyMeasurementForm } from "@/components/modules/body/body-forms";

export default function LogBodyPage() {
  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in"><div className="premium-kicker">New Entry</div><h1 className="premium-title">Log Measurement</h1><p className="premium-subtitle">Weight, body fat, and circumference</p></div>
      <section className="premium-panel animate-fade-in"><BodyMeasurementForm /></section>
    </div>
  );
}
