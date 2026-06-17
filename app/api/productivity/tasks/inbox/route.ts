import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const tasks = await db.task.findMany({
    where: { isQuickCapture: true, status: "todo" },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.title) return NextResponse.json({ error: "title is required" }, { status: 400 });

  const task = await db.task.create({
    data: {
      title: body.title,
      description: body.description || null,
      priority: "medium",
      status: "todo",
      isQuickCapture: true,
      energyLevel: body.energyLevel || null,
      timeBlockSlot: body.timeBlockSlot || null,
    },
  });

  return NextResponse.json(task, { status: 201 });
}
