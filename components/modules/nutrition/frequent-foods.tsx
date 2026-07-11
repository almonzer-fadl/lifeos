"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface FrequentFoodItem {
  id: string;
  foodId: string;
  personalName: string | null;
  typicalCarbs: number | null;
  typicalGlucose: number | null;
  useCount: number;
  food: { name: string; calories: number | null; carbs: number | null; protein: number | null } | null;
}

export function FrequentFoods() {
  const [foods, setFoods] = useState<FrequentFoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/health/nutrition/frequent")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setFoods(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="skeleton h-24 w-full rounded-lg" />;
  if (foods.length === 0) return null;

  return (
    <section className="premium-panel animate-fade-in">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--text)]">Frequent Foods</h2>
        <Link href="/nutrition/food-search" className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-tertiary)] hover:text-[var(--text)]">Search →</Link>
      </div>
      <div className="space-y-1">
        {foods.slice(0, 8).map((f) => (
          <div key={f.id} className="flex items-center justify-between rounded-lg px-3 py-2.5 bg-[var(--surface)] border border-[var(--border-light)]">
            <div className="min-w-0">
              <div className="text-sm text-[var(--text)] truncate">{f.personalName || f.food?.name || "Food"}</div>
              <div className="text-[10px] text-[var(--text-tertiary)]">
                {f.typicalCarbs ? `${f.typicalCarbs}g carbs` : f.food?.carbs ? `${f.food.carbs}g/serving` : ""}
                {f.typicalGlucose ? ` · Avg glucose: ${f.typicalGlucose} mg/dL` : ""}
              </div>
            </div>
            <span className="text-[10px] text-[var(--text-tertiary)]">{f.useCount}×</span>
          </div>
        ))}
      </div>
    </section>
  );
}
