import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  const where: Record<string, unknown> = {};
  if (type) where.type = type;

  const categories = await db.category.findMany({
    where,
    orderBy: { name: "asc" },
  });
  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const category = await db.category.create({
    data: {
      name: body.name,
      type: body.type || "expense",
      color: body.color || null,
      icon: body.icon || null,
      parentId: body.parentId || null,
    },
  });

  return NextResponse.json(category, { status: 201 });
}
