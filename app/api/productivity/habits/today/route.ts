import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const [habits, todayLogs, todaySessions] = await Promise.all([
    db.habit.findMany({
      orderBy: [{ isNonNegotiable: "desc" }, { createdAt: "asc" }],
      include: { streak: true },
    }),
    db.habitLog.findMany({
      where: {
        date: { gte: todayStart, lt: todayEnd },
      },
      select: { habitId: true, completed: true, completedAt: true, value: true, timeOfDay: true },
    }),
    db.habitSession.findMany({
      where: {
        date: { gte: todayStart, lt: todayEnd },
      },
      select: { habitId: true, completedAt: true, value: true, timeOfDay: true },
    }),
  ]);

  const todayHabits = habits.map((h) => {
    const logs = todayLogs.filter((l) => l.habitId === h.id && l.completed);
    const sessions = todaySessions.filter((s) => s.habitId === h.id);
    const completions = logs.length + sessions.length;
    const isCompleted = h.targetCount > 0 ? completions >= h.targetCount : completions > 0;
    const totalValue = [...logs, ...sessions].reduce((s, l) => s + (l.value || 0), 0);

    return {
      habitId: h.id,
      habitName: h.name,
      frequency: h.frequency,
      targetCount: h.targetCount,
      targetValue: h.targetValue || null,
      targetUnit: h.targetUnit || null,
      isNonNegotiable: h.isNonNegotiable,
      timeOfDay: h.timeOfDay,
      color: h.color,
      completed: isCompleted,
      completions,
      totalValue,
      currentStreak: h.streak?.currentStreak || 0,
      sessions: sessions.map((s) => ({
        id: s.habitId,
        completedAt: s.completedAt,
        value: s.value,
        timeOfDay: s.timeOfDay,
      })),
    };
  });

  const nonNegotiables = todayHabits.filter((h) => h.isNonNegotiable);
  const regular = todayHabits.filter((h) => !h.isNonNegotiable);
  const completedCount = todayHabits.filter((h) => h.completed).length;
  const totalCount = todayHabits.length;

  return NextResponse.json({
    nonNegotiables,
    regular,
    completedCount,
    totalCount,
    isPerfectDay: completedCount === totalCount && totalCount > 0,
  });
}
