import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseMoneyInput } from "@/lib/money";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const monthStr = searchParams.get("month"); // YYYY-MM format

  if (!monthStr || !/^\d{4}-\d{2}$/.test(monthStr)) {
    return NextResponse.json({ error: "month is required (YYYY-MM)" }, { status: 400 });
  }

  const [year, mon] = monthStr.split("-").map(Number);
  const monthStart = new Date(year, mon - 1, 1);
  const monthEnd = new Date(year, mon, 0, 23, 59, 59);

  const [budgetItems, transactions, categories, accounts] = await Promise.all([
    db.budget.findMany({
      where: { month: monthStart },
      include: { category: true },
    }),
    db.transaction.findMany({
      where: { date: { gte: monthStart, lte: monthEnd } },
      include: { category: true },
    }),
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.account.findMany({ where: { isActive: true } }),
  ]);

  // Monthly income (all income transactions this month)
  const monthlyIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);

  // Activity per category (actual spending)
  const activity: Record<string, number> = {};
  transactions
    .filter((t) => t.type === "expense" && t.categoryId)
    .forEach((t) => {
      activity[t.categoryId!] = (activity[t.categoryId!] || 0) + t.amount;
    });

  // Build envelope rows for expense categories
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

  if (!body.categoryId || !body.month) {
    return NextResponse.json({ error: "categoryId and month are required" }, { status: 400 });
  }

  const monthStart = new Date(body.month + "-01");

  const budget = await db.budget.upsert({
    where: { categoryId_month: { categoryId: body.categoryId, month: monthStart } },
    create: {
      categoryId: body.categoryId,
      month: monthStart,
      amount: parseMoneyInput(body.amount || "0"),
    },
    update: {
      amount: parseMoneyInput(body.amount || "0"),
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
