import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { schemas } from "@/lib/validate";
import { validateBody } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "52");

  const measurements = await db.bodyMeasurement.findMany({
    orderBy: { date: "desc" },
    take: Math.min(limit, 200),
  });

  return NextResponse.json(measurements);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const validation = validateBody(schemas.bodyMeasurement, body);
  if (validation.error) return validation.error;
  if (!validation.data) return NextResponse.json({ error: "Validation failed" }, { status: 400 });

  const measurement = await db.bodyMeasurement.create({
    data: {
      date: body.date ? new Date(body.date) : new Date(),
      weight: validation.data.weight,
      bodyFatPct: validation.data.bodyFatPct,
      waist: validation.data.waist,
      chest: validation.data.chest,
      bicepLeft: body.bicepLeft || null,
      bicepRight: body.bicepRight || null,
      thighLeft: body.thighLeft || null,
      thighRight: body.thighRight || null,
      neck: body.neck || null,
      notes: validation.data.notes,
    },
  });

  return NextResponse.json(measurement, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await db.bodyMeasurement.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
