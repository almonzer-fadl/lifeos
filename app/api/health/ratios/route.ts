import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // "icr" or "cf" or undefined for both

  const [icrs, cfs] = await Promise.all([
    type === "cf" ? [] : db.insulinCarbRatio.findMany({ orderBy: { validFrom: "desc" } }),
    type === "icr" ? [] : db.correctionFactor.findMany({ orderBy: { validFrom: "desc" } }),
  ]);

  return NextResponse.json({
    insulinCarbRatios: icrs.map((r) => ({
      id: r.id, ratio: r.ratio, timeOfDay: r.timeOfDay,
      validFrom: r.validFrom, validUntil: r.validUntil, notes: r.notes,
    })),
    correctionFactors: cfs.map((f) => ({
      id: f.id, factor: f.factor, timeOfDay: f.timeOfDay,
      validFrom: f.validFrom, validUntil: f.validUntil, notes: f.notes,
    })),
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const ratioType = body.type; // "icr" or "cf"

  if (!ratioType || !["icr", "cf"].includes(ratioType)) {
    return NextResponse.json({ error: "type is required: 'icr' or 'cf'" }, { status: 400 });
  }

  if (ratioType === "icr") {
    if (!body.ratio || body.ratio <= 0) return NextResponse.json({ error: "ratio is required" }, { status: 400 });
    const record = await db.insulinCarbRatio.create({
      data: {
        ratio: body.ratio,
        timeOfDay: body.timeOfDay || "morning",
        notes: body.notes || null,
      },
    });
    return NextResponse.json(record, { status: 201 });
  }

  if (!body.factor || body.factor <= 0) return NextResponse.json({ error: "factor is required" }, { status: 400 });
  const record = await db.correctionFactor.create({
    data: {
      factor: body.factor,
      timeOfDay: body.timeOfDay || "morning",
      notes: body.notes || null,
    },
  });
  return NextResponse.json(record, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const ratioType = body.type;
  const validUntil = body.validUntil ? new Date(body.validUntil) : new Date();

  if (ratioType === "icr") {
    const updated = await db.insulinCarbRatio.update({
      where: { id: body.id },
      data: { validUntil },
    });
    return NextResponse.json(updated);
  }

  const updated = await db.correctionFactor.update({
    where: { id: body.id },
    data: { validUntil },
  });
  return NextResponse.json(updated);
}
