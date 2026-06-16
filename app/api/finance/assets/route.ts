import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseMoneyInput } from "@/lib/money";

const VALID_TYPES = ["property", "vehicle", "investment", "crypto", "gold", "collectible", "other"];

export async function GET() {
  const assets = await db.asset.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(assets);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (body.type && !VALID_TYPES.includes(body.type)) {
    return NextResponse.json({ error: `Invalid type. Must be one of: ${VALID_TYPES.join(", ")}` }, { status: 400 });
  }

  const purchaseValue = body.purchaseValue != null ? parseMoneyInput(body.purchaseValue) : 0;
  const currentValue = body.currentValue != null ? parseMoneyInput(body.currentValue) : purchaseValue;

  const asset = await db.asset.create({
    data: {
      name: body.name.trim(),
      type: body.type || "other",
      purchaseValue,
      currentValue,
      currency: body.currency || "USD",
      purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
      notes: body.notes || null,
    },
  });
  return NextResponse.json(asset, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (body.name) data.name = body.name;
  if (body.type && VALID_TYPES.includes(body.type)) data.type = body.type;
  if (body.currentValue != null && !isNaN(parseFloat(body.currentValue))) data.currentValue = parseMoneyInput(body.currentValue);
  if (body.notes !== undefined) data.notes = body.notes;
  if (body.currency) data.currency = body.currency;

  const asset = await db.asset.update({ where: { id: body.id }, data });
  return NextResponse.json(asset);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await db.asset.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
