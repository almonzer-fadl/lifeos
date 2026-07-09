import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_request: NextRequest) {
  let progress = await db.quranProgress.findFirst({ include: { sessions: { orderBy: { date: "desc" }, take: 10 } } });

  if (!progress) {
    progress = await db.quranProgress.create({
      data: {
        totalPages: 604, pagesMemorized: 35, currentJuz: 2, currentPage: 35,
        startedAt: new Date("2026-02-05"), teacher: "Aunt",
        method: "flow-through revision then new memorization",
        targetDate: new Date("2030-01-01"),
      },
      include: { sessions: { orderBy: { date: "desc" }, take: 10 } },
    });
  }

  const sessions = await db.quranSession.findMany({
    where: { type: "new_memorization" },
    orderBy: { date: "desc" }, take: 30,
  });

  const fourWeeksAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);
  const recentPages = sessions
    .filter((s) => new Date(s.date) >= fourWeeksAgo)
    .reduce((sum, s) => sum + (s.pagesMemorized || 0), 0);
  const avgPerWeek = recentPages / 4;
  const remaining = progress.totalPages - progress.pagesMemorized;
  const weeksRemaining = avgPerWeek > 0 ? remaining / avgPerWeek : 999;
  const projectedDate = new Date(); projectedDate.setDate(projectedDate.getDate() + weeksRemaining * 7);

  return NextResponse.json({
    ...progress,
    pagesRemaining: remaining,
    avgPagesPerWeek: Math.round(avgPerWeek * 10) / 10,
    weeksRemaining: Math.round(weeksRemaining),
    projectedCompletion: projectedDate.toISOString().slice(0, 10),
    onTrack: projectedDate <= new Date("2030-01-01"),
  });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const progress = await db.quranProgress.findFirst();
  if (!progress) return NextResponse.json({ error: "No progress record" }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (body.pagesMemorized !== undefined) data.pagesMemorized = body.pagesMemorized;
  if (body.currentJuz !== undefined) data.currentJuz = body.currentJuz;
  if (body.currentSurah) data.currentSurah = body.currentSurah;
  if (body.currentPage !== undefined) data.currentPage = body.currentPage;
  if (body.notes !== undefined) data.notes = body.notes;

  const updated = await db.quranProgress.update({ where: { id: progress.id }, data });
  return NextResponse.json(updated);
}
