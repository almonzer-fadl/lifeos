import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateTIR } from "@/lib/tir";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: Record<string, unknown> = {};
  if (from || to) {
    where.timestamp = {};
    if (from) (where.timestamp as Record<string, string>).gte = from;
    if (to) (where.timestamp as Record<string, string>).lte = to;
  }

  const readings = await db.glucoseReading.findMany({
    where,
    orderBy: { timestamp: "asc" },
  });

  // Get default target range
  const target = await db.targetRange.findFirst({
    where: { validUntil: null },
    orderBy: { validFrom: "desc" },
  });

  const tir = calculateTIR(readings, {
    low: target?.low ?? 70,
    high: target?.high ?? 180,
  });

  // Additional stats
  const total = readings.length;
  const values = readings.map((r) => r.value);
  const avg = values.length > 0 ? values.reduce((s, v) => s + v, 0) / values.length : 0;
  const min = values.length > 0 ? Math.min(...values) : 0;
  const max = values.length > 0 ? Math.max(...values) : 0;

  return NextResponse.json({
    ...tir,
    count: total,
    min: Math.round(min * 10) / 10,
    max: Math.round(max * 10) / 10,
    targetUsed: { low: target?.low ?? 70, high: target?.high ?? 180 },
    period: { from: from || "all", to: to || "all" },
  });
}
