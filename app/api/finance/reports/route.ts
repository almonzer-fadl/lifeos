import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { centsToDollars } from "@/lib/money";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const months = parseInt(searchParams.get("months") || "12");
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

  const [transactions, accounts, assets, goals] = await Promise.all([
    db.transaction.findMany({
      where: { date: { gte: startDate } },
      orderBy: { date: "asc" },
      include: { category: true },
    }),
    db.account.findMany({ where: { isActive: true } }),
    db.asset.findMany(),
    db.financialGoal.findMany(),
  ]);

  // Monthly summaries
  const monthly: Record<string, { income: number; expense: number; net: number }> = {};
  for (let i = 0; i < months; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthly[key] = { income: 0, expense: 0, net: 0 };
  }

  transactions.forEach((t) => {
    const key = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, "0")}`;
    if (monthly[key]) {
      if (t.type === "income") monthly[key].income += t.amount;
      else if (t.type === "expense") monthly[key].expense += t.amount;
    }
  });

  Object.keys(monthly).forEach((k) => {
    monthly[k].net = monthly[k].income - monthly[k].expense;
  });

  // Category breakdown
  const byCategory: Record<string, number> = {};
  transactions
    .filter((t) => t.type === "expense" && t.category)
    .forEach((t) => {
      byCategory[t.category!.name] = (byCategory[t.category!.name] || 0) + t.amount;
    });

  const categoryBreakdown = Object.entries(byCategory)
    .sort(([, a], [, b]) => b - a)
    .map(([name, amount]) => ({ name, amount }));

  // Net worth trend
  const netWorthTrend = Object.keys(monthly)
    .sort()
    .map((month, i) => {
      const cumulativeNet = Object.keys(monthly)
        .sort()
        .slice(0, i + 1)
        .reduce((s, k) => s + monthly[k].net, 0);
      const currentAssets = assets.reduce((s, a) => s + a.currentValue, 0);
      return { month, netWorth: cumulativeNet + currentAssets };
    });

  // Current totals
  const totalIncome = Object.values(monthly).reduce((s, m) => s + m.income, 0);
  const totalExpense = Object.values(monthly).reduce((s, m) => s + m.expense, 0);
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  return NextResponse.json({
    period: { months, from: startDate.toISOString(), to: now.toISOString() },
    summary: {
      totalIncome,
      totalExpense,
      netSavings: totalIncome - totalExpense,
      savingsRate: Math.round(savingsRate),
      accountCount: accounts.length,
      assetCount: assets.length,
      goalCount: goals.length,
    },
    monthly,
    categoryBreakdown,
    netWorthTrend,
  });
}
