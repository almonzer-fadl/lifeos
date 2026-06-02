import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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

  const activity = await db.activity.create({
    data: {
      type: body.type,
      startTime: body.startTime ? new Date(body.startTime) : new Date(),
      endTime: body.endTime ? new Date(body.endTime) : null,
      distance: body.distance || null,
      elevationGain: body.elevationGain || null,
      heartRateAvg: body.heartRateAvg || null,
      heartRateMax: body.heartRateMax || null,
      calories: body.calories || null,
      notes: body.notes || null,
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
