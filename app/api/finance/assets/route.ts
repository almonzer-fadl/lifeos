import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const assets = await db.asset.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(assets);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const asset = await db.asset.create({
    data: {
      name: body.name,
      type: body.type || "other",
      purchaseValue: body.purchaseValue || 0,
      currentValue: body.currentValue || body.purchaseValue || 0,
      currency: body.currency || "USD",
      purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
      notes: body.notes || null,
    },
  });
  return NextResponse.json(asset, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.asset.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
