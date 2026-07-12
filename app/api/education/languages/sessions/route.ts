import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.languageId || !body.duration || !body.activity) {
    return NextResponse.json({ error: "languageId, duration, and activity are required" }, { status: 400 });
  }

  const session = await db.languageSession.create({
    data: {
      languageId: body.languageId,
      date: body.date ? new Date(body.date) : new Date(),
      duration: body.duration,
      activity: body.activity,
      notes: body.notes || null,
    },
  });

  // Update language stats
  const lang = await db.languageProgress.findUnique({ where: { id: body.languageId } });
  if (lang) {
    await db.languageProgress.update({
      where: { id: body.languageId },
      data: {
        totalMinutes: lang.totalMinutes + body.duration,
        totalSessions: lang.totalSessions + 1,
      },
    });
  }

  return NextResponse.json(session, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  await db.languageSession.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
