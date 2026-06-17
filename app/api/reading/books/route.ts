import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const category = searchParams.get("category");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (category) where.category = category;

  const books = await db.book.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { notes: true } } },
  });

  return NextResponse.json(books);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.title || !body.author) {
    return NextResponse.json({ error: "title and author are required" }, { status: 400 });
  }

  const book = await db.book.create({
    data: {
      title: body.title,
      author: body.author,
      isbn: body.isbn || null,
      coverUrl: body.coverUrl || null,
      status: body.status || "to_read",
      category: body.category || null,
      format: body.format || null,
      pageCount: body.pageCount || null,
      currentPage: body.currentPage || 0,
      summary: body.summary || null,
      keyQuote: body.keyQuote || null,
      actionItems: body.actionItems || null,
      startedAt: body.startedAt ? new Date(body.startedAt) : null,
      rating: body.rating || null,
      difficulty: body.difficulty || null,
    },
  });

  return NextResponse.json(book, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (body.title) data.title = body.title;
  if (body.author) data.author = body.author;
  if (body.status) data.status = body.status;
  if (body.rating != null) data.rating = body.rating;
  if (body.difficulty != null) data.difficulty = body.difficulty;
  if (body.currentPage != null) data.currentPage = body.currentPage;
  if (body.pageCount != null) data.pageCount = body.pageCount;
  if (body.summary !== undefined) data.summary = body.summary;
  if (body.keyQuote !== undefined) data.keyQuote = body.keyQuote;
  if (body.actionItems !== undefined) data.actionItems = body.actionItems;
  if (body.category !== undefined) data.category = body.category;
  if (body.completedAt !== undefined) data.completedAt = body.completedAt ? new Date(body.completedAt) : null;

  const book = await db.book.update({ where: { id: body.id }, data });
  return NextResponse.json(book);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await db.book.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
