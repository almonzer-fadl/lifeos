import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const semester = searchParams.get("semester");

  const where: Record<string, unknown> = { isActive: true };
  if (semester) where.semester = semester;

  const courses = await db.course.findMany({
    where,
    include: {
      _count: { select: { assignments: true, exams: true } },
    },
    orderBy: { code: "asc" },
  });

  return NextResponse.json(courses);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.code || !body.name || !body.semester || !body.credits) {
    return NextResponse.json({ error: "code, name, semester, and credits are required" }, { status: 400 });
  }

  const course = await db.course.create({
    data: {
      code: body.code,
      name: body.name,
      semester: body.semester,
      credits: body.credits,
      instructor: body.instructor || null,
      schedule: body.schedule || null,
      color: body.color || null,
      targetGrade: body.targetGrade || null,
    },
  });

  return NextResponse.json(course, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await db.course.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
