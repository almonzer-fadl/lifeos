import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { addDays } from "date-fns";

export async function GET() {
  const now = new Date();
  const upcoming = addDays(now, 7);

  const [overdue, dueSoon] = await Promise.all([
    db.contact.findMany({
      where: {
        isActive: true,
        nextFollowUpAt: { lte: now },
      },
      orderBy: { nextFollowUpAt: "asc" },
    }),
    db.contact.findMany({
      where: {
        isActive: true,
        nextFollowUpAt: { gt: now, lte: upcoming },
      },
      orderBy: { nextFollowUpAt: "asc" },
    }),
  ]);

  return NextResponse.json({
    overdue,
    overdueCount: overdue.length,
    dueSoon,
    dueSoonCount: dueSoon.length,
  });
}
