import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const log = await db.habitLog.create({
    data: {
      habitId: body.habitId,
      date: body.date ? new Date(body.date) : new Date(),
      completed: body.completed ?? true,
      notes: body.notes || null,
    },
  });

  return NextResponse.json(log, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await db.habitLog.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
