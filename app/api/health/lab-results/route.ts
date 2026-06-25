import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { schemas } from "@/lib/validate";
import { validateBody } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const testName = searchParams.get("testName");
  const limit = parseInt(searchParams.get("limit") || "100");

  const where: Record<string, unknown> = {};
  if (testName) where.testName = { contains: testName, mode: "insensitive" };

  const results = await db.labResult.findMany({
    where,
    orderBy: { date: "desc" },
    take: Math.min(limit, 500),
  });

  return NextResponse.json(results);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const validation = validateBody(schemas.labResult, body);
  if (validation.error) return validation.error;
  if (!validation.data) return NextResponse.json({ error: "Validation failed" }, { status: 400 });

  const result = await db.labResult.create({
    data: {
      date: new Date(validation.data.date),
      testName: validation.data.testName,
      value: validation.data.value,
      unit: validation.data.unit ?? "",
      refRangeLow: validation.data.refRangeLow,
      refRangeHigh: validation.data.refRangeHigh,
      labName: body.labName || null,
      notes: body.notes || null,
    },
  });

  return NextResponse.json(result, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await db.labResult.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
