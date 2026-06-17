import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const limit = Math.min(parseInt(searchParams.get("limit") || "30"), 100);

  const where: Record<string, unknown> = {};
  if (type) where.type = type;

  const sessions = await db.quranSession.findMany({
    where, orderBy: { date: "desc" }, take: limit,
  });
  return NextResponse.json(sessions);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.type) return NextResponse.json({ error: "type is required" }, { status: 400 });

  const progress = await db.quranProgress.findFirst();
  const session = await db.quranSession.create({
    data: {
      quranProgressId: progress?.id || null,
      date: body.date ? new Date(body.date) : new Date(),
      type: body.type,
      startPage: body.startPage ?? undefined,
      endPage: body.endPage ?? undefined,
      pagesMemorized: body.pagesMemorized ?? undefined,
      pagesRevised: body.pagesRevised ?? undefined,
      duration: body.duration ?? undefined,
      quality: body.quality ?? undefined,
      teacherVerified: body.teacherVerified ?? undefined,
      notes: body.notes || null,
    },
  });

  // Update progress if pages were memorized
  if (body.type === "new_memorization" && body.pagesMemorized && progress) {
    await db.quranProgress.update({
      where: { id: progress.id },
      data: { pagesMemorized: { increment: Math.round(body.pagesMemorized) }, currentPage: progress.currentPage ? progress.currentPage + Math.round(body.pagesMemorized) : undefined },
    });
  }

  return NextResponse.json(session, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await db.quranSession.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
