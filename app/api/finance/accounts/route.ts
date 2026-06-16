import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseMoneyInput, parseOptionalMoneyInput } from "@/lib/money";
import { schemas } from "@/lib/validate";
import { validateBody } from "@/lib/api-utils";

export async function GET() {
  const accounts = await db.account.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(accounts);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const validation = validateBody(schemas.account, body);
  if (validation.error) return validation.error;
  if (!validation.data) return NextResponse.json({ error: "Validation failed" }, { status: 400 });

  const account = await db.account.create({
    data: {
      name: validation.data.name,
      currency: validation.data.currency,
      type: validation.data.type,
      initialBalance: parseMoneyInput(body.initialBalance || "0"),
      isDebt: validation.data.isDebt,
      interestRate: validation.data.interestRate,
      minimumPayment: validation.data.minimumPayment,
      creditLimit: validation.data.creditLimit,
      paymentDueDay: validation.data.paymentDueDay,
      payoffTarget: body.payoffTarget ? new Date(body.payoffTarget) : null,
      notes: body.notes || null,
    },
  });

  return NextResponse.json(account, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await db.account.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ success: true });
}
