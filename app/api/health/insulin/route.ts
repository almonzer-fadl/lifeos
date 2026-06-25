import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { schemas } from "@/lib/validate";
import { validateBody } from "@/lib/api-utils";

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

  const validation = validateBody(schemas.insulin, body);
  if (validation.error) return validation.error;
  if (!validation.data) return NextResponse.json({ error: "Validation failed" }, { status: 400 });

  const dose = await db.insulinDose.create({
    data: {
      timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
      type: validation.data.type || "rapid",
      brand: validation.data.brand,
      units: validation.data.units,
      notes: validation.data.notes,
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
