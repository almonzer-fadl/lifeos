import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseMoneyInput } from "@/lib/money";
import { schemas } from "@/lib/validate";
import { validateBody } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const monthStr = searchParams.get("month");

  if (!monthStr || !/^\d{4}-\d{2}$/.test(monthStr)) {
    return NextResponse.json({ error: "month is required (YYYY-MM)" }, { status: 400 });
  }

  const [year, mon] = monthStr.split("-").map(Number);
  const monthStart = new Date(year, mon - 1, 1);
  const monthEnd = new Date(year, mon, 0, 23, 59, 59);

  const [budgetItems, transactions, categories] = await Promise.all([
    db.budget.findMany({
      where: { month: monthStart },
      include: { category: true },
    }),
    db.transaction.findMany({
      where: { date: { gte: monthStart, lte: monthEnd } },
      include: { category: true },
    }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const monthlyIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);

  const activity: Record<string, number> = {};
  transactions
    .filter((t) => t.type === "expense" && t.categoryId)
    .forEach((t) => {
      activity[t.categoryId!] = (activity[t.categoryId!] || 0) + t.amount;
    });

  const envelopes = categories
    .filter((c) => c.type === "expense")
    .map((c) => {
      const budget = budgetItems.find((b) => b.categoryId === c.id);
      const assigned = budget?.amount || 0;
      const spent = activity[c.id] || 0;
      const available = assigned - spent;
      return {
        categoryId: c.id,
        categoryName: c.name,
        budgetId: budget?.id || null,
        assigned,
        activity: spent,
        available,
      };
    });

  const totalAssigned = envelopes.reduce((s, e) => s + e.assigned, 0);
  const totalActivity = envelopes.reduce((s, e) => s + e.activity, 0);
  const availableToAssign = monthlyIncome - totalAssigned;

  return NextResponse.json({
    month: monthStr,
    monthlyIncome,
    availableToAssign,
    totalAssigned,
    totalActivity,
    envelopes,
    incomeCategories: categories.filter((c) => c.type === "income"),
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const validation = validateBody(schemas.budget, body);
  if (validation.error) return validation.error;
  if (!validation.data) return NextResponse.json({ error: "Validation failed" }, { status: 400 });

  const monthStart = new Date(validation.data.month + "-01");

  const budget = await db.budget.upsert({
    where: { categoryId_month: { categoryId: validation.data.categoryId, month: monthStart } },
    create: {
      categoryId: validation.data.categoryId,
      month: monthStart,
      amount: validation.data.amount,
    },
    update: {
      amount: validation.data.amount,
    },
    include: { category: true },
  });

  return NextResponse.json(budget, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await db.budget.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
