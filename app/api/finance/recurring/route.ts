import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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
  const item = await db.recurringTransaction.create({
    data: {
      type: body.type || "expense",
      amount: body.amount,
      currency: body.currency || "USD",
      accountId: body.accountId,
      categoryId: body.categoryId || null,
      description: body.description,
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
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.recurringTransaction.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
