"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";

export default function NewJournalPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);

  const moods = ["😊", "😐", "😔", "😤", "😴", "💪", "🧘", "🎉"];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content) return;
    setSaving(true);
    try {
      const res = await fetch("/api/productivity/journal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content, mood: mood || null, tags: tags || null }) });
      if (!res.ok) throw new Error();
      toast.success("Entry saved");
      router.push("/journal");
    } catch { toast.error("Failed to save entry"); } finally { setSaving(false); }
  }

  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in"><div className="premium-kicker">New Entry</div><h1 className="premium-title">Journal</h1><p className="premium-subtitle">Write your thoughts</p></div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <section className="premium-panel animate-fade-in">
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="What's on your mind?" className="w-full min-h-[200px] border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-tertiary)] text-sm resize-y" required />
          <div className="mt-3 flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)] mr-1">Mood:</span>
            {moods.map((m) => (
              <button key={m} type="button" onClick={() => setMood(mood === m ? "" : m)} className={`rounded-md border px-2 py-1 text-sm transition-all ${mood === m ? "border-[rgba(215,181,109,0.34)] bg-[var(--accent-soft)]" : "border-[var(--border-light)] hover:border-[var(--border)]"}`}>{m}</button>
            ))}
          </div>
          <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags (comma separated)" className="w-full mt-3 border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-tertiary)] text-sm" />
        </section>
        <div className="flex gap-3"><button type="button" onClick={() => router.back()} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-6 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] active:scale-[0.99]">Cancel</button><button type="submit" disabled={saving || !content} className="flex-1 rounded-lg border border-[rgba(215,181,109,0.34)] bg-[rgba(215,181,109,0.14)] px-6 py-2.5 text-sm font-semibold text-[var(--accent)] shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] transition-all hover:border-[rgba(215,181,109,0.55)] hover:bg-[rgba(215,181,109,0.2)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-35">{saving ? "Saving..." : "Save Entry"}</button></div>
      </form>
    </div>
  );
}
