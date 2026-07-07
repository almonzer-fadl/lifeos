import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const blocks = await db.trainingBlock.findMany({
    where,
    include: { activities: { take: 5, orderBy: { startTime: "desc" } } },
    orderBy: { startDate: "desc" },
  });

  return NextResponse.json(blocks);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.name || !body.startDate || !body.endDate) {
    return NextResponse.json({ error: "name, startDate, and endDate are required" }, { status: 400 });
  }

  const block = await db.trainingBlock.create({
    data: {
      name: body.name,
      type: body.type || "meso_cycle",
      goal: body.goal || null,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      status: body.status || "planned",
      notes: body.notes || null,
      parentBlockId: body.parentBlockId || null,
    },
  });

  return NextResponse.json(block, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (body.status) data.status = body.status;

  const block = await db.trainingBlock.update({ where: { id: body.id }, data });
  return NextResponse.json(block);
}
