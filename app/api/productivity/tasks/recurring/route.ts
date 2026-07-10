import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/api-middleware";
import { DEFAULTS } from "@/lib/rate-limit";

export async function GET() {
  const templates = await db.recurringTaskTemplate.findMany({
    orderBy: { createdAt: "asc" },
    include: { project: true },
  });
  return NextResponse.json(templates);
}

export async function POST(request: NextRequest) {
  const limit = checkRateLimit(request, DEFAULTS.MUTATION);
  if (limit) return limit;

  const body = await request.json();
  if (!body.title || !body.frequency) {
    return NextResponse.json({ error: "title and frequency are required" }, { status: 400 });
  }

  const validFrequencies = ["daily", "weekly", "monthly", "weekdays"];
  if (!validFrequencies.includes(body.frequency)) {
    return NextResponse.json({ error: `frequency must be one of: ${validFrequencies.join(", ")}` }, { status: 400 });
  }

  const template = await db.recurringTaskTemplate.create({
    data: {
      title: body.title,
      description: body.description || null,
      priority: body.priority || "medium",
      projectId: body.projectId || null,
      energyLevel: body.energyLevel || null,
      timeBlockSlot: body.timeBlockSlot || null,
      frequency: body.frequency,
      frequencyCount: body.frequencyCount || 1,
      timeOfDay: body.timeOfDay || null,
      estimatedMinutes: body.estimatedMinutes || null,
      isActive: body.isActive !== false,
    },
  });

  return NextResponse.json(template, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (body.title) data.title = body.title;
  if (body.description !== undefined) data.description = body.description;
  if (body.priority) data.priority = body.priority;
  if (body.projectId !== undefined) data.projectId = body.projectId;
  if (body.energyLevel !== undefined) data.energyLevel = body.energyLevel;
  if (body.timeBlockSlot !== undefined) data.timeBlockSlot = body.timeBlockSlot;
  if (body.frequency) {
    const valid = ["daily", "weekly", "monthly", "weekdays"];
    if (valid.includes(body.frequency)) data.frequency = body.frequency;
  }
  if (body.estimatedMinutes !== undefined) data.estimatedMinutes = body.estimatedMinutes;
  if (body.isActive !== undefined) data.isActive = body.isActive;

  const template = await db.recurringTaskTemplate.update({
    where: { id: body.id },
    data,
  });

  return NextResponse.json(template);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  await db.recurringTaskTemplate.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
