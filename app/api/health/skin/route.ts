import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const condition = searchParams.get("condition");
  const limit = Math.min(parseInt(searchParams.get("limit") || "30"), 100);

  const where: Record<string, unknown> = {};
  if (condition) where.condition = condition;

  const entries = await db.skinCondition.findMany({
    where, orderBy: { date: "desc" }, take: limit,
  });
  return NextResponse.json(entries);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.condition) return NextResponse.json({ error: "condition is required" }, { status: 400 });

  const entry = await db.skinCondition.create({
    data: {
      date: body.date ? new Date(body.date) : new Date(),
      condition: body.condition,
      severity: body.severity || 3,
      location: body.location || null,
      treatment: body.treatment || null,
      trigger: body.trigger || null,
      photoPath: body.photoPath || null,
      notes: body.notes || null,
    },
  });
  return NextResponse.json(entry, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await db.skinCondition.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
