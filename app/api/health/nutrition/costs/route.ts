import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const foodName = searchParams.get("foodName");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);

  const where: Record<string, unknown> = {};
  if (foodName) where.foodName = { contains: foodName, mode: "insensitive" };

  const costs = await db.foodCost.findMany({
    where,
    orderBy: { date: "desc" },
    take: limit,
  });

  return NextResponse.json(costs);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.foodName) return NextResponse.json({ error: "foodName is required" }, { status: 400 });
  if (!body.price) return NextResponse.json({ error: "price is required (cents)" }, { status: 400 });

  const cost = await db.foodCost.create({
    data: {
      foodId: body.foodId || null,
      foodName: body.foodName,
      store: body.store || null,
      price: body.price,
      quantity: body.quantity || 1,
      unit: body.unit || "kg",
      pricePerUnit: body.quantity ? body.price / body.quantity : undefined,
      notes: body.notes || null,
    },
  });

  return NextResponse.json(cost, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await db.foodCost.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
