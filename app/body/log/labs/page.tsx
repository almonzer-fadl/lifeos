import { db } from "@/lib/db";
import { LabResultForm } from "@/components/modules/body/body-forms";

export default function LogLabPage() {
  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in"><div className="premium-kicker">Blood Work</div><h1 className="premium-title">Log Lab Result</h1><p className="premium-subtitle">Record blood test results</p></div>
      <section className="premium-panel animate-fade-in"><LabResultForm /></section>
    </div>
  );
}
