"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BodyMeasurementForm() {
  const router = useRouter();
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [waist, setWaist] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/health/body-measurements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weight: weight ? parseFloat(weight) : null,
        bodyFatPct: bodyFat ? parseFloat(bodyFat) : null,
        waist: waist ? parseFloat(waist) : null,
        notes: notes || null,
      }),
    });
    setWeight(""); setBodyFat(""); setWaist(""); setNotes("");
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 items-end">
      <Field label="Weight (kg)"><input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="75" step="0.1" className="w-20" /></Field>
      <Field label="Body Fat %"><input type="number" value={bodyFat} onChange={e => setBodyFat(e.target.value)} placeholder="18" step="0.1" className="w-20" /></Field>
      <Field label="Waist (cm)"><input type="number" value={waist} onChange={e => setWaist(e.target.value)} placeholder="85" step="0.1" className="w-20" /></Field>
      <Field label="Notes"><input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Morning" className="w-32" /></Field>
      <button type="submit" disabled={saving} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40 transition-all active:scale-[0.97] shadow-sm">Save</button>
    </form>
  );
}

export function LabResultForm() {
  const router = useRouter();
  const [testName, setTestName] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("");
  const [refLow, setRefLow] = useState("");
  const [refHigh, setRefHigh] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!testName || !value) return;
    setSaving(true);
    await fetch("/api/health/lab-results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        testName, value: parseFloat(value), unit: unit || null,
        refRangeLow: refLow ? parseFloat(refLow) : null,
        refRangeHigh: refHigh ? parseFloat(refHigh) : null,
        date: new Date().toISOString(),
      }),
    });
    setTestName(""); setValue(""); setUnit(""); setRefLow(""); setRefHigh("");
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 items-end">
      <Field label="Test Name"><input type="text" value={testName} onChange={e => setTestName(e.target.value)} placeholder="e.g. HbA1c" className="w-28" required /></Field>
      <Field label="Value"><input type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="5.4" step="0.01" className="w-20" required /></Field>
      <Field label="Unit"><input type="text" value={unit} onChange={e => setUnit(e.target.value)} placeholder="%" className="w-16" /></Field>
      <Field label="Ref Low"><input type="number" value={refLow} onChange={e => setRefLow(e.target.value)} placeholder="4.0" step="0.01" className="w-20" /></Field>
      <Field label="Ref High"><input type="number" value={refHigh} onChange={e => setRefHigh(e.target.value)} placeholder="5.6" step="0.01" className="w-20" /></Field>
      <button type="submit" disabled={saving} className="px-4 py-2 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700 disabled:opacity-40 transition-all active:scale-[0.97] shadow-sm whitespace-nowrap">Add Result</button>
    </form>
  );
}

export function SupplementForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [dosage, setDosage] = useState("1");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;
    setSaving(true);
    // Create supplement then log it
    const suppRes = await fetch("/api/health/nutrition/food-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, brand: brand || null, servingSize: 1 }),
    });
    const supp = await suppRes.json();
    await fetch("/api/health/nutrition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ foodId: supp.id, servings: parseInt(dosage), mealType: "snack" }),
    });
    setName(""); setBrand(""); setDosage("1");
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <Field label="Supplement"><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Vitamin D" className="w-32" required /></Field>
      <Field label="Brand"><input type="text" value={brand} onChange={e => setBrand(e.target.value)} placeholder="Optional" className="w-24" /></Field>
      <Field label="Dosage"><input type="number" value={dosage} onChange={e => setDosage(e.target.value)} step="0.5" min="0.5" className="w-16" /></Field>
      <button type="submit" disabled={saving} className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 disabled:opacity-40 transition-all active:scale-[0.97] shadow-sm">Log</button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-[11px] font-medium text-stone-400 block mb-1">{label}</label>{children}</div>;
}
