import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseMoneyInput } from "@/lib/money";
import { schemas } from "@/lib/validate";
import { validateBody } from "@/lib/api-utils";

export async function GET() {
  const goals = await db.financialGoal.findMany({
    orderBy: { status: "asc" },
    include: { account: true },
  });
  return NextResponse.json(goals);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const validation = validateBody(schemas.goal, body);
  if (validation.error) return validation.error;
  if (!validation.data) return NextResponse.json({ error: "Validation failed" }, { status: 400 });

  const goal = await db.financialGoal.create({
    data: {
      name: validation.data.name,
      targetAmount: validation.data.targetAmount,
      currentAmount: validation.data.currentAmount,
      currency: validation.data.currency,
      targetDate: body.targetDate ? new Date(body.targetDate) : null,
      accountId: validation.data.accountId,
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
