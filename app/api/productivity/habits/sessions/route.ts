import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events, EventTypes } from "@/lib/events";
import { recalculateStreak } from "@/lib/streaks";
import { checkRateLimit } from "@/lib/api-middleware";
import { DEFAULTS } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const limit = checkRateLimit(request, DEFAULTS.MUTATION);
  if (limit) return limit;

  const body = await request.json();

  if (!body.habitId) {
    return NextResponse.json({ error: "habitId is required" }, { status: 400 });
  }

  const habit = await db.habit.findUnique({ where: { id: body.habitId } });
  if (!habit) return NextResponse.json({ error: "Habit not found" }, { status: 404 });

  const session = await db.habitSession.create({
    data: {
      habitId: body.habitId,
      date: body.date ? new Date(body.date) : new Date(),
      completedAt: body.completedAt ? new Date(body.completedAt) : new Date(),
      timeOfDay: body.timeOfDay || null,
      value: body.value || null,
      notes: body.notes || null,
    },
  });

  // Also create a HabitLog entry for streak tracking
  await db.habitLog.create({
    data: {
      habitId: body.habitId,
      date: body.date ? new Date(body.date) : new Date(),
      completed: true,
      completedAt: body.completedAt ? new Date(body.completedAt) : new Date(),
      value: body.value || null,
      timeOfDay: body.timeOfDay || null,
      notes: body.notes || null,
    },
  });

  // Recalculate streak
  await recalculateStreak(body.habitId);

  // Emit event
  events
    .emit(EventTypes.HABIT_COMPLETED, {
      habitId: body.habitId,
      name: habit.name,
      date: new Date().toISOString(),
    })
    .catch(() => {});

  return NextResponse.json(session, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const session = await db.habitSession.findUnique({ where: { id } });
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.habitSession.delete({ where: { id } });

  // Recalculate streak
  await recalculateStreak(session.habitId);

  return NextResponse.json({ success: true });
}
