"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FoodItem {
  name: string;
  brand: string | null;
  barcode: string | null;
  servingSize: number;
  servingUnit: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fiber: number | null;
  sugars: number | null;
}

interface SearchResponse {
  local: FoodItem[];
  remote: FoodItem[];
  total: number;
}

export default function FoodSearchPage() {
  const [query, setQuery] = useState("");
  const [barcode, setBarcode] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"search" | "barcode">("search");
  const [logServing, setLogServing] = useState(1);
  const [mealType, setMealType] = useState("snack");
  const [logging, setLogging] = useState(false);
  const [logMessage, setLogMessage] = useState<string | null>(null);

  async function search() {
    if (!query.trim() && mode === "search") return;
    setLoading(true);
    setResults(null);

    try {
      const params = new URLSearchParams();
      if (mode === "barcode" && barcode.trim()) {
        params.set("barcode", barcode.trim());
      } else {
        params.set("q", query.trim());
      }
      const res = await fetch(`/api/health/nutrition/food-search?${params}`);
      const data = await res.json();
      if (res.ok) {
        setResults(data);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }

  async function logFood() {
    if (!selectedItem) return;
    setLogging(true);
    try {
      const calories = selectedItem.calories
        ? Math.round(selectedItem.calories * logServing)
        : 0;
      const protein = selectedItem.protein
        ? Math.round(selectedItem.protein * logServing * 10) / 10
        : 0;
      const carbs = selectedItem.carbs
        ? Math.round(selectedItem.carbs * logServing * 10) / 10
        : 0;
      const fat = selectedItem.fat
        ? Math.round(selectedItem.fat * logServing * 10) / 10
        : 0;

      const res = await fetch("/api/health/nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodName: selectedItem.name,
          calories,
          protein,
          carbs,
          fat,
          servings: logServing,
          mealType,
        }),
      });

      if (res.ok) {
        setLogMessage(`Logged ${logServing} serving(s) of ${selectedItem.name}`);
        setTimeout(() => setLogMessage(null), 3000);
      } else {
        setLogMessage("Failed to log food. Try again.");
      }
    } catch {
      setLogMessage("Failed to log food. Try again.");
    } finally {
      setLogging(false);
    }
  }

  const allItems = results
    ? [...results.local, ...results.remote.filter(
        (r) => !results.local.some((l) => l.barcode === r.barcode)
      )]
    : [];

  // Macro color calculation
  function macroColor(value: number | null, type: "protein" | "carbs" | "fat"): string {
    if (!value) return "bg-[var(--border-light)]";
    const pct = type === "protein" ? (value * 4) / 4 : type === "carbs" ? (value * 4) / 4 : (value * 9) / 9;
    if (pct < 1) return "bg-[var(--border-light)]";
    if (pct < 5) return "bg-[var(--sky)]";
    if (pct < 15) return "bg-[var(--amber)]";
    return "bg-[var(--rose)]";
  }

  return (
    <div className="premium-page animate-fade-in">
      <div className="premium-header animate-fade-in">
        <div className="premium-kicker">Nutrition Scout</div>
        <h1 className="premium-title">Food Search</h1>
        <p className="premium-subtitle">
          Search 3M+ products via Open Food Facts — free, no API key needed
        </p>
      </div>

      {/* Mode toggle */}
      <div className="mb-3 flex items-center gap-1">
        {(["search", "barcode"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-md px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide transition-all ${
              mode === m
                ? "bg-[var(--surface-hover)] text-[var(--text)] border border-[var(--border-strong)]"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            }`}
          >
            {m === "search" ? "🔍 Search" : "📱 Barcode"}
          </button>
        ))}
      </div>

      {/* Search input */}
      <form
        onSubmit={(e) => { e.preventDefault(); search(); }}
        className="mb-4 flex gap-2"
      >
        {mode === "search" ? (
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search food by name..."
            className="flex-1"
          />
        ) : (
          <input
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="Enter barcode (EAN/UPC)..."
            className="flex-1"
          />
        )}
        <button
          type="submit"
          disabled={loading || (mode === "search" ? !query.trim() : !barcode.trim())}
          className="premium-action text-xs shrink-0"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {/* Results */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-lg" />
          ))}
        </div>
      ) : allItems.length > 0 ? (
        <div className="space-y-2 animate-stagger">
          {allItems.slice(0, 15).map((item, i) => (
            <motion.button
              key={item.barcode || i}
              whileHover={{ scale: 1.005, y: -1 }}
              whileTap={{ scale: 0.995 }}
              onClick={() => setSelectedItem(item)}
              className={`w-full text-left rounded-lg border p-3 transition-colors ${
                selectedItem?.barcode === item.barcode
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                  : "border-[var(--border-light)] bg-[var(--surface)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[var(--text)] truncate">
                    {item.name}
                  </div>
                  <div className="text-xs text-[var(--text-tertiary)]">
                    {item.brand && `${item.brand} · `}
                    {item.servingSize}{item.servingUnit} serving
                  </div>
                </div>
                {item.calories != null && (
                  <div className="text-right shrink-0">
                    <div className="font-mono text-sm font-semibold text-[var(--text)]">
                      {item.calories}
                    </div>
                    <div className="text-[9px] text-[var(--text-tertiary)]">kcal</div>
                  </div>
                )}
              </div>
              {/* Macro bar */}
              {item.protein != null || item.carbs != null || item.fat != null ? (
                <div className="mt-2 flex gap-0.5">
                  <div
                    className="h-1 rounded-full bg-[var(--sky)]"
                    style={{ width: `${Math.min((item.protein || 0) * 4, 100)}%` }}
                    title={`${item.protein || 0}g protein`}
                  />
                  <div
                    className="h-1 rounded-full bg-[var(--amber)]"
                    style={{ width: `${Math.min((item.carbs || 0) * 3, 100)}%` }}
                    title={`${item.carbs || 0}g carbs`}
                  />
                  <div
                    className="h-1 rounded-full bg-[var(--rose)]"
                    style={{ width: `${Math.min((item.fat || 0) * 5, 100)}%` }}
                    title={`${item.fat || 0}g fat`}
                  />
                </div>
              ) : null}
            </motion.button>
          ))}
        </div>
      ) : results ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-[var(--text-tertiary)]">No results found</p>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">
            Try a different search term or barcode
          </p>
        </div>
      ) : null}

      {/* Log food panel */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="mt-3 rounded-lg border border-[var(--border-strong)] bg-[var(--surface-raised)] p-4"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="text-sm font-semibold text-[var(--text)]">
                  {selectedItem.name}
                </h3>
                <p className="text-xs text-[var(--text-tertiary)]">
                  {selectedItem.brand || "Generic"} · {selectedItem.servingSize}{selectedItem.servingUnit}/serving
                </p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              >
                ✕
              </button>
            </div>

            {/* Macros */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="rounded border border-[var(--border-light)] p-2 text-center">
                <div className="font-mono text-lg font-semibold text-[var(--text)]">
                  {selectedItem.calories ?? "—"}
                </div>
                <div className="text-[9px] text-[var(--text-tertiary)]">kcal</div>
              </div>
              <div className="rounded border border-[var(--border-light)] p-2 text-center">
                <div className="font-mono text-lg font-semibold text-[var(--sky)]">
                  {selectedItem.protein ?? "—"}g
                </div>
                <div className="text-[9px] text-[var(--text-tertiary)]">protein</div>
              </div>
              <div className="rounded border border-[var(--border-light)] p-2 text-center">
                <div className="font-mono text-lg font-semibold text-[var(--amber)]">
                  {selectedItem.carbs ?? "—"}g
                </div>
                <div className="text-[9px] text-[var(--text-tertiary)]">carbs</div>
              </div>
              <div className="rounded border border-[var(--border-light)] p-2 text-center">
                <div className="font-mono text-lg font-semibold text-[var(--rose)]">
                  {selectedItem.fat ?? "—"}g
                </div>
                <div className="text-[9px] text-[var(--text-tertiary)]">fat</div>
              </div>
            </div>

            {/* Log controls */}
            <div className="flex items-end gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-[var(--text-tertiary)] mb-1">
                  Servings
                </label>
                <input
                  type="number"
                  value={logServing}
                  onChange={(e) => setLogServing(Math.max(0.25, parseFloat(e.target.value) || 1))}
                  min={0.25}
                  step={0.25}
                  className="w-20"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[var(--text-tertiary)] mb-1">
                  Meal
                </label>
                <select value={mealType} onChange={(e) => setMealType(e.target.value)}>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>
              <button
                onClick={logFood}
                disabled={logging}
                className="premium-action text-xs"
              >
                {logging ? "Logging..." : "Log Food"}
              </button>
            </div>

            {logMessage && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-xs text-[var(--emerald)]"
              >
                ✅ {logMessage}
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attribution */}
      <p className="mt-6 text-center text-[9px] text-[var(--text-tertiary)]">
        Food data via Open Food Facts · openfoodfacts.org
      </p>
    </div>
  );
}
