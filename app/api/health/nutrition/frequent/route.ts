import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_request: NextRequest) {
  const foods = await db.frequentFood.findMany({
    orderBy: { useCount: "desc" },
    take: 20,
  });

  // Attach FoodItem data
  const foodIds = foods.map((f) => f.foodId);
  const foodItems = await db.foodItem.findMany({
    where: { id: { in: foodIds } },
  });
  const foodMap = new Map(foodItems.map((f) => [f.id, f]));

  const result = foods.map((f) => ({
    ...f,
    food: foodMap.get(f.foodId) || null,
  }));

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.foodId) return NextResponse.json({ error: "foodId is required" }, { status: 400 });

  const food = await db.frequentFood.upsert({
    where: { foodId: body.foodId },
    create: {
      foodId: body.foodId,
      personalName: body.personalName || null,
      typicalCarbs: body.typicalCarbs ?? undefined,
      typicalServing: body.typicalServing ?? undefined,
      typicalGlucose: body.typicalGlucose ?? undefined,
      useCount: 1,
      lastUsedAt: new Date(),
      notes: body.notes || null,
    },
    update: {
      useCount: { increment: 1 },
      lastUsedAt: new Date(),
      typicalCarbs: body.typicalCarbs ?? undefined,
      typicalGlucose: body.typicalGlucose ?? undefined,
    },
  });

  return NextResponse.json(food, { status: 201 });
}
