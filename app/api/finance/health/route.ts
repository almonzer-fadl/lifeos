import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const [
    accounts, transactions, categories, assets, goals, recurring,
    habits, tasks, journal, glucose, sleep, activities, body, nutrition, labs
  ] = await Promise.all([
    db.account.count(),
    db.transaction.count(),
    db.category.count(),
    db.asset.count(),
    db.financialGoal.count(),
    db.recurringTransaction.count(),
    db.habit.count(),
    db.task.count(),
    db.journalEntry.count(),
    db.glucoseReading.count(),
    db.sleepSession.count(),
    db.activity.count(),
    db.bodyMeasurement.count(),
    db.foodDiaryEntry.count(),
    db.labResult.count(),
  ]);

  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    counts: {
      finance: { accounts, transactions, categories, assets, goals, recurring },
      productivity: { habits, tasks, journal },
      health: { glucose, sleep, activities, body, nutrition, labs },
    },
  });
}
