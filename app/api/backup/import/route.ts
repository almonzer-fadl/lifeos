import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.data) {
    return NextResponse.json({ error: "No data provided" }, { status: 400 });
  }

  const { data } = body;
  let imported = { accounts: 0, transactions: 0, categories: 0, habits: 0, tasks: 0 };

  // Import categories first (no dependencies)
  if (data.categories) {
    for (const c of data.categories) {
      await db.category.upsert({
        where: { id: c.id },
        create: { id: c.id, name: c.name, type: c.type || "expense", color: c.color, icon: c.icon },
        update: { name: c.name, type: c.type },
      });
      imported.categories++;
    }
  }

  // Import accounts
  if (data.accounts) {
    for (const a of data.accounts) {
      await db.account.upsert({
        where: { id: a.id },
        create: a,
        update: { name: a.name, initialBalance: a.initialBalance, type: a.type },
      });
      imported.accounts++;
    }
  }

  // Import transactions
  if (data.transactions) {
    for (const t of data.transactions) {
      try {
        await db.transaction.upsert({
          where: { id: t.id },
          create: { id: t.id, date: new Date(t.date), accountId: t.accountId, amount: t.amount, currency: t.currency, type: t.type, status: t.status || "pending", description: t.description, categoryId: t.categoryId },
          update: { amount: t.amount, type: t.type, status: t.status, description: t.description },
        });
        imported.transactions++;
      } catch { /* skip duplicates */ }
    }
  }

  // Import habits
  if (data.habits) {
    for (const h of data.habits) {
      await db.habit.upsert({ where: { id: h.id }, create: h, update: { name: h.name } });
      imported.habits++;
    }
  }

  // Import tasks
  if (data.tasks) {
    for (const t of data.tasks) {
      await db.task.upsert({ where: { id: t.id }, create: t, update: { title: t.title, status: t.status } });
      imported.tasks++;
    }
  }

  return NextResponse.json({ imported });
}
