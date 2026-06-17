import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const assignments = await db.assignment.findMany({
    where: { courseId: id },
    orderBy: { dueDate: "asc" },
  });
  return NextResponse.json(assignments);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  if (!body.title || !body.dueDate) {
    return NextResponse.json({ error: "title and dueDate are required" }, { status: 400 });
  }

  const percentage = body.score != null ? ((body.score / (body.maxScore || 100)) * 100) : null;

  const assignment = await db.assignment.create({
    data: {
      courseId: id,
      title: body.title,
      description: body.description || null,
      dueDate: new Date(body.dueDate),
      weight: body.weight || null,
      score: body.score || null,
      maxScore: body.maxScore || 100,
      percentage,
      status: body.status || "pending",
      grade: body.grade || null,
      notes: body.notes || null,
    },
  });

  return NextResponse.json(assignment, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (body.title) data.title = body.title;
  if (body.dueDate) data.dueDate = new Date(body.dueDate);
  if (body.submittedDate !== undefined) data.submittedDate = body.submittedDate ? new Date(body.submittedDate) : null;
  if (body.weight !== undefined) data.weight = body.weight;
  if (body.score !== undefined) {
    data.score = body.score;
    data.percentage = body.score != null ? ((body.score / (body.maxScore || 100)) * 100) : null;
  }
  if (body.maxScore !== undefined) data.maxScore = body.maxScore;
  if (body.status) data.status = body.status;
  if (body.grade !== undefined) data.grade = body.grade;

  const assignment = await db.assignment.update({
    where: { id: body.id },
    data,
  });

  return NextResponse.json(assignment);
}
