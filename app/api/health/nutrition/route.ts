import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { schemas } from "@/lib/validate";
import { validateBody } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const limit = parseInt(searchParams.get("limit") || "50");

  const where: Record<string, unknown> = {};
  if (date) {
    const d = new Date(date);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    where.date = { gte: start, lt: end };
  } else if (from || to) {
    where.date = {};
    if (from) (where.date as Record<string, string>).gte = from;
    if (to) (where.date as Record<string, string>).lte = to;
  }

  const entries = await db.foodDiaryEntry.findMany({
    where,
    orderBy: { date: "desc" },
    take: Math.min(limit, 200),
    include: { food: true },
  });

  return NextResponse.json(entries);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const validation = validateBody(schemas.foodDiary, body);
  if (validation.error) return validation.error;
  if (!validation.data) return NextResponse.json({ error: "Validation failed" }, { status: 400 });

  const entry = await db.foodDiaryEntry.create({
    data: {
      date: body.date ? new Date(body.date) : new Date(),
      mealType: validation.data.mealType || "snack",
      foodId: validation.data.foodId,
      servings: validation.data.servings || 1,
      grams: validation.data.grams,
      carbEstimate: body.carbEstimate ?? undefined,
      bolusSuggested: body.bolusSuggested ?? undefined,
      bolusTaken: body.bolusTaken ?? undefined,
      postMealGlucose: body.postMealGlucose ?? undefined,
      costEstimate: body.costEstimate ?? undefined,
    },
    include: { food: true },
  });

  // Update frequent food usage count
  await db.frequentFood.upsert({
    where: { foodId: validation.data.foodId },
    create: { foodId: validation.data.foodId, useCount: 1, lastUsedAt: new Date() },
    update: { useCount: { increment: 1 }, lastUsedAt: new Date() },
  });

  return NextResponse.json(entry, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await db.foodDiaryEntry.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
