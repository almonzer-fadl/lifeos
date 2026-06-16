import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseMoneyInput } from "@/lib/money";

export async function GET() {
  const goals = await db.financialGoal.findMany({
    orderBy: { status: "asc" },
    include: { account: true },
  });
  return NextResponse.json(goals);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (body.targetAmount == null || isNaN(parseFloat(body.targetAmount)) || parseFloat(body.targetAmount) <= 0) {
    return NextResponse.json({ error: "Valid target amount is required" }, { status: 400 });
  }

  const goal = await db.financialGoal.create({
    data: {
      name: body.name.trim(),
      targetAmount: parseMoneyInput(body.targetAmount),
      currentAmount: body.currentAmount != null ? parseMoneyInput(body.currentAmount) : 0,
      currency: body.currency || "USD",
      targetDate: body.targetDate ? new Date(body.targetDate) : null,
      accountId: body.accountId || null,
      notes: body.notes || null,
    },
  });
  return NextResponse.json(goal, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (body.name) data.name = body.name;
  if (body.status) data.status = body.status;
  if (body.notes !== undefined) data.notes = body.notes;
  if (body.targetAmount != null && !isNaN(parseFloat(body.targetAmount))) data.targetAmount = parseMoneyInput(body.targetAmount);
  if (body.currentAmount != null && !isNaN(parseFloat(body.currentAmount))) data.currentAmount = parseMoneyInput(body.currentAmount);

  const goal = await db.financialGoal.update({ where: { id: body.id }, data });
  return NextResponse.json(goal);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await db.financialGoal.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
