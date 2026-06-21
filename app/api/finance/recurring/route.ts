import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseMoneyInput } from "@/lib/money";

const VALID_FREQUENCIES = ["daily", "weekly", "monthly", "yearly"];

function computeNextDate(from: Date, frequency: string, count: number): Date {
  const d = new Date(from);
  switch (frequency) {
    case "daily": d.setDate(d.getDate() + count); break;
    case "weekly": d.setDate(d.getDate() + 7 * count); break;
    case "monthly": d.setMonth(d.getMonth() + count); break;
    case "yearly": d.setFullYear(d.getFullYear() + count); break;
  }
  return d;
}

export async function GET() {
  const items = await db.recurringTransaction.findMany({
    where: { isActive: true },
    orderBy: { nextDate: "asc" },
    include: { account: true, category: true },
  });

  // Compute monthly outflow
  const monthlyOutflow = items
    .filter((r) => r.type === "expense")
    .reduce((s, r) => {
      if (r.frequency === "monthly") return s + r.amount;
      if (r.frequency === "yearly") return s + r.amount / 12;
      if (r.frequency === "weekly") return s + (r.amount * 52) / 12;
      if (r.frequency === "daily") return s + (r.amount * 30) / r.frequencyCount;
      return s + (r.amount * 30) / r.frequencyCount;
    }, 0);

  // Cashflow forecast: next 30 days
  const forecast: { date: string; income: number; expense: number; balance: number }[] = [];
  let runningBalance = 0;
  const now = new Date();
  for (let i = 0; i < 30; i++) {
    const day = new Date(now);
    day.setDate(day.getDate() + i);
    const dayStr = day.toISOString().split("T")[0];
    let dayIncome = 0;
    let dayExpense = 0;

    items.forEach((r) => {
      const next = new Date(r.nextDate);
      if (next.toISOString().split("T")[0] === dayStr) {
        if (r.type === "income") dayIncome += r.amount;
        else dayExpense += r.amount;
      }
    });

    runningBalance += dayIncome - dayExpense;
    forecast.push({ date: dayStr, income: dayIncome, expense: dayExpense, balance: runningBalance });
  }

  return NextResponse.json({ items, monthlyOutflow, forecast });
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

  const startDate = body.startDate ? new Date(body.startDate) : new Date();
  const nextDate = computeNextDate(startDate, body.frequency || "monthly", 1);

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
      startDate,
      endDate: body.endDate ? new Date(body.endDate) : null,
      nextDate,
    },
    include: { account: true, category: true },
  });
  return NextResponse.json(item, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (body.description) data.description = body.description;
  if (body.amount != null && !isNaN(parseFloat(body.amount))) data.amount = parseMoneyInput(body.amount);
  if (body.isActive !== undefined) data.isActive = body.isActive;
  if (body.nextDate) data.nextDate = new Date(body.nextDate);

  const item = await db.recurringTransaction.update({ where: { id: body.id }, data, include: { account: true, category: true } });
  return NextResponse.json(item);
}

// Advance to next occurrence
export async function PUT(request: NextRequest) {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const item = await db.recurringTransaction.findUnique({ where: { id: body.id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const newNextDate = computeNextDate(item.nextDate, item.frequency, item.frequencyCount);
  const updated = await db.recurringTransaction.update({
    where: { id: body.id },
    data: { nextDate: newNextDate },
    include: { account: true, category: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await db.recurringTransaction.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
