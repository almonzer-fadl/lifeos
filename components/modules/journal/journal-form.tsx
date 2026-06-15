"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function JournalForm() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSaving(true);
    await fetch("/api/productivity/journal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content, mood: mood || null, tags: tags || null }) });
    setContent(""); setMood(""); setTags("");
    setSaving(false); router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="What's on your mind today?" className="w-full" rows={4} required />
      <div className="flex flex-col sm:flex-row gap-2">
        <select value={mood} onChange={e => setMood(e.target.value)} className="w-full sm:w-36">
          <option value="">No mood</option>
          <option value="great">😄 Great</option>
          <option value="good">🙂 Good</option>
          <option value="okay">😐 Okay</option>
          <option value="bad">😔 Bad</option>
          <option value="terrible">😞 Terrible</option>
        </select>
        <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="Tags (comma-separated)" className="flex-1" />
        <button type="submit" disabled={saving || !content.trim()} className="py-2.5 px-5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 disabled:opacity-40 transition-all active:scale-[0.97] shadow-sm whitespace-nowrap">
          {saving ? "Saving..." : "Save Entry"}
        </button>
      </div>
    </form>
  );
}
