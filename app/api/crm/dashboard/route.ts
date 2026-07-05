import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const now = new Date();

  const [keyPeople, needsAttention, overdueFollowUps] = await Promise.all([
    db.contact.findMany({
      where: { isKeyPerson: true, isActive: true },
      orderBy: { fullName: "asc" },
      include: {
        group: true,
        _count: { select: { interactions: true } },
      },
      take: 6,
    }),
    db.contact.findMany({
      where: {
        isActive: true,
        OR: [
          { relationshipHealth: "needs_attention" },
          { relationshipHealth: "strained" },
        ],
      },
      orderBy: { fullName: "asc" },
      take: 5,
    }),
    db.contact.findMany({
      where: {
        isActive: true,
        nextFollowUpAt: { lte: now },
      },
      orderBy: { nextFollowUpAt: "asc" },
      take: 10,
    }),
  ]);

  return NextResponse.json({
    keyPeople,
    needsAttention,
    overdueFollowUps,
  });
}
