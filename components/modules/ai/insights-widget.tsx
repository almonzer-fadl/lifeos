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
      .then((data: Insight[]) => {
        setInsights(data);
        setLoading(false);
        setTimeout(() => setVisible(true), 100);
      })
      .catch(() => setLoading(false));
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
    high: "shadow-[inset_2px_0_8px_rgba(232,84,96,0.15)]",
    medium: "shadow-[inset_2px_0_8px_rgba(212,149,42,0.12)]",
    low: "shadow-[inset_2px_0_8px_rgba(104,157,200,0.1)]",
  };

  return (
    <section className="premium-panel overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        <motion.span
          className="text-lg"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
        >
          🤖
        </motion.span>
        <h2 className="text-sm font-semibold text-[var(--text)]">Your Assistant</h2>
        <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
          {insights.length} insights
        </span>
      </div>

      <div className="space-y-1.5">
        <AnimatePresence>
          {insights.map((insight, i) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -12, height: 0 }}
              animate={visible ? { opacity: 1, x: 0, height: "auto" } : {}}
              transition={{ delay: i * 0.08, duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div
                className={`relative block rounded-lg border border-[var(--border-light)] bg-[var(--surface-raised)] p-3.5 border-l-2 ${urgencyColors[insight.urgency]} ${urgencyGlow[insight.urgency]} transition-all hover:border-[var(--border)] hover:bg-[var(--surface-hover)] hover:translate-x-[2px] ${insight.actedOn ? "opacity-60" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-base shrink-0 mt-0.5">{insight.icon || "💡"}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-[var(--text)] leading-snug">
                      {insight.headline}
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-1 leading-relaxed line-clamp-3">
                      {insight.body}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {insight.href && (
                        <Link
                          href={insight.href}
                          className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--accent)] hover:text-[var(--accent-hover)]"
                          onClick={() => handleActedOn(insight.id)}
                        >
                          Take Action →
                        </Link>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDismiss(insight.id); }}
                        className="text-[10px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] ml-auto"
                      >
                        Dismiss
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
