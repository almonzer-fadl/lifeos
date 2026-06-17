import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subDays } from "date-fns";
import { centsToDollars } from "@/lib/money";

export async function GET(request: NextRequest) {
  try {
    const sevenDaysAgo = subDays(new Date(), 7);
    const thirtyDaysAgo = subDays(new Date(), 30);

    // Gather all relevant context
    const [
      habits,
      habitLogs,
      tasks,
      journalEntries,
      sleepSessions,
      glucoseReadings,
      transactions,
      accounts,
      bodyMeasurements,
      activities,
    ] = await Promise.all([
      db.habit.findMany({ include: { logs: { where: { date: { gte: sevenDaysAgo } } } } }),
      db.habitLog.findMany({ where: { date: { gte: sevenDaysAgo } }, include: { habit: true } }),
      db.task.findMany({ where: { status: { in: ["todo", "in_progress"] } }, include: { project: true }, take: 10 }),
      db.journalEntry.findMany({ where: { date: { gte: sevenDaysAgo } }, orderBy: { date: "desc" }, take: 5 }),
      db.sleepSession.findMany({ where: { startTime: { gte: sevenDaysAgo } }, orderBy: { startTime: "desc" }, take: 7 }),
      db.glucoseReading.findMany({ where: { timestamp: { gte: thirtyDaysAgo } }, orderBy: { timestamp: "desc" }, take: 100 }),
      db.transaction.findMany({ where: { date: { gte: thirtyDaysAgo } }, include: { category: true } }),
      db.account.findMany({ where: { isActive: true } }),
      db.bodyMeasurement.findMany({ orderBy: { date: "desc" }, take: 2 }),
      db.activity.findMany({ where: { startTime: { gte: thirtyDaysAgo } }, orderBy: { startTime: "desc" }, take: 20 }),
    ]);

    // Build context for AI
    const context = {
      habits: habits.map((h) => ({
        name: h.name,
        completed: h.logs.filter((l) => l.completed).length,
        total: h.logs.length,
        streak: h.logs.filter((l) => l.completed).length, // simplifed
      })),
      taskCount: tasks.length,
      tasks: tasks.slice(0, 5).map((t) => ({ title: t.title, priority: t.priority, project: t.project?.name })),
      sleep: sleepSessions.map((s) => ({
        hours: (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 3600000,
        quality: s.quality,
      })),
      avgSleep: sleepSessions.length > 0
        ? (sleepSessions.reduce((sum, s) => sum + (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 3600000, 0) / sleepSessions.length).toFixed(1)
        : null,
      glucose: glucoseReadings.length > 0 ? {
        latest: glucoseReadings[0].value,
        highCount: glucoseReadings.filter((r) => r.value > 180).length,
        lowCount: glucoseReadings.filter((r) => r.value < 70).length,
      } : null,
      finance: {
        cashBalance: accounts.filter((a) => !a.isDebt).reduce((s, a) => s + a.initialBalance, 0),
        income30d: transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
        expenses30d: transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
      },
      bodyWeight: bodyMeasurements[0]?.weight || null,
      recentActivities: activities.slice(0, 5).map((a) => ({
        type: a.type,
        distance: a.distance,
        duration: a.endTime ? (new Date(a.endTime).getTime() - new Date(a.startTime).getTime()) / 60000 : null,
      })),
      journalMoods: journalEntries.map((j) => ({ date: j.date.toISOString().slice(0, 10), mood: j.mood })),
    };

    return NextResponse.json({ context });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
