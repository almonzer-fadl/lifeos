import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { detectPR, formatPR } from "@/lib/prs";
import { events, EventTypes } from "@/lib/events";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const activityType = searchParams.get("activityType");

  const where: Record<string, unknown> = {};
  if (activityType) where.activityType = activityType;

  const prs = await db.personalRecord.findMany({
    where,
    orderBy: { achievedAt: "desc" },
  });

  const formatted = prs.map((pr) => ({
    ...pr,
    formatted: formatPR(pr.value, pr.metric, pr.unit),
  }));

  return NextResponse.json(formatted);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.activityType || !body.metric || body.value == null) {
    return NextResponse.json({ error: "activityType, metric, and value are required" }, { status: 400 });
  }

  // Check if this beats the existing record
  const existing = await db.personalRecord.findFirst({
    where: {
      activityType: body.activityType,
      distance: body.distance || null,
      metric: body.metric,
    },
  });

  const isTimeMetric = body.metric === "time";
  const isBetter = !existing || (isTimeMetric ? body.value < existing.value : body.value > existing.value);

  if (!isBetter) {
    return NextResponse.json({ isPR: false, existing: existing ? formatPR(existing.value, existing.metric, existing.unit) : null }, { status: 200 });
  }

  const pr = await db.personalRecord.upsert({
    where: {
      activityType_distance_metric: {
        activityType: body.activityType,
        distance: body.distance || 0,
        metric: body.metric,
      },
    },
    create: {
      activityType: body.activityType,
      distance: body.distance || null,
      metric: body.metric,
      value: body.value,
      unit: body.unit || "seconds",
      achievedAt: body.achievedAt ? new Date(body.achievedAt) : new Date(),
      activityId: body.activityId || null,
    },
    update: {
      value: body.value,
      achievedAt: body.achievedAt ? new Date(body.achievedAt) : new Date(),
      activityId: body.activityId || null,
    },
  });

  await events.emit(EventTypes.PR_ACHIEVED, {
    id: pr.id,
    activityType: pr.activityType,
    value: pr.value,
    metric: pr.metric,
    formatted: formatPR(pr.value, pr.metric, pr.unit),
  });

  return NextResponse.json({
    ...pr,
    formatted: formatPR(pr.value, pr.metric, pr.unit),
    isPR: true,
    previous: existing ? formatPR(existing.value, existing.metric, existing.unit) : null,
  }, { status: 201 });
}
