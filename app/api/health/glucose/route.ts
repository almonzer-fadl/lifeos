import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { schemas } from "@/lib/validate";
import { validateBody } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const limit = parseInt(searchParams.get("limit") || "288");

  const where: Record<string, unknown> = {};
  if (from || to) {
    where.timestamp = {};
    if (from) (where.timestamp as Record<string, string>).gte = from;
    if (to) (where.timestamp as Record<string, string>).lte = to;
  }

  const readings = await db.glucoseReading.findMany({
    where,
    orderBy: { timestamp: "desc" },
    take: Math.min(limit, 1000),
  });

  return NextResponse.json(readings);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const validation = validateBody(schemas.glucose, body);
  if (validation.error) return validation.error;
  if (!validation.data) return NextResponse.json({ error: "Validation failed" }, { status: 400 });

  const reading = await db.glucoseReading.create({
    data: {
      timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
      value: validation.data.value,
      unit: validation.data.unit || "mg/dL",
      source: body.source || "manual",
      notes: validation.data.notes,
    },
  });

  return NextResponse.json(reading, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await db.glucoseReading.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
