import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const books = await db.book.findMany({
    where: { status: "to_read" },
    orderBy: { createdAt: "asc" },
    take: 20,
  });
  return NextResponse.json(books);
}
