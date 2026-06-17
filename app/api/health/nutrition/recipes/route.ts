import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

  const where: Record<string, unknown> = {};
  if (name) where.name = { contains: name, mode: "insensitive" };

  const recipes = await db.recipe.findMany({
    where,
    include: { ingredients: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json(recipes);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.name) return NextResponse.json({ error: "name is required" }, { status: 400 });

  const recipe = await db.recipe.create({
    data: {
      name: body.name,
      description: body.description || null,
      servings: body.servings || 1,
      prepTime: body.prepTime || null,
      cookTime: body.cookTime || null,
      instructions: body.instructions || null,
      notes: body.notes || null,
      isMalaysian: body.isMalaysian || false,
      totalCalories: body.totalCalories ?? undefined,
      totalCarbs: body.totalCarbs ?? undefined,
      totalProtein: body.totalProtein ?? undefined,
      totalFat: body.totalFat ?? undefined,
      totalFiber: body.totalFiber ?? undefined,
      netCarbs: body.netCarbs ?? (body.totalCarbs != null && body.totalFiber != null ? body.totalCarbs - body.totalFiber : undefined),
      ingredients: body.ingredients ? {
        create: body.ingredients.map((i: { name: string; amount: number; unit: string; foodId?: string }) => ({
          foodId: i.foodId || null,
          name: i.name,
          amount: i.amount,
          unit: i.unit || "g",
        })),
      } : undefined,
    },
    include: { ingredients: true },
  });

  return NextResponse.json(recipe, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await db.recipe.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
