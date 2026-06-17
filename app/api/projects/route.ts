import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/api-middleware";
import { DEFAULTS } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const type = searchParams.get("type");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (type) where.type = type;

  const projects = await db.project.findMany({
    where,
    orderBy: [{ priority: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { tasks: true, milestones: true } },
    },
  });

  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  const limit = checkRateLimit(request, DEFAULTS.MUTATION);
  if (limit) return limit;

  const body = await request.json();
  if (!body.name) return NextResponse.json({ error: "name is required" }, { status: 400 });

  const validTypes = ["agency", "saas", "internal_tool", "client_app", "personal_vision"];
  const validStatuses = [
    "ideation", "building", "launched", "active", "maintenance", "paused", "completed", "archived",
  ];

  const project = await db.project.create({
    data: {
      name: body.name,
      description: body.description || null,
      type: body.type && validTypes.includes(body.type) ? body.type : "saas",
      status: body.status && validStatuses.includes(body.status) ? body.status : "ideation",
      revenueModel: body.revenueModel || null,
      mrr: body.mrr || 0,
      arr: body.arr || 0,
      totalRevenue: body.totalRevenue || 0,
      pipelineStages: body.pipelineStages || null,
      activeDeals: body.activeDeals || 0,
      dealsWon: body.dealsWon || 0,
      dealValue: body.dealValue || 0,
      stack: body.stack || null,
      repoUrl: body.repoUrl || null,
      deployUrl: body.deployUrl || null,
      port: body.port || null,
      startedAt: body.startedAt ? new Date(body.startedAt) : null,
      launchedAt: body.launchedAt ? new Date(body.launchedAt) : null,
      completedAt: body.completedAt ? new Date(body.completedAt) : null,
      estimatedEffort: body.estimatedEffort || null,
      priority: body.priority || 3,
      nextAction: body.nextAction || null,
      weeklyGoal: body.weeklyGoal || null,
      color: body.color || null,
      icon: body.icon || null,
      notes: body.notes || null,
    },
  });

  return NextResponse.json(project, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const existing = await db.project.findUnique({ where: { id: body.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const validTypes = ["agency", "saas", "internal_tool", "client_app", "personal_vision"];
  const validStatuses = [
    "ideation", "building", "launched", "active", "maintenance", "paused", "completed", "archived",
  ];

  const data: Record<string, unknown> = {};
  if (body.name) data.name = body.name;
  if (body.description !== undefined) data.description = body.description;
  if (body.type && validTypes.includes(body.type)) data.type = body.type;
  if (body.status && validStatuses.includes(body.status)) data.status = body.status;
  if (body.revenueModel !== undefined) data.revenueModel = body.revenueModel;
  if (body.mrr != null) data.mrr = body.mrr;
  if (body.arr != null) data.arr = body.arr;
  if (body.totalRevenue != null) data.totalRevenue = body.totalRevenue;
  if (body.pipelineStages !== undefined) data.pipelineStages = body.pipelineStages;
  if (body.activeDeals != null) data.activeDeals = body.activeDeals;
  if (body.dealsWon != null) data.dealsWon = body.dealsWon;
  if (body.dealValue != null) data.dealValue = body.dealValue;
  if (body.stack !== undefined) data.stack = body.stack;
  if (body.repoUrl !== undefined) data.repoUrl = body.repoUrl;
  if (body.deployUrl !== undefined) data.deployUrl = body.deployUrl;
  if (body.port !== undefined) data.port = body.port;
  if (body.startedAt !== undefined) data.startedAt = body.startedAt ? new Date(body.startedAt) : null;
  if (body.launchedAt !== undefined) data.launchedAt = body.launchedAt ? new Date(body.launchedAt) : null;
  if (body.completedAt !== undefined) data.completedAt = body.completedAt ? new Date(body.completedAt) : null;
  if (body.estimatedEffort !== undefined) data.estimatedEffort = body.estimatedEffort;
  if (body.priority != null) data.priority = body.priority;
  if (body.nextAction !== undefined) data.nextAction = body.nextAction;
  if (body.weeklyGoal !== undefined) data.weeklyGoal = body.weeklyGoal;
  if (body.color !== undefined) data.color = body.color;
  if (body.icon !== undefined) data.icon = body.icon;
  if (body.notes !== undefined) data.notes = body.notes;

  const project = await db.project.update({
    where: { id: body.id },
    data,
  });

  return NextResponse.json(project);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  await db.project.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
