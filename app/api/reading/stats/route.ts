import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const [books, complete, reading] = await Promise.all([
    db.book.count(),
    db.book.count({ where: { status: "completed" } }),
    db.book.count({ where: { status: "reading" } }),
  ]);

  const rated = await db.book.aggregate({
    _avg: { rating: true },
    where: { rating: { not: null } },
  });

  const thisYear = new Date().getFullYear();
  const thisYearCount = await db.book.count({
    where: {
      status: "completed",
      completedAt: {
        gte: new Date(thisYear, 0, 1),
        lt: new Date(thisYear + 1, 0, 1),
      },
    },
  });

  return NextResponse.json({
    total: books,
    completed: complete,
    reading,
    avgRating: rated._avg.rating ? Math.round(rated._avg.rating * 10) / 10 : 0,
    thisYear: thisYearCount,
  });
}
