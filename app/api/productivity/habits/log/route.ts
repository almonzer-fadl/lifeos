import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { schemas } from "@/lib/validate";
import { validateBody } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const validation = validateBody(schemas.habitLog, body);
  if (validation.error) return validation.error;
  if (!validation.data) return NextResponse.json({ error: "Validation failed" }, { status: 400 });

  const log = await db.habitLog.create({
    data: {
      habitId: validation.data.habitId,
      date: body.date ? new Date(body.date) : new Date(),
      completed: validation.data.completed,
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
