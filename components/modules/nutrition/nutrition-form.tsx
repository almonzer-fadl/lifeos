"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type Food = { id: string; name: string; brand: string | null; servingSize: number | null; servingUnit: string | null; calories: number | null; protein: number | null; carbs: number | null; fat: number | null };

export function NutritionForm() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Food[]>([]);
  const [selected, setSelected] = useState<Food | null>(null);
  const [mealType, setMealType] = useState("snack");
  const [servings, setServings] = useState("1");
  const [grams, setGrams] = useState("");
  const [saving, setSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function doSearch(q: string) {
    if (q.length < 2) { setResults([]); return; }
    fetch(`/api/health/nutrition/food-search?q=${encodeURIComponent(q)}`).then(r => r.json()).then(d => setResults(d?.slice?.(0, 8) || [])).catch(() => setResults([]));
  }

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(query), 250);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    await fetch("/api/health/nutrition", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mealType, foodId: selected.id, servings: parseInt(servings) || 1, grams: grams ? parseFloat(grams) : null }) });
    setQuery(""); setSelected(null); setServings("1"); setGrams("");
    setSaving(false); router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {!selected ? (
        <div className="relative">
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search food by name..." className="w-full" autoComplete="off" />
          {results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[var(--border)] rounded-xl shadow-[var(--shadow-modal)] z-20 max-h-48 overflow-y-auto">
              {results.map(f => (
                <button key={f.id} type="button" className="w-full text-left px-3 py-2.5 hover:bg-stone-50 flex items-center justify-between transition-colors" onClick={() => setSelected(f)}>
                  <div><div className="text-sm font-medium text-stone-700">{f.name}</div>{f.brand && <div className="text-xs text-stone-400">{f.brand}</div>}</div>
                  {f.calories && <span className="text-xs text-stone-400 font-mono">{f.calories} kcal{f.servingSize ? ` / ${f.servingSize}${f.servingUnit || "g"}` : ""}</span>}
                </button>
              ))}
            </div>
          )}
          {query.length >= 2 && results.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[var(--border)] rounded-xl shadow-[var(--shadow-modal)] z-20 p-4 text-sm text-stone-400 text-center">No foods found. Import USDA/Open Food Facts for offline search.</div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-[var(--border-light)]">
            <div>
              <div className="text-sm font-semibold text-stone-700">{selected.name}</div>
              <div className="text-xs text-stone-400">{selected.brand ? `${selected.brand} · ` : ""}{selected.calories ? `${selected.calories} kcal` : ""}{selected.servingSize ? ` per ${selected.servingSize}${selected.servingUnit || "g"}` : ""}</div>
              {(selected.protein || selected.carbs || selected.fat) && <div className="text-xs text-stone-400 mt-0.5">P: {selected.protein}g C: {selected.carbs}g F: {selected.fat}g</div>}
            </div>
            <button type="button" onClick={() => setSelected(null)} className="text-xs text-stone-400 hover:text-stone-600 font-medium">Change</button>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <Field label="Meal"><select value={mealType} onChange={e => setMealType(e.target.value)} className="w-full"><option value="breakfast">Breakfast</option><option value="lunch">Lunch</option><option value="dinner">Dinner</option><option value="snack">Snack</option></select></Field>
            <Field label="Servings"><input type="number" value={servings} onChange={e => setServings(e.target.value)} placeholder="1" step="0.5" min="0.25" className="w-full" /></Field>
            <Field label="Grams"><input type="number" value={grams} onChange={e => setGrams(e.target.value)} placeholder="150" min="0" className="w-full" /></Field>
          </div>
          <button type="submit" disabled={saving} className="w-full mt-2 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-semibold hover:bg-orange-700 disabled:opacity-40 transition-all active:scale-[0.98] shadow-sm">{saving ? "Saving..." : `Add to ${mealType}`}</button>
        </div>
      )}
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-[11px] font-medium text-stone-400 block mb-1">{label}</label>{children}</div>;
}
