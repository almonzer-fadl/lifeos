import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const [
    accounts, transactions, categories, assets, goals, recurring,
    habits, tasks, journal, glucose, sleep, activities, body, nutrition,
    exchangeRates, budgets,
  ] = await Promise.all([
    db.account.findMany(),
    db.transaction.findMany({ take: 10000 }),
    db.category.findMany(),
    db.asset.findMany(),
    db.financialGoal.findMany(),
    db.recurringTransaction.findMany(),
    db.habit.findMany({ include: { logs: true } }),
    db.task.findMany({ include: { project: true } }),
    db.journalEntry.findMany(),
    db.glucoseReading.findMany({ take: 5000 }),
    db.sleepSession.findMany({ take: 1000 }),
    db.activity.findMany({ take: 500 }),
    db.bodyMeasurement.findMany({ take: 500 }),
    db.foodDiaryEntry.findMany({ take: 500, include: { food: true } }),
    db.exchangeRate.findMany(),
    db.budget.findMany({ include: { category: true } }),
  ]);

  const backup = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    data: {
      accounts,
      transactions,
      categories,
      assets,
      goals,
      recurringTransactions: recurring,
      habits,
      tasks,
      journalEntries: journal,
      glucoseReadings: glucose,
      sleepSessions: sleep,
      activities,
      bodyMeasurements: body,
      foodDiary: nutrition,
      exchangeRates,
      budgets,
    },
  };

  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="lifeos-backup-${new Date().toISOString().split("T")[0]}.json"`,
    },
  });
}
