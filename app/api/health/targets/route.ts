import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_request: NextRequest) {
  const ranges = await db.targetRange.findMany({
    orderBy: [{ timeOfDay: "asc" }, { validFrom: "desc" }],
  });

  return NextResponse.json(ranges);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.low || !body.high) {
    return NextResponse.json({ error: "low and high are required (mg/dL)" }, { status: 400 });
  }

  const range = await db.targetRange.create({
    data: {
      low: body.low,
      high: body.high,
      timeOfDay: body.timeOfDay || "morning",
    },
  });

  return NextResponse.json(range, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (body.validUntil !== undefined) {
    data.validUntil = body.validUntil ? new Date(body.validUntil) : new Date();
  }

  const updated = await db.targetRange.update({
    where: { id: body.id },
    data,
  });

  return NextResponse.json(updated);
}
