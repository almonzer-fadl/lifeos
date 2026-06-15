import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const goals = await db.financialGoal.findMany({
    orderBy: { status: "asc" },
    include: { account: true },
  });
  return NextResponse.json(goals);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const goal = await db.financialGoal.create({
    data: {
      name: body.name,
      targetAmount: body.targetAmount,
      currentAmount: body.currentAmount || 0,
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
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const goal = await db.financialGoal.update({ where: { id }, data });
  return NextResponse.json(goal);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.financialGoal.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
