import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAllStreaks } from "@/lib/streaks";
import { startOfWeek, endOfWeek } from "date-fns";

export async function GET() {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 0 });

  const [habits, streaks, weeklyLogs, todayLogs] = await Promise.all([
    db.habit.findMany({
      where: { isNonNegotiable: false },
      orderBy: { createdAt: "asc" },
      include: {
        streak: true,
        logs: {
          where: {
            date: { gte: weekStart, lte: weekEnd },
            completed: true,
          },
          select: { date: true, value: true },
        },
      },
    }),
    getAllStreaks(),
    db.habitLog.count({
      where: {
        completed: true,
        date: { gte: weekStart, lte: weekEnd },
      },
    }),
    db.habitLog.findMany({
      where: {
        date: {
          gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        },
        completed: true,
      },
      select: { habitId: true },
    }),
  ]);

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayCompleted = new Set(todayLogs.map((l) => l.habitId).filter((id, i, arr) => arr.indexOf(id) === i));

  const habitStats = habits.map((h) => {
    const weeklyCompletions = h.logs.length;
    const targetForWeek = h.targetCount * 7; // weekly target
    const weekProgress = targetForWeek > 0 ? Math.min(weeklyCompletions / targetForWeek, 1) : 0;
    const totalValue = h.logs.reduce((s, l) => s + (l.value || 0), 0);

    return {
      habitId: h.id,
      habitName: h.name,
      frequency: h.frequency,
      targetCount: h.targetCount,
      targetValue: h.targetValue,
      targetUnit: h.targetUnit,
      completedToday: todayCompleted.has(h.id),
      weeklyCompletions,
      weeklyTarget: targetForWeek,
      weekProgress: Math.round(weekProgress * 100),
      totalValueThisWeek: totalValue,
      currentStreak: h.streak?.currentStreak || 0,
      longestStreak: h.streak?.longestStreak || 0,
    };
  });

  return NextResponse.json({
    weeklyTotal: weeklyLogs,
    streakLeaders: streaks.filter((s) => s.currentStreak > 0).slice(0, 5),
    habits: habitStats,
  });
}
