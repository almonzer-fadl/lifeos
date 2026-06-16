import Link from "next/link";
import { db } from "@/lib/db";
import { format, subDays } from "date-fns";

export const dynamic = "force-dynamic";

export default async function NutritionPage() {
  const today = subDays(new Date(), 0);
  const [entries, waterEntries] = await Promise.all([
    db.foodDiaryEntry.findMany({ where: { date: { gte: subDays(new Date(), 1) } }, orderBy: { createdAt: "desc" }, take: 30, include: { food: true } }),
    db.waterLog.findMany({ where: { date: { gte: subDays(new Date(), 1) } }, orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  const totalWater = waterEntries.reduce((s, w) => s + w.amountMl, 0);
  const calories = entries.reduce((s, e) => s + ((e.food as any)?.calories || 0) * e.servings, 0);
  const protein = entries.reduce((s, e) => s + ((e.food as any)?.protein || 0) * e.servings, 0);
  const carbs = entries.reduce((s, e) => s + ((e.food as any)?.carbs || 0) * e.servings, 0);
  const fat = entries.reduce((s, e) => s + ((e.food as any)?.fat || 0) * e.servings, 0);

  const byMeal: Record<string, typeof entries> = {};
  entries.forEach((e) => { if (e.mealType) { if (!byMeal[e.mealType]) byMeal[e.mealType] = []; byMeal[e.mealType].push(e); } });

  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in">
        <div className="premium-kicker">Fuel Desk</div>
        <h1 className="premium-title">Nutrition Diary</h1>
        <p className="premium-subtitle">Today's intake</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 animate-stagger">
        <div className="premium-stat"><div className="premium-label">Calories</div><div className="premium-value">{calories}</div><div className="text-xs text-[var(--text-tertiary)]">kcal</div></div>
        <div className="premium-stat"><div className="premium-label">Protein</div><div className="premium-value text-[var(--sky)]">{protein}<span className="text-sm font-normal text-[var(--text-tertiary)]">g</span></div></div>
        <div className="premium-stat"><div className="premium-label">Carbs</div><div className="premium-value text-[var(--amber)]">{carbs}<span className="text-sm font-normal text-[var(--text-tertiary)]">g</span></div></div>
        <div className="premium-stat"><div className="premium-label">Fat</div><div className="premium-value text-[var(--rose)]">{fat}<span className="text-sm font-normal text-[var(--text-tertiary)]">g</span></div></div>
      </div>

      <div className="premium-stat flex items-center justify-between">
        <div><div className="premium-label">Water</div><div className="premium-value text-[var(--sky)]">{(totalWater / 1000).toFixed(1)}<span className="text-sm font-normal text-[var(--text-tertiary)]">L</span></div></div>
        <Link href="/nutrition/log" className="premium-action text-xs">+ Log →</Link>
      </div>

      <Section title="Today's Meals" kicker={String(entries.length)} action={{ label: "Log Food", href: "/nutrition/log" }}>
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-sm text-[var(--text-tertiary)]">No food logged today</p>
            <Link href="/nutrition/log" className="premium-action mt-3 text-xs">Log Meal</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(byMeal).map(([meal, items]) => (
              <div key={meal}>
                <div className="premium-label mb-2 capitalize">{meal}</div>
                <div className="space-y-1">
                  {items.map((e) => (
                    <div key={e.id} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 bg-[var(--surface)] border border-[var(--border-light)]">
                      <div className="min-w-0"><div className="text-sm font-medium text-[var(--text)]">{(e as any).food?.name || "Food"}</div><div className="text-xs text-[var(--text-tertiary)]">{e.servings ? `${e.servings} serving` : ""}</div></div>
                      <span className="shrink-0 font-mono text-sm text-[var(--text-secondary)]">{(e as any).food?.calories ? `${(e as any).food.calories * e.servings} kcal` : "—"}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({ title, kicker, children, action }: { title: string; kicker: string; children: React.ReactNode; action?: { label: string; href: string } }) {
  return (
    <section className="premium-panel animate-fade-in">
      <div className="mb-3 flex items-center justify-between gap-3"><h2 className="text-sm font-semibold text-[var(--text)]">{title}</h2><div className="flex items-center gap-2"><span className="premium-panel-kicker">{kicker}</span>{action && <Link href={action.href} className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]">{action.label} →</Link>}</div></div>
      {children}
    </section>
  );
}
