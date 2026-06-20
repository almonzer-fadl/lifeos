import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const VALID_TYPES = ["income", "expense", "transfer"];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  const where: Record<string, unknown> = {};
  if (type && VALID_TYPES.includes(type)) where.type = type;

  const categories = await db.category.findMany({
    where,
    orderBy: { name: "asc" },
  });
  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (body.type && !VALID_TYPES.includes(body.type)) {
    return NextResponse.json({ error: `Invalid type. Must be one of: ${VALID_TYPES.join(", ")}` }, { status: 400 });
  }

  const category = await db.category.create({
    data: {
      name: body.name.trim(),
      type: body.type || "expense",
      color: body.color || null,
      icon: body.icon || null,
      parentId: body.parentId || null,
    },
  });
  return NextResponse.json(category, { status: 201 });
}
