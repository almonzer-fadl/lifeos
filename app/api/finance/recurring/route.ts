import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseMoneyInput } from "@/lib/money";

const VALID_FREQUENCIES = ["daily", "weekly", "monthly", "yearly"];

export async function GET() {
  const items = await db.recurringTransaction.findMany({
    where: { isActive: true },
    orderBy: { nextDate: "asc" },
    include: { account: true, category: true },
  });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.description || typeof body.description !== "string" || body.description.trim().length === 0) {
    return NextResponse.json({ error: "Description is required" }, { status: 400 });
  }
  if (!body.accountId) {
    return NextResponse.json({ error: "Account is required" }, { status: 400 });
  }
  if (body.amount == null || isNaN(parseFloat(body.amount)) || parseFloat(body.amount) <= 0) {
    return NextResponse.json({ error: "Valid amount is required" }, { status: 400 });
  }
  if (body.frequency && !VALID_FREQUENCIES.includes(body.frequency)) {
    return NextResponse.json({ error: `Invalid frequency. Must be one of: ${VALID_FREQUENCIES.join(", ")}` }, { status: 400 });
  }

  const item = await db.recurringTransaction.create({
    data: {
      type: body.type === "income" ? "income" : "expense",
      amount: parseMoneyInput(body.amount),
      currency: body.currency || "USD",
      accountId: body.accountId,
      categoryId: body.categoryId || null,
      description: body.description.trim(),
      frequency: body.frequency || "monthly",
      frequencyCount: body.frequencyCount || 1,
      startDate: new Date(body.startDate || new Date()),
      endDate: body.endDate ? new Date(body.endDate) : null,
      nextDate: new Date(body.nextDate || body.startDate || new Date()),
    },
  });
  return NextResponse.json(item, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await db.recurringTransaction.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
