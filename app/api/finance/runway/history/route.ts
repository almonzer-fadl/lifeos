import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "30"), 365);

  const snapshots = await db.runwaySnapshot.findMany({
    orderBy: { date: "desc" },
    take: limit,
  });

  return NextResponse.json(snapshots);
}
