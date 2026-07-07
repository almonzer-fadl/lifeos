import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const projects = await db.project.findMany({
    where: {
      status: { notIn: ["completed", "archived"] },
      nextAction: { not: null },
    },
    orderBy: [{ priority: "asc" }],
    select: {
      id: true,
      name: true,
      nextAction: true,
      priority: true,
      color: true,
    },
  });

  return NextResponse.json(projects);
}
