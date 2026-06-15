"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type FoodItem = {
  id: string;
  name: string;
  brand: string | null;
  barcode: string | null;
  servingSize: number | null;
  servingUnit: string | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
};

export function NutritionForm() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodItem[]>([]);
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [mealType, setMealType] = useState("snack");
  const [servings, setServings] = useState("1");
  const [grams, setGrams] = useState("");
  const [saving, setSaving] = useState(false);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/search/food?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.slice(0, 8));
      }
    } catch {
      // No food DB seeded yet — use local DB
      try {
        const localRes = await fetch(`/api/health/nutrition/food-search?q=${encodeURIComponent(q)}`);
        if (localRes.ok) {
          const data = await localRes.json();
          setResults(data.slice(0, 8));
        }
      } catch {
        setResults([]);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;

    setSaving(true);
    await fetch("/api/health/nutrition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mealType,
        foodId: selected.id,
        servings: parseInt(servings) || 1,
        grams: grams ? parseFloat(grams) : null,
      }),
    });

    setQuery("");
    setSelected(null);
    setServings("1");
    setGrams("");
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {!selected ? (
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search food by name or barcode..."
            className="w-full"
            autoComplete="off"
          />
          {results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-20 max-h-48 overflow-y-auto">
              {results.map((food) => (
                <button
                  key={food.id}
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-zinc-700 flex items-center justify-between"
                  onClick={() => setSelected(food)}
                >
                  <div>
                    <div className="text-sm">{food.name}</div>
                    {food.brand && (
                      <div className="text-xs text-zinc-500">{food.brand}</div>
                    )}
                  </div>
                  {food.calories && (
                    <span className="text-xs text-zinc-400">
                      {food.calories} kcal
                      {food.servingSize ? ` / ${food.servingSize}${food.servingUnit || "g"}` : ""}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
          {query.length >= 2 && results.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-20 p-3 text-sm text-zinc-500 text-center">
              No foods found. Import USDA/Open Food Facts data for full offline search, or add manually.
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-800">
            <div>
              <div className="text-sm font-medium">{selected.name}</div>
              <div className="text-xs text-zinc-500">
                {selected.brand && `${selected.brand} · `}
                {selected.calories && `${selected.calories} kcal`}
                {selected.servingSize &&
                  ` per ${selected.servingSize}${selected.servingUnit || "g"}`}
              </div>
              {(selected.protein || selected.carbs || selected.fat) && (
                <div className="text-xs text-zinc-500 mt-0.5">
                  {selected.protein && `P: ${selected.protein}g `}
                  {selected.carbs && `C: ${selected.carbs}g `}
                  {selected.fat && `F: ${selected.fat}g`}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="text-zinc-500 hover:text-zinc-300 text-sm"
            >
              Change
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2">
            <div>
              <label className="text-xs text-zinc-500 block mb-1">Meal</label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                className="w-full"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-500 block mb-1">Servings</label>
              <input
                type="number"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                placeholder="1"
                step="0.5"
                min="0.25"
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 block mb-1">Grams (override)</label>
              <input
                type="number"
                value={grams}
                onChange={(e) => setGrams(e.target.value)}
                placeholder="150"
                step="1"
                min="0"
                className="w-full"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full mt-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-500 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : `Add to ${mealType}`}
          </button>
        </div>
      )}
    </form>
  );
}
