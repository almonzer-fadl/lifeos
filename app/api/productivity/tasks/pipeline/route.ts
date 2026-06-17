import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const stages = (project.pipelineStages as string[]) || [];
  const tasks = await db.task.findMany({
    where: {
      projectId,
      pipelineStage: { not: null },
    },
    orderBy: { createdAt: "asc" },
    include: {
      subtaskItems: true,
    },
  });

  const columns: Record<string, typeof tasks> = {};
  for (const stage of stages) {
    columns[stage] = [];
  }
  columns["No Stage"] = [];

  for (const task of tasks) {
    const stage = task.pipelineStage || "No Stage";
    if (!columns[stage]) columns[stage] = [];
    columns[stage].push(task);
  }

  return NextResponse.json({
    projectId,
    projectName: project.name,
    stages,
    columns,
  });
}
