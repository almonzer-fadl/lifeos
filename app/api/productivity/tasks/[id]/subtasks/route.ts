import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const subtasks = await db.subtask.findMany({
    where: { taskId: id },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(subtasks);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  if (!body.title) return NextResponse.json({ error: "title is required" }, { status: 400 });

  const lastSubtask = await db.subtask.findFirst({
    where: { taskId: id },
    orderBy: { sortOrder: "desc" },
  });

  const subtask = await db.subtask.create({
    data: {
      taskId: id,
      title: body.title,
      status: "todo",
      sortOrder: (lastSubtask?.sortOrder || 0) + 1,
    },
  });

  return NextResponse.json(subtask, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (body.title) data.title = body.title;
  if (body.status && ["todo", "done"].includes(body.status)) data.status = body.status;
  if (body.sortOrder != null) data.sortOrder = body.sortOrder;

  const subtask = await db.subtask.update({ where: { id: body.id }, data });
  return NextResponse.json(subtask);
}
