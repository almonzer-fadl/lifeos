import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { centsToDollars } from "@/lib/money";

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.accountId || !body.statementBalance || !body.statementDate) {
    return NextResponse.json({ error: "accountId, statementBalance, and statementDate are required" }, { status: 400 });
  }

  const statementBalance = Math.round(parseFloat(body.statementBalance) * 100);
  const statementDate = new Date(body.statementDate);

  // Get all transactions for this account up to statement date
  const transactions = await db.transaction.findMany({
    where: { accountId: body.accountId, date: { lte: statementDate } },
    orderBy: { date: "desc" },
  });

  // Get account
  const account = await db.account.findUnique({ where: { id: body.accountId } });
  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  // Calculate cleared balance (all non-pending transactions)
  const clearedBalance = transactions
    .filter((t) => t.status !== "pending")
    .reduce((s, t) => t.type === "income" ? s + t.amount : t.type === "expense" ? s - t.amount : s, account.initialBalance);

  const difference = statementBalance - clearedBalance;

  // Group transactions by status
  const pending = transactions.filter((t) => t.status === "pending");
  const cleared = transactions.filter((t) => t.status === "cleared");
  const reconciled = transactions.filter((t) => t.status === "reconciled");

  return NextResponse.json({
    accountId: body.accountId,
    accountName: account.name,
    statementDate: body.statementDate,
    statementBalance,
    clearedBalance,
    difference,
    isReconciled: difference === 0,
    transactionCounts: {
      total: transactions.length,
      pending: pending.length,
      cleared: cleared.length,
      reconciled: reconciled.length,
    },
    pendingTransactions: pending.slice(0, 20),
  });
}

// Mark a group of transactions as reconciled
export async function PATCH(request: NextRequest) {
  const body = await request.json();

  if (!body.accountId || !body.statementDate) {
    return NextResponse.json({ error: "accountId and statementDate required" }, { status: 400 });
  }

  const statementDate = new Date(body.statementDate);

  // Mark all cleared transactions up to statement date as reconciled
  const result = await db.transaction.updateMany({
    where: {
      accountId: body.accountId,
      date: { lte: statementDate },
      status: "cleared",
    },
    data: { status: "reconciled" },
  });

  return NextResponse.json({ reconciled: result.count });
}
