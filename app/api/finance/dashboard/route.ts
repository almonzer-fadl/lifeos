import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateRunway } from "@/lib/runway";

export async function GET() {
  const [runway, invoiceSummary, subscriptions, recentTransactions] = await Promise.all([
    calculateRunway(),
    db.invoice.groupBy({
      by: ["status"],
      _count: true,
      _sum: { total: true },
    }),
    db.subscription.findMany({
      where: { isActive: true },
      orderBy: { nextBillingDate: "asc" },
    }),
    db.transaction.findMany({
      orderBy: { date: "desc" },
      take: 10,
      include: { account: true, category: true },
    }),
  ]);

  const invoiceStatuses: Record<string, { count: number; total: number }> = {};
  for (const group of invoiceSummary) {
    invoiceStatuses[group.status] = {
      count: group._count,
      total: group._sum.total || 0,
    };
  }

  return NextResponse.json({
    runway,
    invoices: {
      byStatus: invoiceStatuses,
    },
    subscriptions,
    recentTransactions,
  });
}
