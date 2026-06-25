import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseMoneyInput } from "@/lib/money";
import { schemas } from "@/lib/validate";
import { validateBody } from "@/lib/api-utils";

export async function GET() {
  const assets = await db.asset.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(assets);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const validation = validateBody(schemas.asset, body);
  if (validation.error) return validation.error;
  if (!validation.data) return NextResponse.json({ error: "Validation failed" }, { status: 400 });

  const purchaseValue = body.purchaseValue != null ? parseMoneyInput(body.purchaseValue) : 0;
  const currentValue = body.currentValue != null ? parseMoneyInput(body.currentValue) : purchaseValue;

  const asset = await db.asset.create({
    data: {
      name: validation.data.name,
      type: validation.data.type,
      purchaseValue,
      currentValue,
      currency: validation.data.currency,
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
  if (body.type) data.type = body.type;
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
