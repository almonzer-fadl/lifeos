"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";

export function SleepForm() {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [bed, setBed] = useState("23:00");
  const [wake, setWake] = useState("07:00");
  const [quality, setQuality] = useState("3");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const start = new Date(`${date}T${bed}:00`);
    const end = new Date(`${date}T${wake}:00`);
    if (end <= start) end.setDate(end.getDate() + 1);
    try {
      const res = await fetch("/api/health/sleep", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ startTime: start.toISOString(), endTime: end.toISOString(), quality: parseInt(quality), notes: notes || null }) });
      if (!res.ok) throw new Error();
      toast.success("Sleep logged");
      router.push("/sleep");
    } catch {
      toast.error("Failed to log sleep");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end">
      <Field label="Date"><input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full" required /></Field>
      <Field label="Bedtime"><input type="time" value={bed} onChange={e => setBed(e.target.value)} className="w-full" required /></Field>
      <Field label="Wake time"><input type="time" value={wake} onChange={e => setWake(e.target.value)} className="w-full" required /></Field>
      <Field label="Quality">
        <select value={quality} onChange={e => setQuality(e.target.value)} className="w-full">
          {[1,2,3,4,5].map(q => <option key={q} value={q}>{q}/5</option>)}
        </select>
      </Field>
      <button type="submit" disabled={saving} className="premium-action">Save</button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="premium-label mb-1 block">{label}</label>{children}</div>;
}
