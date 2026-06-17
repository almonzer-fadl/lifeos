import { db } from "@/lib/db";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function NutritionTrendsPage() {
  const entries = await db.foodDiaryEntry.findMany({ orderBy: { date: "asc" }, take: 60, include: { food: true } });
  const waterEntries = await db.waterLog.findMany({ orderBy: { date: "asc" }, take: 60 });

  const dailyCals: Record<string, number> = {};
  const dailyWater: Record<string, number> = {};
  entries.forEach((e) => {
    const d = format(new Date(e.date), "yyyy-MM-dd");
    dailyCals[d] = (dailyCals[d] || 0) + ((e.food as any)?.calories || 0) * e.servings;
  });
  waterEntries.forEach((w) => {
    const d = format(new Date(w.date), "yyyy-MM-dd");
    dailyWater[d] = (dailyWater[d] || 0) + w.amountMl;
  });

  const avgCals = Object.values(dailyCals).length > 0 ? Object.values(dailyCals).reduce((a, b) => a + b, 0) / Object.values(dailyCals).length : 0;
  const avgWater = Object.values(dailyWater).length > 0 ? Object.values(dailyWater).reduce((a, b) => a + b, 0) / Object.values(dailyWater).length : 0;

  return (
    <div className="premium-page animate-fade-in">
      <div className="premium-header animate-fade-in"><div className="premium-kicker">Long View</div><h1 className="premium-title">Nutrition Trends</h1><p className="premium-subtitle">{Object.keys(dailyCals).length} days tracked</p></div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="premium-stat"><div className="premium-label">Avg Calories</div><div className="premium-value">{avgCals.toFixed(0)}<span className="text-sm font-normal text-[var(--text-tertiary)]"> kcal</span></div></div>
        <div className="premium-stat"><div className="premium-label">Avg Water</div><div className="premium-value text-[var(--sky)]">{(avgWater / 1000).toFixed(1)}<span className="text-sm font-normal text-[var(--text-tertiary)]"> L</span></div></div>
        <div className="premium-stat"><div className="premium-label">Days Logged</div><div className="premium-value">{Object.keys(dailyCals).length}</div></div>
        <div className="premium-stat"><div className="premium-label">Total Entries</div><div className="premium-value">{entries.length}</div></div>
      </div>
      <section className="premium-panel animate-fade-in">
        <h2 className="premium-panel-title mb-3">Daily Summary</h2>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-[var(--border)]"><th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Date</th><th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Calories</th><th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Water</th></tr></thead>
        <tbody>{Object.entries(dailyCals).slice(-14).reverse().map(([date, cal]) => (
          <tr key={date} className="border-b border-[var(--border-light)]"><td className="px-3 py-2 text-xs text-[var(--text-tertiary)]">{format(new Date(date), "MMM d")}</td><td className="px-3 py-2 text-right text-sm font-mono text-[var(--text)]">{cal.toFixed(0)}</td><td className="px-3 py-2 text-right text-sm font-mono text-[var(--sky)]">{dailyWater[date] ? `${(dailyWater[date] / 1000).toFixed(1)}L` : "—"}</td></tr>
        ))}</tbody></table></div>
      </section>
    </div>
  );
}
