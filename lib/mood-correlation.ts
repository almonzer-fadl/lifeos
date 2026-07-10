import { db } from "@/lib/db";

const MOOD_SCORES: Record<string, number> = {
  great: 5,
  good: 4,
  okay: 3,
  bad: 2,
  terrible: 1,
};

export async function getMoodCorrelations(days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [entries, habitLogs, sleepSessions, glucoseReadings] = await Promise.all([
    db.journalEntry.findMany({
      where: { date: { gte: since }, mood: { not: null } },
      select: { date: true, mood: true },
    }),
    db.habitLog.findMany({
      where: { date: { gte: since }, completed: true },
      select: { date: true, habitId: true },
    }),
    db.sleepSession.findMany({
      where: { startTime: { gte: since } },
      select: { startTime: true, endTime: true },
    }),
    db.glucoseReading.findMany({
      where: { timestamp: { gte: since } },
      select: { timestamp: true, value: true },
    }),
  ]);

  // Build mood by date
  const moodByDate = new Map<string, number>();
  for (const e of entries) {
    const dateKey = e.date.toISOString().slice(0, 10);
    const score = MOOD_SCORES[e.mood!] || 3;
    const existing = moodByDate.get(dateKey);
    if (existing !== undefined) {
      moodByDate.set(dateKey, (existing + score) / 2);
    } else {
      moodByDate.set(dateKey, score);
    }
  }

  // Gym days
  const gymHabits = await db.habit.findMany({
    where: { name: { contains: "Gym", mode: "insensitive" } },
    select: { id: true },
  });
  const gymHabitIds = new Set(gymHabits.map((h) => h.id));

  const gymDaysSet = new Set<string>();
  for (const h of habitLogs) {
    if (gymHabitIds.has(h.habitId)) {
      gymDaysSet.add(h.date.toISOString().slice(0, 10));
    }
  }

  let gymMoodTotal = 0;
  let gymMoodCount = 0;
  let restMoodTotal = 0;
  let restMoodCount = 0;

  for (const [date, mood] of moodByDate) {
    if (gymDaysSet.has(date)) {
      gymMoodTotal += mood;
      gymMoodCount++;
    } else {
      restMoodTotal += mood;
      restMoodCount++;
    }
  }

  // Sleep impact
  const sleepByDate = new Map<string, number>();
  for (const s of sleepSessions) {
    const dateKey = s.startTime.toISOString().slice(0, 10);
    const hours =
      (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / (1000 * 60 * 60);
    const existing = sleepByDate.get(dateKey);
    if (existing !== undefined) {
      sleepByDate.set(dateKey, Math.max(existing, hours));
    } else {
      sleepByDate.set(dateKey, hours);
    }
  }

  let goodSleepMoodTotal = 0;
  let goodSleepMoodCount = 0;
  let poorSleepMoodTotal = 0;
  let poorSleepMoodCount = 0;

  for (const [date, mood] of moodByDate) {
    const hours = sleepByDate.get(date);
    if (hours !== undefined) {
      if (hours >= 7) {
        goodSleepMoodTotal += mood;
        goodSleepMoodCount++;
      } else {
        poorSleepMoodTotal += mood;
        poorSleepMoodCount++;
      }
    }
  }

  return {
    gymImpact: {
      gymDays: gymMoodCount,
      restDays: restMoodCount,
      gymMood: gymMoodCount > 0 ? Math.round((gymMoodTotal / gymMoodCount) * 10) / 10 : 0,
      restMood: restMoodCount > 0 ? Math.round((restMoodTotal / restMoodCount) * 10) / 10 : 0,
    },
    sleepImpact: {
      goodSleepMood:
        goodSleepMoodCount > 0
          ? Math.round((goodSleepMoodTotal / goodSleepMoodCount) * 10) / 10
          : 0,
      poorSleepMood:
        poorSleepMoodCount > 0
          ? Math.round((poorSleepMoodTotal / poorSleepMoodCount) * 10) / 10
          : 0,
    },
    totalEntries: entries.length,
    avgMood:
      moodByDate.size > 0
        ? Math.round(
            (Array.from(moodByDate.values()).reduce((a, b) => a + b, 0) / moodByDate.size) * 10
          ) / 10
        : 0,
  };
}
