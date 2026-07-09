import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const surah = searchParams.get("surah");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

  const where: Record<string, unknown> = {};
  if (surah) where.surah = surah;

  const entries = await db.tafsirEntry.findMany({
    where, orderBy: { date: "desc" }, take: limit,
  });
  return NextResponse.json(entries);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.surah || !body.ayahRange || !body.notes) {
    return NextResponse.json({ error: "surah, ayahRange, and notes are required" }, { status: 400 });
  }

  const entry = await db.tafsirEntry.create({
    data: {
      date: body.date ? new Date(body.date) : new Date(),
      surah: body.surah,
      ayahRange: body.ayahRange,
      notes: body.notes,
      source: body.source || null,
    },
  });
  return NextResponse.json(entry, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await db.tafsirEntry.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
