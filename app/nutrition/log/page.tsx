import { NutritionForm } from "@/components/modules/nutrition/nutrition-form";
import { WaterForm } from "@/components/modules/nutrition/water-form";

export default function LogNutritionPage() {
  return (
    <div className="premium-page animate-fade-in">
      <div className="premium-header animate-fade-in"><div className="premium-kicker">New Entry</div><h1 className="premium-title">Log Food</h1><p className="premium-subtitle">Search and log what you ate</p></div>
      <section className="premium-panel animate-fade-in"><h2 className="premium-panel-title mb-4">Food Entry</h2><NutritionForm /></section>
      <Section title="Water" kicker="Hydration"><WaterForm /></Section>
    </div>
  );
}

function Section({ title, kicker, children }: { title: string; kicker: string; children: React.ReactNode }) {
  return (
    <section className="premium-panel animate-fade-in"><div className="mb-3 flex items-center justify-between gap-3"><h2 className="text-sm font-semibold text-[var(--text)]">{title}</h2><span className="premium-panel-kicker">{kicker}</span></div>{children}</section>
  );
}
