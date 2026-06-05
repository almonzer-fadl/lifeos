import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("accountId");
  const categoryId = searchParams.get("categoryId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const type = searchParams.get("type");
  const limit = parseInt(searchParams.get("limit") || "50");

  const where: Record<string, unknown> = {};
  if (accountId) where.accountId = accountId;
  if (categoryId) where.categoryId = categoryId;
  if (type) where.type = type;
  if (from || to) {
    where.date = {};
    if (from) (where.date as Record<string, string>).gte = from;
    if (to) (where.date as Record<string, string>).lte = to;
  }

  const transactions = await db.transaction.findMany({
    where,
    orderBy: { date: "desc" },
    take: Math.min(limit, 200),
    include: { account: true, category: true },
  });

  return NextResponse.json(transactions);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const tx = await db.transaction.create({
    data: {
      date: body.date ? new Date(body.date) : new Date(),
      accountId: body.accountId,
      categoryId: body.categoryId || null,
      amount: body.amount,
      currency: body.currency || "USD",
      type: body.type || "expense",
      description: body.description || null,
      notes: body.notes || null,
      isTransfer: body.isTransfer || false,
      transferAccountId: body.transferAccountId || null,
    },
    include: { account: true, category: true },
  });

  return NextResponse.json(tx, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await db.transaction.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
