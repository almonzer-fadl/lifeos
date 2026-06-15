import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const muscleGroup = searchParams.get("muscle") || "";
  const limit = parseInt(searchParams.get("limit") || "50");

  const where: Record<string, unknown> = {};

  if (q) {
    where.name = { contains: q, mode: "insensitive" };
  }
  if (muscleGroup) {
    where.muscleGroup = { contains: muscleGroup, mode: "insensitive" };
  }

  const exercises = await db.exercise.findMany({
    where,
    take: Math.min(limit, 100),
    orderBy: { name: "asc" },
  });

  return NextResponse.json(exercises);
}
