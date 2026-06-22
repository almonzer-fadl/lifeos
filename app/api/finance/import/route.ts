import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.accountId || !body.transactions || !Array.isArray(body.transactions)) {
    return NextResponse.json({ error: "accountId and transactions array required" }, { status: 400 });
  }

  let imported = 0;
  let duplicates = 0;

  for (const row of body.transactions) {
    if (!row.amount || !row.date) continue;

    // Check for potential duplicate: same account, amount, date
    const existing = await db.transaction.findFirst({
      where: {
        accountId: body.accountId,
        amount: Math.round(parseFloat(row.amount) * 100),
        date: new Date(row.date),
        description: row.description || null,
      },
    });

    if (existing) {
      duplicates++;
      continue;
    }

    await db.transaction.create({
      data: {
        accountId: body.accountId,
        amount: Math.round(parseFloat(row.amount) * 100),
        currency: row.currency || "USD",
        type: parseFloat(row.amount) >= 0 ? "income" : "expense",
        date: new Date(row.date),
        description: row.description || null,
        status: "pending",
      },
    });
    imported++;
  }

  return NextResponse.json({ imported, duplicates, total: body.transactions.length });
}
