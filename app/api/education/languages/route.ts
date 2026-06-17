import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const languages = await db.languageProgress.findMany({
    orderBy: { language: "asc" },
    include: { _count: { select: { sessions: true } } },
  });
  return NextResponse.json(languages);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.language || !body.currentLevel || !body.targetLevel) {
    return NextResponse.json({ error: "language, currentLevel, and targetLevel are required" }, { status: 400 });
  }

  const lang = await db.languageProgress.create({
    data: {
      language: body.language,
      currentLevel: body.currentLevel,
      targetLevel: body.targetLevel,
      targetDate: body.targetDate ? new Date(body.targetDate) : null,
      notes: body.notes || null,
    },
  });

  return NextResponse.json(lang, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (body.currentLevel) data.currentLevel = body.currentLevel;
  if (body.targetLevel) data.targetLevel = body.targetLevel;
  if (body.targetDate !== undefined) data.targetDate = body.targetDate ? new Date(body.targetDate) : null;
  if (body.streakDays != null) data.streakDays = body.streakDays;
  if (body.totalMinutes != null) data.totalMinutes = body.totalMinutes;
  if (body.totalSessions != null) data.totalSessions = body.totalSessions;

  const lang = await db.languageProgress.update({ where: { id: body.id }, data });
  return NextResponse.json(lang);
}
