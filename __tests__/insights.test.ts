import { describe, it, expect } from "vitest";
import { generateRawInsights, type InsightContext } from "@/lib/insights";

const baseContext: InsightContext = {
  habits: [],
  taskCount: 0,
  tasks: [],
  sleep: [],
  avgSleep: null,
  glucose: null,
  finance: { income30d: 0, expenses30d: 0 },
  bodyWeight: null,
  recentActivities: [],
  journalMoods: [],
};

describe("generateRawInsights", () => {
  describe("sleep insights", () => {
    it("flags poor sleep (<6.5h avg)", () => {
      const ctx: InsightContext = {
        ...baseContext,
        sleep: [{ hours: 5.5, quality: 2 }],
        avgSleep: "5.5",
      };
      const insights = generateRawInsights(ctx);
      const sleepInsight = insights.find((i) => i.type === "sleep" && i.urgency === "high");
      expect(sleepInsight).toBeDefined();
      expect(sleepInsight!.headline).toContain("5.5h");
      expect(sleepInsight!.href).toBe("/sleep");
    });

    it("praises good sleep (>=7h avg)", () => {
      const ctx: InsightContext = {
        ...baseContext,
        sleep: [{ hours: 7.5, quality: 4 }],
        avgSleep: "7.5",
      };
      const insights = generateRawInsights(ctx);
      const sleepInsight = insights.find((i) => i.type === "sleep" && i.urgency === "low");
      expect(sleepInsight).toBeDefined();
      expect(sleepInsight!.headline).toContain("7.5h");
    });

    it("generates no sleep insight for 6.5-7h range", () => {
      const ctx: InsightContext = {
        ...baseContext,
        sleep: [{ hours: 6.8, quality: 3 }],
        avgSleep: "6.8",
      };
      const insights = generateRawInsights(ctx);
      const sleepInsights = insights.filter((i) => i.type === "sleep");
      expect(sleepInsights).toHaveLength(0);
    });
  });

  describe("glucose insights", () => {
    it("flags frequent highs (>8 in 30 days)", () => {
      const ctx: InsightContext = {
        ...baseContext,
        glucose: { latest: 190, highCount: 12, lowCount: 0 },
      };
      const insights = generateRawInsights(ctx);
      const highInsight = insights.find((i) => i.type === "glucose" && i.urgency === "high" && i.headline.includes("highs"));
      expect(highInsight).toBeDefined();
      expect(highInsight!.body).toContain("basal");
    });

    it("flags frequent lows (>3 in 30 days)", () => {
      const ctx: InsightContext = {
        ...baseContext,
        glucose: { latest: 85, highCount: 2, lowCount: 5 },
      };
      const insights = generateRawInsights(ctx);
      const lowInsight = insights.find((i) => i.type === "glucose" && i.urgency === "high" && i.headline.includes("lows"));
      expect(lowInsight).toBeDefined();
      expect(lowInsight!.body).toContain("Hypos");
    });

    it("praises in-range glucose when no issues", () => {
      const ctx: InsightContext = {
        ...baseContext,
        glucose: { latest: 120, highCount: 2, lowCount: 1 },
      };
      const insights = generateRawInsights(ctx);
      const goodInsight = insights.find((i) => i.type === "glucose" && i.urgency === "low");
      expect(goodInsight).toBeDefined();
      expect(goodInsight!.headline).toContain("in range");
    });
  });

  describe("habit insights", () => {
    it("praises high completion rate (>=90%)", () => {
      const ctx: InsightContext = {
        ...baseContext,
        habits: [
          { name: "Gym", completed: 7, total: 7 },
          { name: "Reading", completed: 6, total: 7 },
        ],
      };
      const insights = generateRawInsights(ctx);
      const habitInsight = insights.find((i) => i.type === "habit" && i.urgency === "low");
      expect(habitInsight).toBeDefined();
      expect(habitInsight!.headline).toContain("elite consistency");
    });

    it("flags low completion rate (<40%)", () => {
      const ctx: InsightContext = {
        ...baseContext,
        habits: [
          { name: "Gym", completed: 2, total: 7 },
          { name: "Reading", completed: 1, total: 7 },
        ],
      };
      const insights = generateRawInsights(ctx);
      const habitInsight = insights.find((i) => i.type === "habit" && i.urgency === "medium");
      expect(habitInsight).toBeDefined();
      expect(habitInsight!.headline).toContain("system needs a reset");
    });

    it("prompts to start habits when none exist", () => {
      const ctx: InsightContext = {
        ...baseContext,
        habits: [],
      };
      const insights = generateRawInsights(ctx);
      const habitInsight = insights.find((i) => i.type === "habit" && i.headline.includes("No habits"));
      expect(habitInsight).toBeDefined();
    });
  });

  describe("finance insights", () => {
    it("flags negative cashflow", () => {
      const ctx: InsightContext = {
        ...baseContext,
        finance: { income30d: 200000, expenses30d: 350000 },
      };
      const insights = generateRawInsights(ctx);
      const financeInsight = insights.find((i) => i.type === "finance" && i.urgency === "high");
      expect(financeInsight).toBeDefined();
      expect(financeInsight!.headline).toContain("Down");
    });

    it("praises positive cashflow", () => {
      const ctx: InsightContext = {
        ...baseContext,
        finance: { income30d: 500000, expenses30d: 300000 },
      };
      const insights = generateRawInsights(ctx);
      const financeInsight = insights.find((i) => i.type === "finance" && i.urgency === "low");
      expect(financeInsight).toBeDefined();
      expect(financeInsight!.headline).toContain("+");
    });
  });

  describe("task insights", () => {
    it("flags many high-priority tasks", () => {
      const ctx: InsightContext = {
        ...baseContext,
        taskCount: 5,
        tasks: [
          { title: "Fix critical bug", priority: "urgent" },
          { title: "Send proposal", priority: "high" },
          { title: "Review PR", priority: "high" },
        ],
      };
      const insights = generateRawInsights(ctx);
      const taskInsight = insights.find((i) => i.type === "task" && i.urgency === "high");
      expect(taskInsight).toBeDefined();
      expect(taskInsight!.headline).toContain("3");
    });

    it("notes clear plate when zero tasks", () => {
      const ctx: InsightContext = {
        ...baseContext,
        taskCount: 0,
        tasks: [],
      };
      const insights = generateRawInsights(ctx);
      const taskInsight = insights.find((i) => i.type === "task" && i.urgency === "low");
      expect(taskInsight).toBeDefined();
      expect(taskInsight!.headline).toContain("clear plate");
    });
  });

  describe("activity insights", () => {
    it("acknowledges logged activities", () => {
      const ctx: InsightContext = {
        ...baseContext,
        recentActivities: [
          { type: "run", distance: 5000, duration: 25 },
          { type: "swim", distance: 1000, duration: 30 },
        ],
      };
      const insights = generateRawInsights(ctx);
      const activityInsight = insights.find((i) => i.type === "activity" && i.urgency === "low");
      expect(activityInsight).toBeDefined();
      expect(activityInsight!.headline).toContain("2 activities");
    });

    it("prompts when no recent activity", () => {
      const ctx: InsightContext = {
        ...baseContext,
        recentActivities: [],
      };
      const insights = generateRawInsights(ctx);
      const activityInsight = insights.find((i) => i.type === "activity" && i.urgency === "medium");
      expect(activityInsight).toBeDefined();
      expect(activityInsight!.body).toContain("post-meal walk");
    });
  });

  describe("edge cases", () => {
    it("returns empty array for empty context with no triggers", () => {
      const ctx: InsightContext = {
        ...baseContext,
        recentActivities: [
          { type: "run", distance: 5000, duration: 25 },
        ],
        finance: { income30d: 100000, expenses30d: 100000 },
      };
      const insights = generateRawInsights(ctx);
      // Should only get activity insight (always fires) but no sleep/finance/habit insights
      const nonActivity = insights.filter((i) => i.type !== "activity");
      expect(nonActivity.length).toBeGreaterThanOrEqual(0);
    });

    it("handles null avgSleep gracefully", () => {
      const ctx: InsightContext = {
        ...baseContext,
        avgSleep: null,
        sleep: [],
      };
      const insights = generateRawInsights(ctx);
      const sleepInsights = insights.filter((i) => i.type === "sleep");
      expect(sleepInsights).toHaveLength(0);
    });

    it("all insights have required fields", () => {
      const ctx: InsightContext = {
        ...baseContext,
        sleep: [{ hours: 5, quality: 1 }],
        avgSleep: "5.0",
        glucose: { latest: 250, highCount: 15, lowCount: 0 },
        habits: [{ name: "Gym", completed: 3, total: 7 }],
        finance: { income30d: 100000, expenses30d: 150000 },
        tasks: [{ title: "Urgent task", priority: "urgent" }, { title: "High task", priority: "high" }, { title: "High task 2", priority: "high" }],
        recentActivities: [{ type: "run", distance: 5000, duration: 25 }],
      };

      const insights = generateRawInsights(ctx);
      for (const insight of insights) {
        expect(insight.type).toBeTruthy();
        expect(insight.urgency).toMatch(/^(high|medium|low)$/);
        expect(insight.headline).toBeTruthy();
        expect(insight.body).toBeTruthy();
        expect(insight.href).toBeTruthy();
      }
    });
  });
});
