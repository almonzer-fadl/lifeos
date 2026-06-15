"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExerciseSearch } from "./exercise-search";

type Exercise = {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string | null;
};

type SetEntry = {
  exercise: Exercise | null;
  setNumber: number;
  weight: string;
  reps: string;
  rpe: string;
};

export function WorkoutLogger() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [sets, setSets] = useState<SetEntry[]>([]);
  const [saving, setSaving] = useState(false);

  function addSet() {
    setSets([
      ...sets,
      { exercise: null, setNumber: sets.length + 1, weight: "", reps: "", rpe: "" },
    ]);
  }

  function updateSet(index: number, field: keyof SetEntry, value: unknown) {
    const updated = [...sets];
    (updated[index] as Record<string, unknown>)[field] = value;
    setSets(updated);
  }

  function selectExercise(index: number, exercise: Exercise) {
    updateSet(index, "exercise", exercise);
  }

  function removeSet(index: number) {
    setSets(sets.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sets.length === 0) return;

    setSaving(true);
    await fetch("/api/health/workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: new Date().toISOString(),
        name: name || "Workout",
        notes: notes || null,
        sets: sets.map((s) => ({
          exerciseId: s.exercise!.id,
          setNumber: s.setNumber,
          weight: s.weight ? parseFloat(s.weight) : null,
          reps: s.reps ? parseInt(s.reps) : null,
          rpe: s.rpe ? parseFloat(s.rpe) : null,
        })),
      }),
    });

    setName("");
    setNotes("");
    setSets([]);
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Workout name (e.g., Push Day)"
          className="flex-1"
        />
        <button
          type="button"
          onClick={addSet}
          className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors"
        >
          + Add Set
        </button>
      </div>

      {sets.length > 0 && (
        <div className="space-y-2">
          {sets.map((s, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row gap-2 p-3 rounded-lg bg-zinc-800/50 border border-zinc-800"
            >
              <div className="flex-1 min-w-0">
                <ExerciseSearch
                  onSelect={(ex) => selectExercise(i, ex)}
                />
                {s.exercise && (
                  <div className="text-xs text-zinc-500 mt-1">
                    {s.exercise.muscleGroup}
                  </div>
                )}
              </div>
              <div className="flex gap-2 items-end">
                <div>
                  <label className="text-[10px] text-zinc-500 block">Kg</label>
                  <input
                    type="number"
                    value={s.weight}
                    onChange={(e) => updateSet(i, "weight", e.target.value)}
                    placeholder="50"
                    className="w-16 text-sm"
                    step="0.5"
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 block">Reps</label>
                  <input
                    type="number"
                    value={s.reps}
                    onChange={(e) => updateSet(i, "reps", e.target.value)}
                    placeholder="10"
                    className="w-16 text-sm"
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 block">RPE</label>
                  <input
                    type="number"
                    value={s.rpe}
                    onChange={(e) => updateSet(i, "rpe", e.target.value)}
                    placeholder="8"
                    className="w-14 text-sm"
                    step="0.5"
                    min="1"
                    max="10"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeSet(i)}
                  className="text-zinc-500 hover:text-red-400 text-lg leading-none pb-1"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes..."
        className="w-full"
        rows={2}
      />

      <button
        type="submit"
        disabled={saving || sets.length === 0 || sets.some((s) => !s.exercise)}
        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {saving ? "Saving..." : "Log Workout"}
      </button>
    </form>
  );
}
