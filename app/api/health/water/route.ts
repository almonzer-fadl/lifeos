import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { schemas } from "@/lib/validate";
import { validateBody } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  const where: Record<string, unknown> = {};
  if (date) {
    const d = new Date(date);
    where.date = {
      gte: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
      lt: new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1),
    };
  }

  const logs = await db.waterLog.findMany({ where, orderBy: { date: "desc" }, take: 50 });
  return NextResponse.json(logs);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const validation = validateBody(schemas.water, body);
  if (validation.error) return validation.error;
  if (!validation.data) return NextResponse.json({ error: "Validation failed" }, { status: 400 });

  const log = await db.waterLog.create({
    data: { amountMl: validation.data.amountMl, date: body.date ? new Date(body.date) : new Date() },
  });

  return NextResponse.json(log, { status: 201 });
}
