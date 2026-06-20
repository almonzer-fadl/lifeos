import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseMoneyInput, parseOptionalMoneyInput } from "@/lib/money";

const VALID_TYPES = ["checking", "savings", "cash", "credit", "investment", "crypto", "loan", "mortgage"];

export async function GET() {
  const accounts = await db.account.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(accounts);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (body.type && !VALID_TYPES.includes(body.type)) {
    return NextResponse.json({ error: `Invalid type. Must be one of: ${VALID_TYPES.join(", ")}` }, { status: 400 });
  }
  if (body.paymentDueDay != null && (body.paymentDueDay < 1 || body.paymentDueDay > 31)) {
    return NextResponse.json({ error: "Payment due day must be between 1 and 31" }, { status: 400 });
  }

  const account = await db.account.create({
    data: {
      name: body.name.trim(),
      currency: body.currency || "USD",
      type: body.type || "checking",
      initialBalance: parseMoneyInput(body.initialBalance || "0"),
      isDebt: body.isDebt === true,
      interestRate: body.interestRate ? parseFloat(body.interestRate) : null,
      minimumPayment: parseOptionalMoneyInput(body.minimumPayment),
      creditLimit: parseOptionalMoneyInput(body.creditLimit),
      paymentDueDay: body.paymentDueDay ? parseInt(body.paymentDueDay) : null,
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
