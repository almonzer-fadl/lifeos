import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const contact = await db.contact.findUnique({
    where: { id },
    include: {
      group: true,
      interactions: { orderBy: { date: "desc" }, take: 20 },
      invoices: { orderBy: { issuedDate: "desc" }, take: 10 },
      _count: { select: { interactions: true } },
    },
  });

  if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(contact);
}
