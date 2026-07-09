import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateCompliance } from "@/lib/sleep-compliance";
import { events, EventTypes } from "@/lib/events";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || new Date().toISOString().slice(0, 10);
  const d = new Date(date);

  let routine = await db.bedtimeRoutine.findUnique({ where: { date: d } });
  if (!routine) {
    routine = await db.bedtimeRoutine.create({
      data: { date: d },
    });
  }

  const compliance = calculateCompliance({
    screensOffAt: routine.screensOffAt,
    inBedAt: routine.inBedAt,
    wakeAt: routine.wakeAt,
    preSleepActivity: routine.preSleepActivity,
    lateMeal: routine.lateMeal,
    whiteNoiseOn: routine.whiteNoiseOn,
  });

  return NextResponse.json({ ...routine, compliance });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const date = body.date ? new Date(body.date) : new Date();

  const data: Record<string, unknown> = {};
  if (body.screensOffAt) data.screensOffAt = new Date(body.screensOffAt);
  if (body.inBedAt) data.inBedAt = new Date(body.inBedAt);
  if (body.lightsOutAt) data.lightsOutAt = new Date(body.lightsOutAt);
  if (body.wakeAt) data.wakeAt = new Date(body.wakeAt);
  if (body.whiteNoiseOn !== undefined) data.whiteNoiseOn = body.whiteNoiseOn;
  if (body.preSleepActivity) data.preSleepActivity = body.preSleepActivity;
  if (body.caffeinatedAfter) data.caffeinatedAfter = new Date(body.caffeinatedAfter);
  if (body.lateMeal !== undefined) data.lateMeal = body.lateMeal;
  if (body.notes) data.notes = body.notes;

  const routine = await db.bedtimeRoutine.upsert({
    where: { date },
    create: { date, ...data as Record<string, unknown> },
    update: data,
  });

  const compliance = calculateCompliance({
    screensOffAt: routine.screensOffAt,
    inBedAt: routine.inBedAt,
    wakeAt: routine.wakeAt,
    preSleepActivity: routine.preSleepActivity,
    lateMeal: routine.lateMeal,
    whiteNoiseOn: routine.whiteNoiseOn,
  });

  return NextResponse.json({ ...routine, compliance }, { status: 201 });
}
