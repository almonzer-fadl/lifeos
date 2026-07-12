import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const exams = await db.exam.findMany({
    where: { courseId: id },
    orderBy: { date: "asc" },
  });
  return NextResponse.json(exams);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  if (!body.title || !body.date) {
    return NextResponse.json({ error: "title and date are required" }, { status: 400 });
  }

  const percentage = body.score != null ? ((body.score / (body.maxScore || 100)) * 100) : null;

  const exam = await db.exam.create({
    data: {
      courseId: id,
      title: body.title,
      date: new Date(body.date),
      duration: body.duration || null,
      location: body.location || null,
      weight: body.weight || null,
      score: body.score || null,
      maxScore: body.maxScore || 100,
      percentage,
      grade: body.grade || null,
      notes: body.notes || null,
    },
  });

  return NextResponse.json(exam, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (body.title) data.title = body.title;
  if (body.date) data.date = new Date(body.date);
  if (body.duration !== undefined) data.duration = body.duration;
  if (body.location !== undefined) data.location = body.location;
  if (body.weight !== undefined) data.weight = body.weight;
  if (body.score !== undefined) {
    data.score = body.score;
    data.percentage = body.score != null ? ((body.score / (body.maxScore || 100)) * 100) : null;
  }
  if (body.grade !== undefined) data.grade = body.grade;

  const exam = await db.exam.update({ where: { id: body.id }, data });
  return NextResponse.json(exam);
}
