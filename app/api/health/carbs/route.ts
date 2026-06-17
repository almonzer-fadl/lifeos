import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 500);

  const where: Record<string, unknown> = {};
  if (from || to) {
    where.timestamp = {};
    if (from) (where.timestamp as Record<string, string>).gte = from;
    if (to) (where.timestamp as Record<string, string>).lte = to;
  }

  const entries = await db.carbEntry.findMany({
    where,
    orderBy: { timestamp: "desc" },
    take: limit,
  });

  return NextResponse.json(entries);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.carbs || body.carbs <= 0) {
    return NextResponse.json({ error: "carbs is required (grams > 0)" }, { status: 400 });
  }

  const entry = await db.carbEntry.create({
    data: {
      timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
      carbs: body.carbs,
      description: body.description || null,
      source: body.source || "manual",
      foodDiaryEntryId: body.foodDiaryEntryId || null,
    },
  });

  return NextResponse.json(entry, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  await db.carbEntry.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
