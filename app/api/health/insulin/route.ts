import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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

  const dose = await db.insulinDose.create({
    data: {
      timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
      type: body.type || "rapid",
      brand: body.brand || null,
      units: body.units,
      notes: body.notes || null,
    },
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
