import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const [totalEntries, thisWeek, streak] = await Promise.all([
    db.journalEntry.count(),
    db.journalEntry.count({
      where: {
        date: { gte: new Date(new Date().setDate(new Date().getDate() - 7)) },
      },
    }),
    db.journalEntry.findMany({
      where: { mood: { not: null } },
      orderBy: { date: "desc" },
      select: { date: true, mood: true },
      take: 60,
    }),
  ]);

  // Calculate writing streak
  const seen = new Set<string>();
  for (const e of streak) {
    seen.add(e.date.toISOString().slice(0, 10));
  }

  let writingStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (seen.has(key)) {
      writingStreak++;
    } else if (i > 0) {
      break;
    }
  }

  // Mood trend (last 14 days)
  const moodTrend: { date: string; mood: string | null }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const entry = streak.find((e) => e.date.toISOString().slice(0, 10) === key);
    moodTrend.push({
      date: key,
      mood: entry?.mood || null,
    });
  }

  return NextResponse.json({
    totalEntries,
    thisWeek,
    writingStreak,
    moodTrend,
  });
}
