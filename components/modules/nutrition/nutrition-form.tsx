"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";

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
    try {
      const res = await fetch("/api/health/nutrition", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mealType, foodId: selected.id, servings: parseInt(servings) || 1, grams: grams ? parseFloat(grams) : null }) });
      if (!res.ok) throw new Error();
      toast.success("Food logged");
      router.push("/nutrition");
    } catch { toast.error("Failed to log food"); } finally { setSaving(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {!selected ? (
        <div className="relative">
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search food by name..." className="w-full" autoComplete="off" />
          {results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--surface-raised)] border border-[var(--border)] rounded-lg shadow-[var(--shadow-modal)] z-20 max-h-48 overflow-y-auto">
              {results.map(f => (
                <button key={f.id} type="button" className="w-full text-left px-3 py-2.5 hover:bg-[var(--surface-hover)] flex items-center justify-between transition-colors" onClick={() => setSelected(f)}>
                  <div><div className="text-sm font-medium text-[var(--text)]">{f.name}</div>{f.brand && <div className="text-xs text-[var(--text-tertiary)]">{f.brand}</div>}</div>
                  {f.calories && <span className="text-xs text-[var(--text-tertiary)] font-mono">{f.calories} kcal{f.servingSize ? ` / ${f.servingSize}${f.servingUnit || "g"}` : ""}</span>}
                </button>
              ))}
            </div>
          )}
          {query.length >= 2 && results.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--surface-raised)] border border-[var(--border)] rounded-lg shadow-[var(--shadow-modal)] z-20 p-4 text-sm text-[var(--text-tertiary)] text-center">No foods found. Import USDA/Open Food Facts for offline search.</div>
          )}
        </div>
      ) : (
        <div>
          <div className="premium-row flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-[var(--text)]">{selected.name}</div>
              <div className="text-xs text-[var(--text-tertiary)]">{selected.brand ? `${selected.brand} · ` : ""}{selected.calories ? `${selected.calories} kcal` : ""}{selected.servingSize ? ` per ${selected.servingSize}${selected.servingUnit || "g"}` : ""}</div>
              {(selected.protein || selected.carbs || selected.fat) && <div className="text-xs text-[var(--text-tertiary)] mt-0.5">P: {selected.protein}g C: {selected.carbs}g F: {selected.fat}g</div>}
            </div>
            <button type="button" onClick={() => setSelected(null)} className="text-xs text-[var(--text-tertiary)] hover:text-[var(--accent)] font-medium">Change</button>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <Field label="Meal"><select value={mealType} onChange={e => setMealType(e.target.value)} className="w-full"><option value="breakfast">Breakfast</option><option value="lunch">Lunch</option><option value="dinner">Dinner</option><option value="snack">Snack</option></select></Field>
            <Field label="Servings"><input type="number" value={servings} onChange={e => setServings(e.target.value)} placeholder="1" step="0.5" min="0.25" className="w-full" /></Field>
            <Field label="Grams"><input type="number" value={grams} onChange={e => setGrams(e.target.value)} placeholder="150" min="0" className="w-full" /></Field>
          </div>
          <button type="submit" disabled={saving} className="premium-action mt-2 w-full">{saving ? "Saving..." : `Add to ${mealType}`}</button>
        </div>
      )}
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="premium-label mb-1 block">{label}</label>{children}</div>;
}
