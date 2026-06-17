import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.supplementId) return NextResponse.json({ error: "supplementId is required" }, { status: 400 });

  const log = await db.supplementLog.create({
    data: {
      date: body.date ? new Date(body.date) : new Date(),
      supplementId: body.supplementId,
      dosage: body.dosage || 1,
      dosageUnit: body.dosageUnit || "serving",
      timeOfDay: body.timeOfDay || null,
      notes: body.notes || null,
    },
  });
  return NextResponse.json(log, { status: 201 });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const supplementId = searchParams.get("supplementId");
  const limit = Math.min(parseInt(searchParams.get("limit") || "30"), 100);

  const where: Record<string, unknown> = {};
  if (supplementId) where.supplementId = supplementId;

  const logs = await db.supplementLog.findMany({
    where,
    include: { supplement: true },
    orderBy: { date: "desc" },
    take: limit,
  });
  return NextResponse.json(logs);
}
