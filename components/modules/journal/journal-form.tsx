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
    await fetch("/api/productivity/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        mood: mood || null,
        tags: tags || null,
      }),
    });

    setContent("");
    setMood("");
    setTags("");
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind today?"
        className="w-full"
        rows={4}
        required
      />
      <div className="flex gap-2 items-center">
        <select value={mood} onChange={(e) => setMood(e.target.value)} className="w-32">
          <option value="">No mood</option>
          <option value="great">Great</option>
          <option value="good">Good</option>
          <option value="okay">Okay</option>
          <option value="bad">Bad</option>
          <option value="terrible">Terrible</option>
        </select>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags (comma-separated)"
          className="flex-1"
        />
        <button
          type="submit"
          disabled={saving || !content.trim()}
          className="px-4 py-2 bg-zinc-700 text-white rounded-lg text-sm font-medium hover:bg-zinc-600 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving..." : "Save Entry"}
        </button>
      </div>
    </form>
  );
}
