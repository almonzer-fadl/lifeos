import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events, EventTypes } from "@/lib/events";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || new Date().toISOString().slice(0, 10);
  const d = new Date(date);
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  const logs = await db.prayerLog.findMany({
    where: { date: { gte: start, lt: end } },
    orderBy: { scheduledAt: "asc" },
  });

  return NextResponse.json(logs);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.prayer || !body.scheduledAt) {
    return NextResponse.json({ error: "prayer and scheduledAt are required" }, { status: 400 });
  }

  const d = new Date(body.date || new Date());
  d.setHours(0, 0, 0, 0);

  const log = await db.prayerLog.upsert({
    where: { date_prayer: { date: d, prayer: body.prayer } },
    create: {
      date: d,
      prayer: body.prayer,
      status: body.status || "on_time",
      prayedAt: body.prayedAt ? new Date(body.prayedAt) : new Date(),
      scheduledAt: new Date(body.scheduledAt),
      notes: body.notes || null,
    },
    update: {
      status: body.status || "on_time",
      prayedAt: body.prayedAt ? new Date(body.prayedAt) : new Date(),
      notes: body.notes || undefined,
    },
  });

  await events.emit(EventTypes.PRAYER_COMPLETED, {
    prayer: log.prayer, status: log.status, date: log.date.toISOString(),
  });

  return NextResponse.json(log, { status: 201 });
}
