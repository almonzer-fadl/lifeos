import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateSleepDebt } from "@/lib/sleep-compliance";

export async function GET(_request: NextRequest) {
  const sessions = await db.sleepSession.findMany({
    orderBy: { startTime: "desc" },
    take: 30,
  });

  const sessionHours = sessions.map((s) => ({
    hours: (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 3600000,
  }));

  const debt = calculateSleepDebt(sessionHours, 8);

  const debts = await db.sleepDebt.findMany({
    orderBy: { date: "desc" },
    take: 30,
  });

  return NextResponse.json({
    ...debt,
    history: debts.reverse(),
    recentSessions: sessions.slice(0, 7).map((s) => ({
      date: s.startTime.toISOString().slice(0, 10),
      hours: Math.round((new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 360000 * 10) / 10,
      quality: s.quality,
    })),
  });
}
