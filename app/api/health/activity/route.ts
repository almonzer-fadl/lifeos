import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { schemas } from "@/lib/validate";
import { validateBody } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const type = searchParams.get("type");
  const limit = parseInt(searchParams.get("limit") || "50");

  const where: Record<string, unknown> = {};
  if (from || to) {
    where.startTime = {};
    if (from) (where.startTime as Record<string, string>).gte = from;
    if (to) (where.startTime as Record<string, string>).lte = to;
  }
  if (type) where.type = type;

  const activities = await db.activity.findMany({
    where,
    orderBy: { startTime: "desc" },
    take: Math.min(limit, 200),
    include: { splits: true },
  });

  return NextResponse.json(activities);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const validation = validateBody(schemas.activity, body);
  if (validation.error) return validation.error;
  if (!validation.data) return NextResponse.json({ error: "Validation failed" }, { status: 400 });

  const activity = await db.activity.create({
    data: {
      type: validation.data.type,
      startTime: validation.data.startTime ? new Date(validation.data.startTime) : new Date(),
      endTime: validation.data.endTime ? new Date(validation.data.endTime) : null,
      distance: validation.data.distance,
      elevationGain: body.elevationGain || null,
      heartRateAvg: validation.data.heartRateAvg,
      heartRateMax: body.heartRateMax || null,
      calories: body.calories || null,
      notes: validation.data.notes,
      source: body.source || "manual",
      externalId: body.externalId || null,
    },
  });

  return NextResponse.json(activity, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await db.activity.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
