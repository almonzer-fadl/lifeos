"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Insight {
  id: string;
  type: string;
  urgency: "high" | "medium" | "low";
  headline: string;
  body: string;
  href: string | null;
  icon: string | null;
  dismissed: boolean;
  actedOn: boolean;
  createdAt: string;
}

export function AIDashboardWidget() {
  const [insights, setInsights] = useState<Insight[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetch("/api/ai/context")
      .then((r) => r.json())
      .catch(() => ({ context: null }));

    fetch("/api/insights?limit=10")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setInsights(data);
        } else {
          console.error("Insights API returned non-array data:", data);
          setInsights([]);
        }
        setLoading(false);
        setTimeout(() => setVisible(true), 100);
      })
      .catch((err) => {
        console.error("Failed to fetch insights:", err);
        setInsights([]);
        setLoading(false);
      });
  }, []);

  const handleDismiss = async (id: string) => {
    setInsights((prev) => prev?.filter((i) => i.id !== id) || null);
    await fetch("/api/insights", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "dismiss" }),
    }).catch(() => {});
  };

  const handleActedOn = async (id: string) => {
    setInsights((prev) =>
      prev?.map((i) => (i.id === id ? { ...i, actedOn: true } : i)) || null
    );
    await fetch("/api/insights", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "acted" }),
    }).catch(() => {});
  };

  if (loading) {
    return (
      <section className="premium-panel">
        <div className="flex items-center gap-2 mb-3">
          <div className="skeleton h-5 w-5 rounded-full" />
          <div className="skeleton h-4 w-24" />
        </div>
        <div className="space-y-3">
          <div className="skeleton h-16 w-full rounded-lg" />
          <div className="skeleton h-16 w-full rounded-lg" />
        </div>
      </section>
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <section className="premium-panel">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🤖</span>
          <h2 className="text-sm font-semibold text-[var(--text)]">Your Assistant</h2>
        </div>
        <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
          Not enough data yet. I need a few days of logs — sleep, habits, glucose, or transactions — to give you meaningful insights. The more you track, the smarter I get.
        </p>
      </section>
    );
  }

  const urgencyColors = {
    high: "border-l-[var(--rose)]",
    medium: "border-l-[var(--amber)]",
    low: "border-l-[var(--sky)]",
  };

  const urgencyGlow = {
    high: "shadow-[inset_2px_0_12px_rgba(211,47,47,0.05)]",
    medium: "shadow-[inset_2px_0_12px_rgba(196,130,0,0.04)]",
    low: "shadow-[inset_2px_0_12px_rgba(2,119,189,0.04)]",
  };

  return (
    <section className="premium-panel overflow-hidden bg-white/40">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--text)] text-[var(--bg)] shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.364-6.364l-.707-.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M12 21V5a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-[var(--text)]">Private Assistant</h2>
          <p className="text-[9px] font-medium uppercase tracking-[0.1em] text-[var(--text-tertiary)]">{insights.length} active intelligence points</p>
        </div>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {insights.map((insight, i) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 10 }}
              animate={visible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className={`relative block rounded-[24px] border border-transparent bg-white/60 p-6 transition-all hover:bg-white hover:shadow-xl ${insight.actedOn ? "opacity-40" : ""}`}
              >
                <div className="flex items-start gap-5">
                  <div className={`mt-1 flex h-2 w-2 rounded-full shrink-0 ${urgencyColors[insight.urgency].replace('border-l-', 'bg-')}`} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-serif text-[var(--text)] leading-tight">
                      {insight.headline}
                    </div>
                    <p className="text-[12px] text-[var(--text-secondary)] mt-2 leading-relaxed line-clamp-2">
                      {insight.body}
                    </p>
                    <div className="flex items-center gap-4 mt-4">
                      {insight.href && (
                        <Link
                          href={insight.href}
                          className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)] hover:text-[var(--accent-hover)]"
                          onClick={() => handleActedOn(insight.id)}
                        >
                          Address →
                        </Link>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDismiss(insight.id); }}
                        className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] ml-auto"
                      >
                        Acknowledge
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <p className="mt-3 text-center text-[9px] text-[var(--text-tertiary)]">
        Insights based on your data · refreshed on each visit
      </p>
    </section>
  );
}
