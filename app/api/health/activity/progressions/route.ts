import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const exerciseName = searchParams.get("exerciseName");

  const where: Record<string, unknown> = {};
  if (exerciseName) where.exerciseName = exerciseName;

  const progressions = await db.exerciseProgression.findMany({
    where,
    orderBy: { exerciseName: "asc" },
  });

  return NextResponse.json(progressions);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.exerciseName || !body.progressionStep || body.currentReps == null || body.targetReps == null) {
    return NextResponse.json({ error: "exerciseName, progressionStep, currentReps, and targetReps are required" }, { status: 400 });
  }

  const prog = await db.exerciseProgression.upsert({
    where: {
      exerciseName_progressionStep: {
        exerciseName: body.exerciseName,
        progressionStep: body.progressionStep,
      },
    },
    create: {
      exerciseName: body.exerciseName,
      progressionStep: body.progressionStep,
      currentReps: body.currentReps,
      targetReps: body.targetReps,
      notes: body.notes || null,
    },
    update: {
      currentReps: body.currentReps,
      targetReps: body.targetReps,
      achievedAt: body.currentReps >= body.targetReps ? new Date() : undefined,
      notes: body.notes || null,
    },
  });

  return NextResponse.json(prog, { status: 201 });
}
