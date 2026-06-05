import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const habits = await db.habit.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      logs: {
        where: {
          date: {
            gte: new Date(new Date().setDate(new Date().getDate() - 7)),
          },
        },
      },
    },
  });

  return NextResponse.json(habits);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const habit = await db.habit.create({
    data: {
      name: body.name,
      frequency: body.frequency || "daily",
      frequencyCount: body.frequencyCount || 1,
      timeOfDay: body.timeOfDay || null,
      category: body.category || null,
      color: body.color || null,
    },
    include: { logs: true },
  });

  return NextResponse.json(habit, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await db.habit.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
