"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExerciseSearch } from "./exercise-search";
import { toast } from "@/lib/toast";

type Exercise = { id: string; name: string; muscleGroup: string; equipment: string | null };
type SetEntry = { exercise: Exercise | null; setNumber: number; weight: string; reps: string; rpe: string };

export function WorkoutLogger() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [sets, setSets] = useState<SetEntry[]>([]);
  const [saving, setSaving] = useState(false);

  function addSet() {
    setSets([...sets, { exercise: null, setNumber: sets.length + 1, weight: "", reps: "", rpe: "" }]);
  }

  function update(i: number, field: keyof SetEntry, val: unknown) {
    const u = [...sets];
    (u[i] as Record<string, unknown>)[field] = val;
    setSets(u);
  }

  function removeSet(i: number) { setSets(sets.filter((_, idx) => idx !== i)); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sets.length === 0 || sets.some(s => !s.exercise)) return;
    setSaving(true);
    try {
      const res = await fetch("/api/health/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: new Date().toISOString(),
          name: name || "Workout",
          notes: notes || null,
          sets: sets.map(s => ({
            exerciseId: s.exercise!.id,
            setNumber: s.setNumber,
            weight: s.weight ? parseFloat(s.weight) : null,
            reps: s.reps ? parseInt(s.reps) : null,
            rpe: s.rpe ? parseFloat(s.rpe) : null,
          })),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Workout logged");
      router.push("/activity");
    } catch {
      toast.error("Failed to log workout");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Workout name (e.g. Push Day)" className="flex-1" />
        <button type="button" onClick={addSet} className="rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.035)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] transition-all hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] active:scale-95">
          + Add Set
        </button>
      </div>

      {sets.length > 0 && (
        <div className="space-y-2">
          {sets.map((s, i) => (
            <div key={i} className="premium-row flex flex-col gap-2 sm:flex-row">
              <div className="flex-1 min-w-0">
                <ExerciseSearch onSelect={(ex) => update(i, "exercise", ex)} />
                {s.exercise && <div className="text-[11px] text-[var(--text-tertiary)] mt-1">{s.exercise.muscleGroup}</div>}
              </div>
              <div className="flex gap-1.5 items-end">
                <NumInput label="Kg" value={s.weight} onChange={v => update(i, "weight", v)} placeholder="50" w="w-14" step="0.5" />
                <NumInput label="Reps" value={s.reps} onChange={v => update(i, "reps", v)} placeholder="10" w="w-14" />
                <NumInput label="RPE" value={s.rpe} onChange={v => update(i, "rpe", v)} placeholder="8" w="w-12" step="0.5" min="1" max="10" />
                <button type="button" onClick={() => removeSet(i)} className="text-[var(--text-tertiary)] hover:text-[var(--rose)] text-lg pb-0.5 transition-colors">×</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes..." className="w-full" rows={2} />

      <button type="submit" disabled={saving || sets.length === 0 || sets.some(s => !s.exercise)}
        className="premium-action w-full">
        {saving ? "Saving..." : "Log Workout"}
      </button>
    </form>
  );
}

function NumInput({ label, value, onChange, placeholder, w, step = "1", min = "0", max }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; w: string; step?: string; min?: string; max?: string;
}) {
  return (
    <div>
      <label className="premium-label mb-0.5 block">{label}</label>
      <input type="number" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={`${w} text-sm`} step={step} min={min} max={max} />
    </div>
  );
}
