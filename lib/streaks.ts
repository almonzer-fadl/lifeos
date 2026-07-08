import { db } from "@/lib/db";
import { events, EventTypes } from "@/lib/events";

export interface StreakData {
  habitId: string;
  habitName: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedAt: Date | null;
  frequency: string;
  color: string | null;
}

export async function recalculateStreak(habitId: string) {
  const habit = await db.habit.findUnique({ where: { id: habitId } });
  if (!habit) return null;

  const logs = await db.habitLog.findMany({
    where: { habitId, completed: true },
    orderBy: { date: "desc" },
    select: { date: true },
  });

  // Deduplicate by date (YYYY-MM-DD)
  const seen = new Set<string>();
  const uniqueDates: Date[] = [];
  for (const log of logs) {
    const key = log.date.toISOString().slice(0, 10);
    if (!seen.has(key)) {
      seen.add(key);
      uniqueDates.push(log.date);
    }
  }

  let streak = 0;
  if (uniqueDates.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if yesterday or today is the most recent completion
    const lastDate = new Date(uniqueDates[0]);
    lastDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 1 && habit.frequency === "daily") {
      // Streak broken if more than 1 day gap for daily habits
    } else {
      for (let i = 0; i < uniqueDates.length; i++) {
        const expectedDate = new Date(today);
        expectedDate.setDate(expectedDate.getDate() - i);
        expectedDate.setHours(0, 0, 0, 0);

        const logDate = new Date(uniqueDates[i]);
        logDate.setHours(0, 0, 0, 0);

        if (logDate.getTime() === expectedDate.getTime()) {
          streak++;
        } else if (logDate.getTime() < expectedDate.getTime()) {
          // For weekly habits, allow a 1-day buffer
          if (habit.frequency === "weekly") {
            const weekDiff = Math.floor(
              (expectedDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            if (weekDiff <= 1) {
              streak++;
              continue;
            }
          }
          break;
        }
      }
    }
  }

  const existing = await db.habitStreak.findUnique({ where: { habitId } });
  const longestStreak = Math.max(streak, existing?.longestStreak || 0);
  const previousStreak = existing?.currentStreak || 0;

  const updated = await db.habitStreak.upsert({
    where: { habitId },
    create: {
      habitId,
      currentStreak: streak,
      longestStreak: longestStreak,
      lastCompletedAt: uniqueDates[0] || null,
    },
    update: {
      currentStreak: streak,
      longestStreak: longestStreak,
      lastCompletedAt: uniqueDates[0] || null,
    },
  });

  // Emit streak milestone events
  if (streak > previousStreak && [7, 14, 30, 60, 90, 180, 365].includes(streak)) {
    events
      .emit(EventTypes.HABIT_STREAK_MILESTONE, {
        habitId,
        habitName: habit.name,
        streak,
      })
      .catch(() => {});
  }

  return updated;
}

export async function getAllStreaks(): Promise<StreakData[]> {
  const habits = await db.habit.findMany({
    where: { streakOn: true },
    include: { streak: true },
  });

  return habits
    .map((h) => ({
      habitId: h.id,
      habitName: h.name,
      currentStreak: h.streak?.currentStreak || 0,
      longestStreak: h.streak?.longestStreak || 0,
      lastCompletedAt: h.streak?.lastCompletedAt || null,
      frequency: h.frequency,
      color: h.color,
    }))
    .sort((a, b) => b.currentStreak - a.currentStreak);
}

export function isStreakMilestone(streak: number): boolean {
  return [7, 14, 21, 30, 50, 60, 90, 100, 180, 365].includes(streak);
}
