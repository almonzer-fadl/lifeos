import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const races = await db.race.findMany({
    where,
    orderBy: { date: "asc" },
    take: limit,
  });

  // Add daysUntil
  const now = new Date();
  const enriched = races.map((r) => ({
    ...r,
    daysUntil: Math.ceil((new Date(r.date).getTime() - now.getTime()) / (24 * 60 * 60 * 1000)),
  }));

  return NextResponse.json(enriched);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.name || !body.raceType || !body.date) {
    return NextResponse.json({ error: "name, raceType, and date are required" }, { status: 400 });
  }

  const race = await db.race.create({
    data: {
      name: body.name,
      raceType: body.raceType,
      distance: body.distance ?? undefined,
      date: new Date(body.date),
      location: body.location || null,
      targetTime: body.targetTime ?? undefined,
      targetPace: body.targetPace ?? undefined,
      notes: body.notes || null,
      trainingBlockId: body.trainingBlockId || null,
    },
  });

  return NextResponse.json(race, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (body.status) data.status = body.status;
  if (body.actualTime !== undefined) data.actualTime = body.actualTime;
  if (body.activityId) data.activityId = body.activityId;

  const race = await db.race.update({ where: { id: body.id }, data });
  return NextResponse.json(race);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await db.race.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
