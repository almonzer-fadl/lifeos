import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const project = await db.project.findUnique({
    where: { id },
    include: {
      tasks: { orderBy: { status: "asc" }, take: 20 },
      milestones: { orderBy: { sortOrder: "asc" } },
      mrrSnapshots: { orderBy: { date: "desc" }, take: 12 },
      invoices: { orderBy: { issuedDate: "desc" }, take: 5 },
      _count: { select: { tasks: true } },
    },
  });

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(project);
}
