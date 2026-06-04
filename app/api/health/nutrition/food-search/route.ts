import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const barcode = searchParams.get("barcode") || "";

  if (barcode) {
    const food = await db.foodItem.findFirst({
      where: { barcode },
    });
    return NextResponse.json(food ? [food] : []);
  }

  if (q.length < 2) {
    return NextResponse.json([]);
  }

  const foods = await db.foodItem.findMany({
    where: {
      name: { contains: q, mode: "insensitive" },
    },
    take: 15,
    orderBy: { name: "asc" },
  });

  return NextResponse.json(foods);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const food = await db.foodItem.create({
    data: {
      name: body.name,
      brand: body.brand || null,
      barcode: body.barcode || null,
      servingSize: body.servingSize || null,
      servingUnit: body.servingUnit || null,
      calories: body.calories || null,
      protein: body.protein || null,
      carbs: body.carbs || null,
      fat: body.fat || null,
      fiber: body.fiber || null,
      sugars: body.sugars || null,
      saturatedFat: body.saturatedFat || null,
      sodium: body.sodium || null,
      isSeeded: false,
    },
  });

  return NextResponse.json(food, { status: 201 });
}
