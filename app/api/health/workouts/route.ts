import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const limit = parseInt(searchParams.get("limit") || "30");

  const where: Record<string, unknown> = {};
  if (from || to) {
    where.date = {};
    if (from) (where.date as Record<string, string>).gte = from;
    if (to) (where.date as Record<string, string>).lte = to;
  }

  const workouts = await db.gymWorkout.findMany({
    where,
    orderBy: { date: "desc" },
    take: Math.min(limit, 100),
    include: {
      sets: {
        include: { exercise: true },
        orderBy: { setNumber: "asc" },
      },
    },
  });

  return NextResponse.json(workouts);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const workout = await db.gymWorkout.create({
    data: {
      date: body.date ? new Date(body.date) : new Date(),
      name: body.name || "Workout",
      notes: body.notes || null,
      duration: body.duration || null,
      sets: body.sets
        ? {
            create: body.sets.map((s: { exerciseId: string; setNumber: number; weight?: number; reps?: number; rpe?: number; notes?: string }) => ({
              exerciseId: s.exerciseId,
              setNumber: s.setNumber,
              weight: s.weight || null,
              reps: s.reps || null,
              rpe: s.rpe || null,
              notes: s.notes || null,
            })),
          }
        : undefined,
    },
    include: {
      sets: { include: { exercise: true } },
    },
  });

  return NextResponse.json(workout, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await db.gymWorkout.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
