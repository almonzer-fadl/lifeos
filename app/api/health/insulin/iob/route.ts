import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateIOB } from "@/lib/iob";

export async function GET(_request: NextRequest) {
  const now = new Date();
  const activeWindow = new Date(now.getTime() - 5 * 60 * 60 * 1000); // 5h lookback

  const recentDoses = await db.insulinDose.findMany({
    where: {
      timestamp: { gte: activeWindow },
      type: { in: ["rapid", "correction"] },
    },
    orderBy: { timestamp: "desc" },
  });

  const iob = calculateIOB(recentDoses, now);

  return NextResponse.json({
    iob: Math.round(iob * 100) / 100,
    activeDoses: recentDoses.length,
    calculatedAt: now.toISOString(),
  });
}
