import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "30");

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const logs = await db.prayerLog.findMany({
    where: { date: { gte: since } },
    orderBy: { date: "desc" },
  });

  const total = logs.length;
  const onTime = logs.filter((l) => l.status === "on_time").length;
  const missed = logs.filter((l) => l.status === "missed").length;

  let streak = 0;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const dayMap = new Map<string, number>();
  for (const l of logs) {
    const d = l.date.toISOString().slice(0, 10);
    dayMap.set(d, (dayMap.get(d) || 0) + (l.status !== "missed" ? 1 : 0));
  }
  for (let i = 0; i < days; i++) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if ((dayMap.get(key) || 0) === 5) streak++; else break;
  }

  return NextResponse.json({
    total, onTime, missed,
    onTimePct: total > 0 ? Math.round(onTime / total * 100) : 0,
    streak, periodDays: days,
  });
}
