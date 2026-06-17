import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { schemas } from "@/lib/validate";
import { validateBody } from "@/lib/api-utils";
import { events, EventTypes } from "@/lib/events";
import { calculateTIR } from "@/lib/tir";

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

  // Determine target range for time-in-range flag
  const timeOfDay = getTimeOfDay();
  const target = await db.targetRange.findFirst({
    where: { timeOfDay, validUntil: null },
    orderBy: { validFrom: "desc" },
  });
  const targetLow = target?.low ?? 70;
  const targetHigh = target?.high ?? 180;
  const timeInRange = validation.data.value >= targetLow && validation.data.value <= targetHigh;

  const reading = await db.glucoseReading.create({
    data: {
      timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
      value: validation.data.value,
      unit: validation.data.unit || "mg/dL",
      source: body.source || "manual",
      notes: validation.data.notes,
      carbEntryId: body.carbEntryId || null,
      exerciseContext: body.exerciseContext || null,
      timeInRange,
      insulinOnBoard: body.insulinOnBoard ?? undefined,
    },
  });

  // Emit events
  await events.emit(EventTypes.GLUCOSE_READING, {
    id: reading.id,
    value: reading.value,
    unit: reading.unit,
    timestamp: reading.timestamp.toISOString(),
  });

  if (reading.value < 70) {
    await events.emit(EventTypes.GLUCOSE_LOW, {
      id: reading.id,
      value: reading.value,
      timestamp: reading.timestamp.toISOString(),
    });
  } else if (reading.value > 180) {
    await events.emit(EventTypes.GLUCOSE_HIGH, {
      id: reading.id,
      value: reading.value,
      timestamp: reading.timestamp.toISOString(),
    });
  }

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

function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  if (h < 21) return "evening";
  return "night";
}
