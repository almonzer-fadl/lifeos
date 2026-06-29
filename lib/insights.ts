import { db } from "@/lib/db";
import { events, EventTypes } from "@/lib/events";
import { formatCents } from "@/lib/money";

let notificationBridgeStarted = false;

// ─── Types ────────────────────────────────────────────────────

export interface InsightContext {
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

export interface RawInsight {
  type: string;
  urgency: "high" | "medium" | "low";
  headline: string;
  body: string;
  href: string;
  icon: string;
}

// ─── Rule Engine ──────────────────────────────────────────────

export function generateRawInsights(ctx: InsightContext): RawInsight[] {
  const insights: RawInsight[] = [];

  // ── Sleep ────────────────────────────────────────────────
  const avgHrs = ctx.avgSleep ? parseFloat(ctx.avgSleep) : null;
  if (avgHrs !== null && avgHrs < 6.5) {
    insights.push({
      type: "sleep", urgency: "high",
      icon: "😴",
      headline: `You're running on ${avgHrs.toFixed(1)}h sleep`,
      body: "Sleep debt compounds. Even one night of proper rest rebuilds testosterone, clears brain fog, and stabilizes glucose. Block 7.5h tonight — non-negotiable.",
      href: "/sleep",
    });
  } else if (avgHrs !== null && avgHrs >= 7) {
    insights.push({
      type: "sleep", urgency: "low",
      icon: "✅",
      headline: `Solid ${avgHrs.toFixed(1)}h average this week`,
      body: "Your recovery base is strong. This is the foundation everything else sits on — glucose stability, cognitive performance, immune function. Keep protecting it.",
      href: "/sleep",
    });
  }

  // ── Glucose ──────────────────────────────────────────────
  if (ctx.glucose) {
    const { latest, highCount, lowCount } = ctx.glucose;
    if (highCount > 8) {
      insights.push({
        type: "glucose", urgency: "high",
        icon: "📈",
        headline: `${highCount} highs in 30 days`,
        body: "Frequent highs suggest basal might need adjustment or carb ratios are off. Each high is cumulative damage to small blood vessels. Review your recent trends and consider a correction factor tweak.",
        href: "/t1d",
      });
    }
    if (lowCount > 3) {
      insights.push({
        type: "glucose", urgency: "high",
        icon: "⚠️",
        headline: `${lowCount} lows — dangerous territory`,
        body: "Hypos are immediately dangerous. Keep fast-acting carbs within arm's reach at all times. If these are nocturnal lows, you might be over-bolusing at dinner.",
        href: "/t1d",
      });
    }
    if (latest !== null && latest >= 70 && latest <= 180) {
      if (highCount <= 8 && lowCount <= 3) {
        insights.push({
          type: "glucose", urgency: "low",
          icon: "🩸",
          headline: `Latest reading: ${latest} mg/dL — in range`,
          body: "Nice. Tight control is the single biggest lever for long-term health outcomes with T1D. Keep logging to build reliable trend data.",
          href: "/t1d",
        });
      }
    }
  }

  // ── Habits ───────────────────────────────────────────────
  const totalCompletions = ctx.habits.reduce((s, h) => s + h.completed, 0);
  const totalPossible = ctx.habits.reduce((s, h) => s + h.total, 0);
  if (ctx.habits.length > 0 && totalPossible > 0) {
    const rate = (totalCompletions / totalPossible) * 100;
    if (rate >= 90) {
      insights.push({
        type: "habit", urgency: "low",
        icon: "🔥",
        headline: `${rate.toFixed(0)}% habit completion — elite consistency`,
        body: "This is top-decile discipline. The systems are working. Now's the time to add one more habit — momentum is on your side.",
        href: "/habits",
      });
    } else if (rate < 40) {
      insights.push({
        type: "habit", urgency: "medium",
        icon: "🎯",
        headline: `${rate.toFixed(0)}% — the system needs a reset`,
        body: "Don't try to fix everything at once. Pick ONE habit, make it so easy you can't fail (2 minute version), and rebuild from there. Consistency > intensity.",
        href: "/habits",
      });
    }
  } else if (ctx.habits.length === 0) {
    insights.push({
      type: "habit", urgency: "medium",
      icon: "🌱",
      headline: "No habits tracked yet",
      body: "Start with one tiny habit — something you already do. Track it for a week. The streak alone becomes motivating. I recommend starting with sleep tracking.",
      href: "/habits",
    });
  }

  // ── Finance ──────────────────────────────────────────────
  const net = ctx.finance.income30d - ctx.finance.expenses30d;
  if (net < 0) {
    insights.push({
      type: "finance", urgency: "high",
      icon: "💸",
      headline: `Down $${formatCents(Math.abs(net))} this month`,
      body: "You're spending more than you're earning. This is fine occasionally but chronic deficits compound. Identify your top 3 spending categories and set budgets for next month.",
      href: "/finance",
    });
  } else if (net > 0) {
    insights.push({
      type: "finance", urgency: "low",
      icon: "💰",
      headline: `+$${formatCents(net)} cashflow this month`,
      body: "Positive cashflow means you're building runway. Consider allocating a percentage to investments, debt reduction, or your emergency fund before lifestyle creep sets in.",
      href: "/finance",
    });
  }

  // ── Tasks ────────────────────────────────────────────────
  const urgentTasks = ctx.tasks.filter(
    (t) => t.priority === "urgent" || t.priority === "high"
  );
  if (urgentTasks.length > 2) {
    insights.push({
      type: "task", urgency: "high",
      icon: "🚨",
      headline: `${urgentTasks.length} high-priority tasks waiting`,
      body: `Top of the list: "${urgentTasks[0]?.title}". Clear the urgent items first. If something's been urgent for more than 3 days, it might not actually be urgent — re-prioritize.`,
      href: "/tasks",
    });
  } else if (ctx.taskCount === 0) {
    insights.push({
      type: "task", urgency: "low",
      icon: "✨",
      headline: "Zero tasks — clear plate",
      body: "Enjoy the mental clarity. When you're ready to plan, capture everything in a brain dump first, then triage by impact.",
      href: "/tasks",
    });
  }

  // ── Activity ─────────────────────────────────────────────
  if (ctx.recentActivities.length > 0) {
    insights.push({
      type: "activity", urgency: "low",
      icon: "🏃",
      headline: `${ctx.recentActivities.length} activities logged recently`,
      body: "Movement is medicine for T1D — it improves insulin sensitivity for 24-48h. Even a 15 minute walk after meals makes a measurable difference in glucose response.",
      href: "/activity",
    });
  } else {
    insights.push({
      type: "activity", urgency: "medium",
      icon: "🚶",
      headline: "No recent activity logged",
      body: "For T1D management, even light movement is powerful. A 10-minute post-meal walk can reduce postprandial glucose by 20-30 mg/dL. Start small.",
      href: "/activity",
    });
  }

  return insights;
}

// ─── Persistence ──────────────────────────────────────────────

const HEADLINE_DEDUP_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function persistInsights(
  raw: RawInsight[],
  ctx: InsightContext
): Promise<number> {
  // Start the notification bridge once (lazy init to avoid circular import)
  if (!notificationBridgeStarted) {
    const { startInsightNotificationBridge } = await import("@/lib/notifications");
    startInsightNotificationBridge();
    notificationBridgeStarted = true;
  }

  let created = 0;

  for (const r of raw) {
    // Avoid duplicate: same headline within 24 hours
    const existing = await db.insight.findFirst({
      where: {
        headline: r.headline,
        createdAt: { gte: new Date(Date.now() - HEADLINE_DEDUP_WINDOW_MS) },
      },
    });
    if (existing) continue;

    // Set expiry: low urgency = 7 days, medium = 14 days, high = 30 days
    const expiresMs: Record<string, number> = {
      low: 7 * 24 * 60 * 60 * 1000,
      medium: 14 * 24 * 60 * 60 * 1000,
      high: 30 * 24 * 60 * 60 * 1000,
    };

    const insight = await db.insight.create({
      data: {
        type: r.type,
        urgency: r.urgency,
        headline: r.headline,
        body: r.body,
        href: r.href,
        icon: r.icon,
        sourceData: JSON.parse(JSON.stringify(ctx)),
        expiresAt: new Date(Date.now() + (expiresMs[r.urgency] || expiresMs.medium)),
      },
    });

    await events.emit(EventTypes.INSIGHT_GENERATED, {
      id: insight.id,
      type: insight.type,
      urgency: insight.urgency,
      headline: insight.headline,
    });

    created++;
  }

  return created;
}

// ─── Full Pipeline ────────────────────────────────────────────

export async function runInsightPipeline(ctx: InsightContext): Promise<{
  raw: RawInsight[];
  persisted: number;
}> {
  const raw = generateRawInsights(ctx);
  const persisted = await persistInsights(raw, ctx);
  return { raw, persisted };
}

// ─── Queries ──────────────────────────────────────────────────

export async function getActiveInsights(limit = 10) {
  return db.insight.findMany({
    where: {
      dismissed: false,
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: new Date() } },
      ],
    },
    orderBy: [
      { urgency: "asc" }, // high first (h < m < l alphabetically works)
      { createdAt: "desc" },
    ],
    take: limit,
  });
}

export async function dismissInsight(id: string) {
  return db.insight.update({
    where: { id },
    data: { dismissed: true },
  });
}

export async function markInsightActedOn(id: string) {
  return db.insight.update({
    where: { id },
    data: { actedOn: true },
  });
}

export async function cleanupExpiredInsights() {
  const { count } = await db.insight.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });
  return count;
}
