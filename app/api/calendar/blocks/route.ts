import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const blocks = await db.timeBlockTemplate.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(blocks);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.name || !body.startTime || !body.endTime || !body.daysOfWeek) {
    return NextResponse.json({ error: "name, startTime, endTime, and daysOfWeek are required" }, { status: 400 });
  }

  const block = await db.timeBlockTemplate.create({
    data: {
      name: body.name,
      startTime: body.startTime,
      endTime: body.endTime,
      daysOfWeek: body.daysOfWeek,
      color: body.color || null,
      type: body.type || "fixed",
      sortOrder: body.sortOrder || 0,
    },
  });

  return NextResponse.json(block, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (body.name) data.name = body.name;
  if (body.startTime) data.startTime = body.startTime;
  if (body.endTime) data.endTime = body.endTime;
  if (body.daysOfWeek) data.daysOfWeek = body.daysOfWeek;
  if (body.color !== undefined) data.color = body.color;
  if (body.type) data.type = body.type;
  if (body.isActive !== undefined) data.isActive = body.isActive;
  if (body.sortOrder != null) data.sortOrder = body.sortOrder;

  const block = await db.timeBlockTemplate.update({ where: { id: body.id }, data });
  return NextResponse.json(block);
}
