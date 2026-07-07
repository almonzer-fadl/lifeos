import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { estimateTRIMP, classifyLoad } from "@/lib/training-load";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const weeks = parseInt(searchParams.get("weeks") || "4");

  const endDate = to ? new Date(to) : new Date();
  const startDate = from ? new Date(from) : new Date(endDate.getTime() - weeks * 7 * 24 * 60 * 60 * 1000);

  const activities = await db.activity.findMany({
    where: { startTime: { gte: startDate, lte: endDate } },
    orderBy: { startTime: "desc" },
  });

  const totalDistance = activities.reduce((s, a) => s + (a.distance || 0), 0);
  const totalDuration = activities.reduce((s, a) => {
    if (!a.endTime) return s;
    return s + (new Date(a.endTime).getTime() - new Date(a.startTime).getTime()) / 60000;
  }, 0);
  const totalCalories = activities.reduce((s, a) => s + (a.calories || 0), 0);

  const weeklyLoads: { week: string; load: number; count: number }[] = [];
  const weekMap = new Map<string, { load: number; count: number }>();
  for (const a of activities) {
    const dur = a.endTime ? (new Date(a.endTime).getTime() - new Date(a.startTime).getTime()) / 60000 : 0;
    const load = estimateTRIMP(dur, a.heartRateAvg);
    const week = a.startTime.toISOString().slice(0, 7) + "-W" + Math.ceil(a.startTime.getDate() / 7);
    const existing = weekMap.get(week) || { load: 0, count: 0 };
    existing.load += load;
    existing.count++;
    weekMap.set(week, existing);
  }
  weekMap.forEach((v, k) => weeklyLoads.push({ week: k, load: Math.round(v.load), count: v.count }));
  weeklyLoads.sort((a, b) => b.week.localeCompare(a.week));

  return NextResponse.json({
    summary: {
      totalActivities: activities.length,
      totalDistance: Math.round(totalDistance),
      totalDurationMin: Math.round(totalDuration),
      totalCalories,
      periodDays: Math.round((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)),
    },
    weeklyLoads,
  });
}
