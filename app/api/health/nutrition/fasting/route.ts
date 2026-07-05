import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const limit = Math.min(parseInt(searchParams.get("limit") || "30"), 100);

  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (from || to) {
    where.date = {};
    if (from) (where.date as Record<string, string>).gte = from;
    if (to) (where.date as Record<string, string>).lte = to;
  }

  const sessions = await db.fastingSession.findMany({
    where,
    orderBy: { date: "desc" },
    take: limit,
  });

  return NextResponse.json(sessions);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.startTime || !body.endTime) {
    return NextResponse.json({ error: "startTime and endTime are required" }, { status: 400 });
  }

  const start = new Date(body.startTime);
  const end = new Date(body.endTime);
  const duration = (end.getTime() - start.getTime()) / 3600000;

  const session = await db.fastingSession.create({
    data: {
      date: body.date ? new Date(body.date) : new Date(),
      type: body.type || "ramadan",
      startTime: start,
      endTime: end,
      duration: Math.round(duration * 10) / 10,
      preFastMealId: body.preFastMealId || null,
      postFastMealId: body.postFastMealId || null,
      preFastGlucose: body.preFastGlucose ?? undefined,
      postFastGlucose: body.postFastGlucose ?? undefined,
      notes: body.notes || null,
    },
  });

  return NextResponse.json(session, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await db.fastingSession.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
