import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);

  const where: Record<string, unknown> = {};
  if (from || to) {
    where.timestamp = {};
    if (from) (where.timestamp as Record<string, string>).gte = from;
    if (to) (where.timestamp as Record<string, string>).lte = to;
  }

  const readings = await db.ketoneReading.findMany({
    where,
    orderBy: { timestamp: "desc" },
    take: limit,
  });

  return NextResponse.json(readings);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (body.value === undefined || body.value === null) {
    return NextResponse.json({ error: "value is required (mmol/L)" }, { status: 400 });
  }

  const reading = await db.ketoneReading.create({
    data: {
      timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
      value: body.value,
      type: body.type || "blood",
      context: body.context || null,
      notes: body.notes || null,
    },
  });

  return NextResponse.json(reading, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  await db.ketoneReading.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
