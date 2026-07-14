import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_request: NextRequest) {
  const supplements = await db.supplement.findMany({
    include: { logs: { orderBy: { date: "desc" }, take: 10 } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(supplements);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.name) return NextResponse.json({ error: "name is required" }, { status: 400 });

  const supplement = await db.supplement.create({
    data: {
      name: body.name,
      brand: body.brand || null,
      servingSize: body.servingSize || 1,
      servingUnit: body.servingUnit || "capsule",
      nutrients: body.nutrients || null,
      notes: body.notes || null,
    },
  });
  return NextResponse.json(supplement, { status: 201 });
}
