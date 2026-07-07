import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const [activeProjects, visions, totalMRR] = await Promise.all([
    db.project.findMany({
      where: {
        status: { notIn: ["completed", "archived"] },
      },
      orderBy: [{ priority: "asc" }, { name: "asc" }],
      include: {
        _count: { select: { tasks: true, milestones: true } },
      },
    }),
    db.project.findMany({
      where: { type: "personal_vision" },
      orderBy: { priority: "asc" },
    }),
    db.project.aggregate({
      _sum: { mrr: true },
      where: { status: { notIn: ["completed", "archived"] } },
    }),
  ]);

  const nextActions = activeProjects
    .filter((p) => p.nextAction)
    .slice(0, 5)
    .map((p) => ({ projectId: p.id, projectName: p.name, action: p.nextAction }));

  return NextResponse.json({
    activeProjects,
    visions,
    totalMRR: totalMRR._sum.mrr || 0,
    activeCount: activeProjects.length,
    nextActions,
  });
}
