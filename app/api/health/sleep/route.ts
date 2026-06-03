import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const limit = parseInt(searchParams.get("limit") || "30");

  const where: Record<string, unknown> = {};
  if (from || to) {
    where.startTime = {};
    if (from) (where.startTime as Record<string, string>).gte = from;
    if (to) (where.startTime as Record<string, string>).lte = to;
  }

  const sessions = await db.sleepSession.findMany({
    where,
    orderBy: { startTime: "desc" },
    take: Math.min(limit, 100),
    include: { stages: true },
  });

  return NextResponse.json(sessions);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const session = await db.sleepSession.create({
    data: {
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
      quality: body.quality || null,
      notes: body.notes || null,
      source: body.source || "manual",
    },
  });

  return NextResponse.json(session, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await db.sleepSession.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
