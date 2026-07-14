import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const languages = await db.languageProgress.findMany({
    include: { sessions: { orderBy: { date: "desc" }, take: 1 } },
    orderBy: { language: "asc" },
  });

  const stats = languages.map((l) => {
    const totalMinutes = l.sessions.reduce((s, x) => s + x.duration, 0);
    const totalSessions = l.sessions.length;
    return {
      language: l.language,
      currentLevel: l.currentLevel,
      targetLevel: l.targetLevel,
      targetDate: l.targetDate?.toISOString() || null,
      totalMinutes,
      totalSessions,
      streakDays: l.streakDays,
      lastSession: l.sessions[0]?.date?.toISOString() || null,
    };
  });

  return NextResponse.json(stats);
}
