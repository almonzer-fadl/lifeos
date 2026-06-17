import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_request: NextRequest) {
  const progress = await db.quranProgress.findFirst({ include: { sessions: { orderBy: { date: "desc" } } } });
  if (!progress) return NextResponse.json({ pagesMemorized: 0, totalPages: 604 });

  const sessions = progress.sessions.filter((s) => s.type === "new_memorization");
  const thisWeek = sessions.filter((s) => {
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return new Date(s.date) >= weekAgo;
  });
  const pagesThisWeek = thisWeek.reduce((s, x) => s + (x.pagesMemorized || 0), 0);

  return NextResponse.json({
    totalPages: progress.totalPages,
    pagesMemorized: progress.pagesMemorized,
    percentage: Math.round(progress.pagesMemorized / progress.totalPages * 1000) / 10,
    pagesThisWeek: Math.round(pagesThisWeek * 10) / 10,
    totalSessions: sessions.length,
    streak: calculateStreak(progress.sessions),
    targetDate: progress.targetDate?.toISOString() || null,
  });
}

function calculateStreak(sessions: { date: Date }[]): number {
  if (sessions.length === 0) return 0;
  const dates = new Set(sessions.map((s) => s.date.toISOString().slice(0, 10)));
  let streak = 0;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 365; i++) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    if (dates.has(d.toISOString().slice(0, 10))) streak++; else break;
  }
  return streak;
}
