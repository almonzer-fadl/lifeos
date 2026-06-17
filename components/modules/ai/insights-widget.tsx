"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { formatCents } from "@/lib/money";

interface AIContext {
  habits: { name: string; completed: number; total: number }[];
  taskCount: number;
  tasks: { title: string; priority: string; project?: string | null }[];
  sleep: { hours: number; quality: number | null }[];
  avgSleep: string | null;
  glucose: { latest: number; highCount: number; lowCount: number } | null;
  finance: { income30d: number; expenses30d: number };
  bodyWeight: number | null;
  recentActivities: { type: string; distance: number | null; duration: number | null }[];
  journalMoods: { date: string; mood: string | null }[];
}

function generateInsights(ctx: AIContext): { icon: string; headline: string; body: string; href: string; urgency: "high" | "medium" | "low" }[] {
  const insights: { icon: string; headline: string; body: string; href: string; urgency: "high" | "medium" | "low" }[] = [];

  // Sleep — most critical health metric
  const avgHrs = ctx.avgSleep ? parseFloat(ctx.avgSleep) : null;
  if (avgHrs !== null && avgHrs < 6.5) {
    insights.push({
      icon: "😴",
      headline: `You're running on ${avgHrs.toFixed(1)}h sleep`,
      body: "Sleep debt compounds. Even one night of proper rest rebuilds testosterone, clears brain fog, and stabilizes glucose. Block 7.5h tonight — non-negotiable.",
      href: "/sleep",
      urgency: "high",
    });
  } else if (avgHrs !== null && avgHrs >= 7) {
    insights.push({
      icon: "✅",
      headline: `Solid ${avgHrs.toFixed(1)}h average this week`,
      body: "Your recovery base is strong. This is the foundation everything else sits on — glucose stability, cognitive performance, immune function. Keep protecting it.",
      href: "/sleep",
      urgency: "low",
    });
  }

  // Glucose — T1D specific
  if (ctx.glucose) {
    const { latest, highCount, lowCount } = ctx.glucose;
    if (highCount > 8) {
      insights.push({
        icon: "📈",
        headline: `${highCount} highs in 30 days`,
        body: "Frequent highs suggest basal might need adjustment or carb ratios are off. Each high is cumulative damage to small blood vessels. Review your recent trends and consider a correction factor tweak.",
        href: "/t1d",
        urgency: "high",
      });
    } else if (lowCount > 3) {
      insights.push({
        icon: "⚠️",
        headline: `${lowCount} lows — dangerous territory`,
        body: "Hypos are immediately dangerous. Keep fast-acting carbs within arm's reach at all times. If these are nocturnal lows, you might be over-bolusing at dinner.",
        href: "/t1d",
        urgency: "high",
      });
    } else if (latest !== null) {
      const status = latest < 70 ? "low" : latest > 180 ? "high" : "in-range";
      if (status === "in-range") {
        insights.push({
          icon: "🩸",
          headline: `Latest reading: ${latest} mg/dL — in range`,
          body: "Nice. Tight control is the single biggest lever for long-term health outcomes with T1D. Keep logging to build reliable trend data.",
          href: "/t1d",
          urgency: "low",
        });
      }
    }
  }

  // Habits — the discipline engine
  const totalCompletions = ctx.habits.reduce((s, h) => s + h.completed, 0);
  const totalPossible = ctx.habits.reduce((s, h) => s + h.total, 0);
  if (ctx.habits.length > 0 && totalPossible > 0) {
    const rate = (totalCompletions / totalPossible) * 100;
    if (rate >= 90) {
      insights.push({
        icon: "🔥",
        headline: `${rate.toFixed(0)}% habit completion — elite consistency`,
        body: "This is top-decile discipline. The systems are working. Now's the time to add one more habit — momentum is on your side.",
        href: "/habits",
        urgency: "low",
      });
    } else if (rate < 40) {
      insights.push({
        icon: "🎯",
        headline: `${rate.toFixed(0)}% — the system needs a reset`,
        body: "Don't try to fix everything at once. Pick ONE habit, make it so easy you can't fail (2 minute version), and rebuild from there. Consistency > intensity.",
        href: "/habits",
        urgency: "medium",
      });
    }
  } else if (ctx.habits.length === 0) {
    insights.push({
      icon: "🌱",
      headline: "No habits tracked yet",
      body: "Start with one tiny habit — something you already do. Track it for a week. The streak alone becomes motivating. I recommend starting with sleep tracking.",
      href: "/habits",
      urgency: "medium",
    });
  }

  // Finance
  const net = ctx.finance.income30d - ctx.finance.expenses30d;
  if (net < 0) {
    insights.push({
      icon: "💸",
      headline: `Down $${formatCents(Math.abs(net))} this month`,
      body: "You're spending more than you're earning. This is fine occasionally but chronic deficits compound. Identify your top 3 spending categories and set budgets for next month.",
      href: "/finance",
      urgency: "high",
    });
  } else if (net > 0) {
    insights.push({
      icon: "💰",
      headline: `+$${formatCents(net)} cashflow this month`,
      body: "Positive cashflow means you're building runway. Consider allocating a percentage to investments, debt reduction, or your emergency fund before lifestyle creep sets in.",
      href: "/finance",
      urgency: "low",
    });
  }

  // Tasks
  const urgentTasks = ctx.tasks.filter(t => t.priority === "urgent" || t.priority === "high");
  if (urgentTasks.length > 2) {
    insights.push({
      icon: "🚨",
      headline: `${urgentTasks.length} high-priority tasks waiting`,
      body: `Top of the list: "${urgentTasks[0]?.title}". Clear the urgent items first. If something&apos;s been urgent for more than 3 days, it might not actually be urgent — re-prioritize.`,
      href: "/tasks",
      urgency: "high",
    });
  } else if (ctx.taskCount === 0) {
    insights.push({
      icon: "✨",
      headline: "Zero tasks — clear plate",
      body: "Enjoy the mental clarity. When you're ready to plan, capture everything in a brain dump first, then triage by impact.",
      href: "/tasks",
      urgency: "low",
    });
  }

  // Activity
  if (ctx.recentActivities.length > 0) {
    insights.push({
      icon: "🏃",
      headline: `${ctx.recentActivities.length} activities logged`,
      body: "Movement is medicine for T1D — it improves insulin sensitivity for 24-48h. Even a 15 minute walk after meals makes a measurable difference in glucose response.",
      href: "/activity",
      urgency: "low",
    });
  } else {
    insights.push({
      icon: "🚶",
      headline: "No recent activity logged",
      body: "For T1D management, even light movement is powerful. A 10-minute post-meal walk can reduce postprandial glucose by 20-30 mg/dL. Start small.",
      href: "/activity",
      urgency: "medium",
    });
  }

  return insights;
}

export function AIDashboardWidget() {
  const [context, setContext] = useState<AIContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetch("/api/ai/context")
      .then(r => r.json())
      .then(d => {
        setContext(d.context);
        setLoading(false);
        setTimeout(() => setVisible(true), 100);
      })
      .catch(() => setLoading(false));
  }, []);

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

  if (!context) {
    return (
      <section className="premium-panel">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🤖</span>
          <h2 className="text-sm font-semibold text-[var(--text)]">Your Assistant</h2>
        </div>
        <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
          I analyze your data across sleep, glucose, habits, finance, and tasks. Start logging in any module and I'll give you personalized, data-driven insights — in my own voice.
        </p>
      </section>
    );
  }

  const insights = generateInsights(context);

  if (insights.length === 0) {
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
              key={insight.headline}
              initial={{ opacity: 0, x: -12, height: 0 }}
              animate={visible ? { opacity: 1, x: 0, height: "auto" } : {}}
              transition={{ delay: i * 0.08, duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <Link
                href={insight.href}
                className={`block rounded-lg border border-[var(--border-light)] bg-[var(--surface-raised)] p-3.5 border-l-2 ${urgencyColors[insight.urgency]} ${urgencyGlow[insight.urgency]} transition-all hover:border-[var(--border)] hover:bg-[var(--surface-hover)] hover:translate-x-[2px]`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-base shrink-0 mt-0.5">{insight.icon}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[var(--text)] leading-snug">
                      {insight.headline}
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-1 leading-relaxed line-clamp-3">
                      {insight.body}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <p className="mt-3 text-center text-[9px] text-[var(--text-tertiary)]">
        Insights based on your data · updated on each visit
      </p>
    </section>
  );
}
