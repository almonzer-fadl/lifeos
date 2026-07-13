import { PrayerChecklist } from "@/components/modules/prayer/prayer-checklist";

export const dynamic = "force-dynamic";

export default function PrayerPage() {
  return (
    <div className="premium-page animate-fade-in">
      <div className="premium-header animate-fade-in">
        <div className="premium-kicker">Spiritual Practice</div>
        <h1 className="premium-title">Faith</h1>
        <p className="premium-subtitle">Prayer, Quran memorization, and tafsir journal</p>
      </div>

      <PrayerChecklist />
    </div>
  );
}
