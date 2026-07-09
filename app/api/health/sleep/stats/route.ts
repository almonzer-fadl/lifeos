import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const weeks = parseInt(searchParams.get("weeks") || "4");

  const since = new Date(Date.now() - weeks * 7 * 24 * 60 * 60 * 1000);
  const sessions = await db.sleepSession.findMany({
    where: { startTime: { gte: since } },
    orderBy: { startTime: "desc" },
  });

  const total = sessions.length;
  if (total === 0) {
    return NextResponse.json({ avgHours: 0, avgQuality: 0, sessions: 0, periodWeeks: weeks });
  }

  const totalHours = sessions.reduce((s, x) => s + (new Date(x.endTime).getTime() - new Date(x.startTime).getTime()) / 3600000, 0);
  const avgQuality = sessions.reduce((s, x) => s + (x.quality || 0), 0) / total;

  return NextResponse.json({
    avgHours: Math.round(totalHours / total * 10) / 10,
    avgQuality: Math.round(avgQuality * 10) / 10,
    sessions: total,
    periodWeeks: weeks,
  });
}
