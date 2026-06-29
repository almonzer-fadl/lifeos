"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Exercise {
  exerciseId: string;
  name: string;
  gifUrl: string;
  targetMuscles: string[];
  bodyParts: string[];
  equipments: string[];
  secondaryMuscles: string[];
  instructions: string[];
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [bodyParts, setBodyParts] = useState<{ key: string; label: string }[]>([]);
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadExercises = (bodyPart?: string | null) => {
    const url = bodyPart
      ? `/api/health/exercise-db?bodyPart=${encodeURIComponent(bodyPart)}`
      : "/api/health/exercise-db";

    setLoading(true);
    setError(null);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    fetch(url, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`API returned ${r.status}`);
        return r.json();
      })
      .then((data) => {
        clearTimeout(timeout);
        if (bodyPart) {
          setExercises(Array.isArray(data) ? data : []);
        } else {
          setExercises(data.exercises || []);
          setBodyParts(data.bodyParts || []);
        }
        setLoading(false);
      })
      .catch((e) => {
        clearTimeout(timeout);
        if (e.name !== "AbortError") {
          setError(e.message || "Failed to load exercises");
        } else {
          setError("Request timed out — the exercise API may be unavailable");
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    loadExercises(selectedPart);
  }, [selectedPart]);

  const filtered = search.trim()
    ? exercises.filter(
        (e) =>
          e.name.toLowerCase().includes(search.toLowerCase()) ||
          e.targetMuscles.some((m) => m.toLowerCase().includes(search.toLowerCase()))
      )
    : exercises;

  if (error) {
    return (
      <div className="premium-page animate-fade-in">
        <div className="premium-header animate-fade-in">
          <div className="premium-kicker">Movement Library</div>
          <h1 className="premium-title">Exercises</h1>
        </div>
        <div className="premium-panel">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--amber)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-sm text-[var(--rose)] mb-1">Exercise API unavailable</p>
            <p className="text-xs text-[var(--text-tertiary)] max-w-sm mb-4">
              The free ExerciseDB API might be rate-limited or temporarily down.
              Seed the database locally for offline access.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => loadExercises(selectedPart)}
                className="premium-action text-xs"
              >
                Retry API
              </button>
              <a
                href="/api/health/exercise-db"
                target="_blank"
                rel="noopener"
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[10px] font-semibold text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              >
                Test API →
              </a>
            </div>
            <p className="mt-4 text-[9px] text-[var(--text-tertiary)]">
              Run <code className="rounded bg-[var(--surface-hover)] px-1 py-0.5 text-[var(--accent)]">npm run seed:exercises</code> to import 1,500 exercises locally
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-page animate-fade-in">
      <div className="premium-header animate-fade-in">
        <div className="premium-kicker">Movement Library</div>
        <h1 className="premium-title">Exercises</h1>
        <p className="premium-subtitle">
          {loading
            ? "Loading exercise database..."
            : exercises.length > 0
            ? `${exercises.length} exercises powered by ExerciseDB`
            : "No exercises loaded — try a different filter"}
        </p>
      </div>

      {/* Filter bar */}
      {bodyParts.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedPart(null)}
            className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide transition-all ${
              !selectedPart
                ? "bg-[var(--surface-hover)] text-[var(--text)] border border-[var(--border-strong)]"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            }`}
          >
            All
          </button>
          {bodyParts.map((bp) => (
            <button
              key={bp.key}
              onClick={() => setSelectedPart(bp.key)}
              className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide transition-all ${
                selectedPart === bp.key
                  ? "bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/30"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {bp.label}
            </button>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="mb-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search exercises..."
          className="w-full sm:max-w-xs"
        />
      </div>

      {/* Exercise grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton h-56 rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-[var(--text-tertiary)]">
            {search ? "No exercises match your search" : "No exercises found for this filter"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 animate-stagger">
          {filtered.slice(0, 60).map((ex) => (
            <motion.button
              key={ex.exerciseId}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedExercise(ex)}
              className="group relative flex flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] text-left transition-all hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-card)]"
            >
              {ex.gifUrl ? (
                <div className="aspect-square bg-[var(--bg)] flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ex.gifUrl}
                    alt={ex.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="aspect-square bg-[var(--bg)] flex items-center justify-center">
                  <span className="text-[10px] text-[var(--text-tertiary)]">No preview</span>
                </div>
              )}
              <div className="p-2.5">
                <div className="text-xs font-semibold text-[var(--text)] capitalize line-clamp-2 leading-tight">
                  {ex.name}
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {ex.targetMuscles.slice(0, 2).map((m) => (
                    <span
                      key={m}
                      className="rounded-full bg-[var(--surface-hover)] px-1.5 py-0.5 text-[8px] font-semibold text-[var(--text-tertiary)] uppercase"
                    >
                      {m}
                    </span>
                  ))}
                  {ex.equipments.length > 0 && (
                    <span className="rounded-full bg-[var(--accent-soft)] px-1.5 py-0.5 text-[8px] font-semibold text-[var(--accent)] uppercase">
                      {ex.equipments[0]}
                    </span>
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* Exercise detail modal */}
      {selectedExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedExercise(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-[var(--border-strong)] bg-[var(--surface-deep)] shadow-[var(--shadow-modal)]"
          >
            {selectedExercise.gifUrl && (
              <div className="aspect-video bg-[var(--bg)] flex items-center justify-center overflow-hidden rounded-t-xl border-b border-[var(--border)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedExercise.gifUrl}
                  alt={selectedExercise.name}
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            <div className="p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text)] capitalize">
                    {selectedExercise.name}
                  </h3>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedExercise.targetMuscles.map((m) => (
                      <span
                        key={m}
                        className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--accent)] uppercase"
                      >
                        {m}
                      </span>
                    ))}
                    {selectedExercise.equipments.map((e) => (
                      <span
                        key={e}
                        className="rounded-full bg-[var(--surface-hover)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase"
                      >
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedExercise(null)}
                  className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] text-xl"
                >
                  ✕
                </button>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">
                  Instructions
                </h4>
                <ol className="space-y-1.5">
                  {selectedExercise.instructions?.map((step, i) => (
                    <li key={i} className="flex gap-2 text-xs text-[var(--text-secondary)]">
                      <span className="text-[var(--text-tertiary)] font-mono shrink-0">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {selectedExercise.secondaryMuscles.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                  <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">
                    Secondary Muscles
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedExercise.secondaryMuscles.map((m) => (
                      <span key={m} className="rounded bg-[var(--surface-hover)] px-2 py-0.5 text-[10px] text-[var(--text-tertiary)] capitalize">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
