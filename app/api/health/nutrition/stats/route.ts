import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: Record<string, unknown> = {};
  if (from || to) {
    where.date = {};
    if (from) (where.date as Record<string, string>).gte = from;
    if (to) (where.date as Record<string, string>).lte = to;
  }

  const [entries, goals, waterLogs] = await Promise.all([
    db.foodDiaryEntry.findMany({ where, include: { food: true }, orderBy: { date: "desc" } }),
    db.nutritionGoal.findFirst(),
    db.waterLog.findMany({ where, orderBy: { date: "desc" }, take: 1 }),
  ]);

  // Daily macro totals
  const macrosByDay: Record<string, { calories: number; carbs: number; protein: number; fat: number; fiber: number }> = {};
  for (const e of entries) {
    const day = e.date.toISOString().slice(0, 10);
    if (!macrosByDay[day]) macrosByDay[day] = { calories: 0, carbs: 0, protein: 0, fat: 0, fiber: 0 };
    const cals = (e.food?.calories || 0) * e.servings;
    const carb = (e.food?.carbs || 0) * e.servings;
    const prot = (e.food?.protein || 0) * e.servings;
    const fat = (e.food?.fat || 0) * e.servings;
    const fib = (e.food?.fiber || 0) * e.servings;
    macrosByDay[day].calories += cals;
    macrosByDay[day].carbs += carb;
    macrosByDay[day].protein += prot;
    macrosByDay[day].fat += fat;
    macrosByDay[day].fiber += fib;
  }

  const days = Object.keys(macrosByDay).length;
  const totalCarbs = Object.values(macrosByDay).reduce((s, d) => s + d.carbs, 0);
  const totalProtein = Object.values(macrosByDay).reduce((s, d) => s + d.protein, 0);
  const totalCalories = Object.values(macrosByDay).reduce((s, d) => s + d.calories, 0);
  const totalFat = Object.values(macrosByDay).reduce((s, d) => s + d.fat, 0);
  const waterToday = waterLogs.length > 0 ? waterLogs[0].amountMl : 0;

  return NextResponse.json({
    entries: entries.length,
    days,
    averages: {
      calories: days > 0 ? Math.round(totalCalories / days) : 0,
      carbs: days > 0 ? Math.round(totalCarbs / days * 10) / 10 : 0,
      protein: days > 0 ? Math.round(totalProtein / days * 10) / 10 : 0,
      fat: days > 0 ? Math.round(totalFat / days * 10) / 10 : 0,
    },
    goals: goals ? {
      calories: goals.calories,
      carbs: goals.carbs,
      protein: goals.protein,
      fat: goals.fat,
      fiber: goals.fiber,
      waterMl: goals.waterMl,
    } : null,
    waterToday,
    perDay: Object.entries(macrosByDay).map(([date, macros]) => ({
      date,
      ...macros,
      calories: Math.round(macros.calories),
      carbs: Math.round(macros.carbs * 10) / 10,
      protein: Math.round(macros.protein * 10) / 10,
      fat: Math.round(macros.fat * 10) / 10,
      fiber: Math.round(macros.fiber * 10) / 10,
    })),
  });
}
