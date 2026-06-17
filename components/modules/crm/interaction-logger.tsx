"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface InteractionLoggerProps {
  contactId: string;
  contactName: string;
  onLogged?: () => void;
}

const interactionTypes = [
  { value: "message", label: "Message", icon: "💬" },
  { value: "call", label: "Call", icon: "📞" },
  { value: "meeting", label: "Meeting", icon: "🤝" },
  { value: "video_call", label: "Video", icon: "📹" },
  { value: "email", label: "Email", icon: "📧" },
  { value: "in_person", label: "In Person", icon: "👋" },
];

const moods = [
  { value: "positive", label: "Positive" },
  { value: "neutral", label: "Neutral" },
  { value: "negative", label: "Negative" },
];

export function InteractionLogger({ contactId, contactName, onLogged }: InteractionLoggerProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("message");
  const [direction, setDirection] = useState("outgoing");
  const [platform, setPlatform] = useState("whatsapp");
  const [summary, setSummary] = useState("");
  const [actionItems, setActionItems] = useState("");
  const [mood, setMood] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!summary.trim()) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/crm/contacts/${contactId}/interactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          direction,
          platform: platform || null,
          summary: summary.trim(),
          actionItems: actionItems.trim() || null,
          mood,
        }),
      });
      if (!res.ok) throw new Error();
      setSummary("");
      setActionItems("");
      setMood(null);
      setOpen(false);
      onLogged?.();
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-[var(--bg)] transition-opacity hover:opacity-90"
      >
        Log Interaction
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center">
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-md rounded-t-2xl bg-[var(--bg)] p-6 sm:rounded-2xl"
          >
            <h3 className="mb-4 text-sm font-semibold text-[var(--text)]">
              Log with {contactName}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type */}
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                  Type
                </label>
                <div className="flex flex-wrap gap-1">
                  {interactionTypes.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setType(t.value)}
                      className={`rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                        type === t.value
                          ? "bg-[var(--accent)] text-[var(--bg)]"
                          : "bg-[rgba(255,255,255,0.05)] text-[var(--text-tertiary)]"
                      }`}
                    >
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Direction */}
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                  Direction
                </label>
                <div className="flex gap-2">
                  {["outgoing", "incoming"].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDirection(d)}
                      className={`rounded-lg px-3 py-1.5 text-[11px] font-medium capitalize transition-colors ${
                        direction === d
                          ? "bg-[var(--accent)] text-[var(--bg)]"
                          : "bg-[rgba(255,255,255,0.05)] text-[var(--text-tertiary)]"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                  Summary
                </label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border-light)] bg-[rgba(255,255,255,0.02)] px-3 py-2 text-xs text-[var(--text)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)] focus:outline-none"
                  rows={2}
                  placeholder="What was discussed..."
                  autoFocus
                />
              </div>

              {/* Action items */}
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                  Action Items
                </label>
                <input
                  type="text"
                  value={actionItems}
                  onChange={(e) => setActionItems(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border-light)] bg-[rgba(255,255,255,0.02)] px-3 py-2 text-xs text-[var(--text)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)] focus:outline-none"
                  placeholder="Things to follow up on..."
                />
              </div>

              {/* Mood */}
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                  Mood
                </label>
                <div className="flex gap-2">
                  {moods.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setMood(mood === m.value ? null : m.value)}
                      className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors ${
                        mood === m.value
                          ? m.value === "positive"
                            ? "bg-[var(--emerald-soft)] text-[var(--emerald)]"
                            : m.value === "negative"
                              ? "bg-[var(--rose-soft)] text-[var(--rose)]"
                              : "bg-[rgba(255,255,255,0.05)] text-[var(--text)]"
                          : "bg-[rgba(255,255,255,0.05)] text-[var(--text-tertiary)]"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-xl bg-[rgba(255,255,255,0.05)] py-2 text-xs font-medium text-[var(--text-tertiary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!summary.trim() || saving}
                  className="flex-1 rounded-xl bg-[var(--accent)] py-2 text-xs font-semibold text-[var(--bg)] disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Log & Update"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
}
