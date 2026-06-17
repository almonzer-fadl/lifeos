import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "7");
  const since = new Date();
  since.setDate(since.getDate() - days);

  const records = await db.blockCompliance.findMany({
    where: { date: { gte: since } },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(records);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.blockName || !body.scheduledStart) {
    return NextResponse.json({ error: "blockName and scheduledStart are required" }, { status: 400 });
  }

  const scheduledStart = new Date(body.scheduledStart);
  const scheduledEnd = body.scheduledEnd ? new Date(body.scheduledEnd) : null;
  const actualStart = body.actualStart ? new Date(body.actualStart) : null;
  const actualEnd = body.actualEnd ? new Date(body.actualEnd) : null;

  // Calculate compliance score
  let compliance: number | null = null;
  if (actualStart && scheduledEnd) {
    const scheduledDuration = (scheduledEnd.getTime() - scheduledStart.getTime()) / (1000 * 60);
    const lateness = actualStart ? (actualStart.getTime() - scheduledStart.getTime()) / (1000 * 60) : 0;
    compliance = Math.max(0, 1 - lateness / Math.max(scheduledDuration, 1));
  }

  const record = await db.blockCompliance.upsert({
    where: {
      date_blockName: {
        date: scheduledStart,
        blockName: body.blockName,
      },
    },
    update: {
      actualStart,
      actualEnd,
      compliance,
      activity: body.activity || null,
      notes: body.notes || null,
    },
    create: {
      date: scheduledStart,
      blockName: body.blockName,
      scheduledStart: scheduledStart,
      scheduledEnd: scheduledEnd || scheduledStart,
      actualStart,
      actualEnd,
      compliance,
      activity: body.activity || null,
      notes: body.notes || null,
    },
  });

  return NextResponse.json(record, { status: 201 });
}
