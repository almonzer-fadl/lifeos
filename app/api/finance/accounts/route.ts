import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const accounts = await db.account.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(accounts);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const account = await db.account.create({
    data: {
      name: body.name,
      currency: body.currency || "USD",
      type: body.type || "checking",
      initialBalance: body.initialBalance || 0,
      notes: body.notes || null,
    },
  });

  return NextResponse.json(account, { status: 201 });
}
