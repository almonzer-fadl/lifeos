import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateIOB } from "@/lib/iob";
import { calculateBolus } from "@/lib/bolus";

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.carbs || body.carbs <= 0) {
    return NextResponse.json({ error: "carbs is required (grams > 0)" }, { status: 400 });
  }
  if (!body.currentGlucose || body.currentGlucose <= 0) {
    return NextResponse.json({ error: "currentGlucose is required (mg/dL > 0)" }, { status: 400 });
  }

  // Get current settings
  const timeOfDay = getTimeOfDay();

  const [icr, cf, target] = await Promise.all([
    db.insulinCarbRatio.findFirst({
      where: { timeOfDay, validUntil: null },
      orderBy: { validFrom: "desc" },
    }),
    db.correctionFactor.findFirst({
      where: { timeOfDay, validUntil: null },
      orderBy: { validFrom: "desc" },
    }),
    db.targetRange.findFirst({
      where: { timeOfDay, validUntil: null },
      orderBy: { validFrom: "desc" },
    }),
  ]);

  // Fallback to any timeOfDay if specific not found
  const ratio = icr?.ratio ?? (await db.insulinCarbRatio.findFirst({ orderBy: { validFrom: "desc" } }))?.ratio ?? 10;
  const factor = cf?.factor ?? (await db.correctionFactor.findFirst({ orderBy: { validFrom: "desc" } }))?.factor ?? 50;
  const targetGlucose = target
    ? (target.low + target.high) / 2
    : 110;

  // Calculate IOB
  const now = new Date();
  const recentDoses = await db.insulinDose.findMany({
    where: {
      timestamp: { gte: new Date(now.getTime() - 5 * 60 * 60 * 1000) },
      type: { in: ["rapid", "correction"] },
    },
  });
  const iob = calculateIOB(recentDoses, now);

  const exerciseContext = body.exerciseContext || null;
  const exerciseReduction = exerciseContext ? 0.25 : 0; // 25% reduction for pre-workout

  const result = calculateBolus({
    carbs: body.carbs,
    currentGlucose: body.currentGlucose,
    targetGlucose,
    icr: ratio,
    cf: factor,
    iob,
    exerciseReduction: exerciseReduction || undefined,
  });

  return NextResponse.json({
    ...result,
    settings: { icr: ratio, cf: factor, targetGlucose },
    iob: Math.round(iob * 100) / 100,
    exerciseReduction: exerciseReduction > 0 ? "25% pre-workout reduction applied" : "none",
  });
}

function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  if (h < 21) return "evening";
  return "night";
}
