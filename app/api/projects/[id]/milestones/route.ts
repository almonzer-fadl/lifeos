import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const milestones = await db.projectMilestone.findMany({
    where: { projectId: id },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(milestones);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  if (!body.title) return NextResponse.json({ error: "title is required" }, { status: 400 });

  const milestone = await db.projectMilestone.create({
    data: {
      projectId: id,
      title: body.title,
      description: body.description || null,
      targetDate: body.targetDate ? new Date(body.targetDate) : null,
      status: "pending",
      sortOrder: body.sortOrder || 0,
    },
  });

  return NextResponse.json(milestone, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (body.title) data.title = body.title;
  if (body.description !== undefined) data.description = body.description;
  if (body.targetDate !== undefined) data.targetDate = body.targetDate ? new Date(body.targetDate) : null;
  if (body.status) {
    const validStatuses = ["pending", "achieved", "missed"];
    if (validStatuses.includes(body.status)) {
      data.status = body.status;
      if (body.status === "achieved") data.achievedAt = new Date();
    }
  }
  if (body.sortOrder != null) data.sortOrder = body.sortOrder;

  const milestone = await db.projectMilestone.update({
    where: { id: body.id },
    data,
  });

  return NextResponse.json(milestone);
}
