import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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

  const measurement = await db.bodyMeasurement.create({
    data: {
      date: body.date ? new Date(body.date) : new Date(),
      weight: body.weight || null,
      bodyFatPct: body.bodyFatPct || null,
      waist: body.waist || null,
      chest: body.chest || null,
      bicepLeft: body.bicepLeft || null,
      bicepRight: body.bicepRight || null,
      thighLeft: body.thighLeft || null,
      thighRight: body.thighRight || null,
      neck: body.neck || null,
      notes: body.notes || null,
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
