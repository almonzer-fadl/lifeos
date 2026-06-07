"use client";

import { useState, useEffect, useMemo, useRef } from "react";

type Exercise = { id: string; name: string; muscleGroup: string; equipment: string | null };

export function ExerciseSearch({ onSelect }: { onSelect: (e: Exercise) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Exercise[]>([]);
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function search(q: string) {
    if (q.length < 1) { setResults([]); return; }
    fetch(`/api/health/exercises?q=${encodeURIComponent(q)}`).then(r => r.json()).then(setResults);
  }

  const debouncedSearch = useMemo(
    () => (q: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => search(q), 200);
    }, []
  );

  useEffect(() => {
    debouncedSearch(query);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query, debouncedSearch]);

  return (
    <div className="relative">
      <input type="text" value={query} onChange={e => { setQuery(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} placeholder="Search exercises..." className="w-full" />
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[var(--border)] rounded-xl shadow-[var(--shadow-modal)] z-20 max-h-48 overflow-y-auto">
          {results.map(ex => (
            <button key={ex.id} type="button" className="w-full text-left px-3 py-2.5 text-sm hover:bg-stone-50 flex items-center justify-between transition-colors"
              onClick={() => { onSelect(ex); setQuery(""); setOpen(false); }}>
              <span className="font-medium text-stone-700">{ex.name}</span>
              <span className="text-[11px] text-stone-400 capitalize">{ex.muscleGroup}{ex.equipment ? ` · ${ex.equipment}` : ""}</span>
            </button>
          ))}
        </div>
      )}
      {open && query && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[var(--border)] rounded-xl shadow-[var(--shadow-modal)] z-20 p-4 text-sm text-stone-400 text-center">
          No exercises found. Import the database for offline search.
        </div>
      )}
    </div>
  );
}
