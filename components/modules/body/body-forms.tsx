"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";

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
    try {
      const res = await fetch("/api/health/body-measurements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight: weight ? parseFloat(weight) : null,
          bodyFatPct: bodyFat ? parseFloat(bodyFat) : null,
          waist: waist ? parseFloat(waist) : null,
          notes: notes || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Measurement logged");
      router.push("/body");
      router.refresh();
    } catch {
      toast.error("Failed to log measurement");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-2 sm:grid-cols-[repeat(4,minmax(0,1fr))_auto] sm:items-end">
      <Field label="Weight (kg)"><input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="75" step="0.1" className="w-full" /></Field>
      <Field label="Body Fat %"><input type="number" value={bodyFat} onChange={e => setBodyFat(e.target.value)} placeholder="18" step="0.1" className="w-full" /></Field>
      <Field label="Waist (cm)"><input type="number" value={waist} onChange={e => setWaist(e.target.value)} placeholder="85" step="0.1" className="w-full" /></Field>
      <Field label="Notes"><input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Morning" className="w-full" /></Field>
      <button type="submit" disabled={saving} className="premium-action">Save</button>
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
    try {
      const res = await fetch("/api/health/lab-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testName, value: parseFloat(value), unit: unit || null,
          refRangeLow: refLow ? parseFloat(refLow) : null,
          refRangeHigh: refHigh ? parseFloat(refHigh) : null,
          date: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Lab result logged");
      router.push("/body/labs");
      router.refresh();
    } catch { toast.error("Failed to log lab result"); } finally { setSaving(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-2 sm:grid-cols-[1.2fr_repeat(4,minmax(0,0.8fr))_auto] sm:items-end">
      <Field label="Test Name"><input type="text" value={testName} onChange={e => setTestName(e.target.value)} placeholder="e.g. HbA1c" className="w-full" required /></Field>
      <Field label="Value"><input type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="5.4" step="0.01" className="w-full" required /></Field>
      <Field label="Unit"><input type="text" value={unit} onChange={e => setUnit(e.target.value)} placeholder="%" className="w-full" /></Field>
      <Field label="Ref Low"><input type="number" value={refLow} onChange={e => setRefLow(e.target.value)} placeholder="4.0" step="0.01" className="w-full" /></Field>
      <Field label="Ref High"><input type="number" value={refHigh} onChange={e => setRefHigh(e.target.value)} placeholder="5.6" step="0.01" className="w-full" /></Field>
      <button type="submit" disabled={saving} className="premium-action whitespace-nowrap">Add Result</button>
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
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_0.8fr_0.55fr_auto] sm:items-end">
      <Field label="Supplement"><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Vitamin D" className="w-full" required /></Field>
      <Field label="Brand"><input type="text" value={brand} onChange={e => setBrand(e.target.value)} placeholder="Optional" className="w-full" /></Field>
      <Field label="Dosage"><input type="number" value={dosage} onChange={e => setDosage(e.target.value)} step="0.5" min="0.5" className="w-full" /></Field>
      <button type="submit" disabled={saving} className="premium-action">Log</button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="premium-label mb-1 block">{label}</label>{children}</div>;
}
