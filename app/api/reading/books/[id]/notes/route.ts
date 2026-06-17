import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const notes = await db.bookNote.findMany({
    where: { bookId: id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(notes);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  if (!body.note) return NextResponse.json({ error: "note is required" }, { status: 400 });

  const bookNote = await db.bookNote.create({
    data: {
      bookId: id,
      chapter: body.chapter || null,
      quote: body.quote || null,
      note: body.note,
      type: body.type || "highlight",
      page: body.page || null,
    },
  });

  return NextResponse.json(bookNote, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await db.bookNote.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
