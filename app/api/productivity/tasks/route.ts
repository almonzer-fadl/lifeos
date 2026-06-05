import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const projectId = searchParams.get("projectId");
  const limit = parseInt(searchParams.get("limit") || "50");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (projectId) where.projectId = projectId;

  const tasks = await db.task.findMany({
    where,
    orderBy: [{ status: "asc" }, { priority: "desc" }, { dueDate: "asc" }],
    take: Math.min(limit, 200),
    include: { project: true },
  });

  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const task = await db.task.create({
    data: {
      title: body.title,
      description: body.description || null,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      priority: body.priority || "medium",
      status: body.status || "todo",
      projectId: body.projectId || null,
      tags: body.tags || null,
    },
    include: { project: true },
  });

  return NextResponse.json(task, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, ...data } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  if (data.dueDate) data.dueDate = new Date(data.dueDate);
  if (data.status === "done") data.completedAt = new Date();

  const task = await db.task.update({
    where: { id },
    data,
    include: { project: true },
  });

  return NextResponse.json(task);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await db.task.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
