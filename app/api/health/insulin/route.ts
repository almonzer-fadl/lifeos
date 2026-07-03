import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { schemas } from "@/lib/validate";
import { validateBody } from "@/lib/api-utils";
import { events, EventTypes } from "@/lib/events";
import { calculateIOB, estimateIOBAfterDose } from "@/lib/iob";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const limit = parseInt(searchParams.get("limit") || "50");

  const where: Record<string, unknown> = {};
  if (from || to) {
    where.timestamp = {};
    if (from) (where.timestamp as Record<string, string>).gte = from;
    if (to) (where.timestamp as Record<string, string>).lte = to;
  }

  const doses = await db.insulinDose.findMany({
    where,
    orderBy: { timestamp: "desc" },
    take: Math.min(limit, 500),
  });

  return NextResponse.json(doses);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const validation = validateBody(schemas.insulin, body);
  if (validation.error) return validation.error;
  if (!validation.data) return NextResponse.json({ error: "Validation failed" }, { status: 400 });

  const timestamp = body.timestamp ? new Date(body.timestamp) : new Date();

  // Calculate IOB after this dose
  let iobAfter: number | null = null;
  if (validation.data.type === "rapid" || validation.data.type === "correction") {
    const now = new Date();
    const recentDoses = await db.insulinDose.findMany({
      where: {
        timestamp: { gte: new Date(now.getTime() - 5 * 60 * 60 * 1000) },
        type: { in: ["rapid", "correction"] },
      },
    });
    const existingIob = calculateIOB(recentDoses, now);
    iobAfter = existingIob + validation.data.units;
  }

  const dose = await db.insulinDose.create({
    data: {
      timestamp,
      type: validation.data.type || "rapid",
      brand: validation.data.brand,
      units: validation.data.units,
      notes: validation.data.notes,
      carbEntryId: body.carbEntryId || null,
      site: body.site || null,
      insulinOnBoardAfter: iobAfter,
    },
  });

  // Emit event
  await events.emit(EventTypes.INSULIN_DOSE, {
    id: dose.id,
    type: dose.type,
    units: dose.units,
    timestamp: dose.timestamp.toISOString(),
    iobAfter,
  });

  return NextResponse.json(dose, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await db.insulinDose.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
