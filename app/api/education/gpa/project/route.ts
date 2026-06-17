import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.courseId || !body.expectedGrades) {
    return NextResponse.json({ error: "courseId and expectedGrades are required" }, { status: 400 });
  }

  const course = await db.course.findUnique({
    where: { id: body.courseId },
    include: { assignments: true, exams: true },
  });
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  // Simple projection: weighted average
  let earnedWeight = 0;
  let earnedPoints = 0;
  let remainingWeight = 0;

  for (const a of course.assignments) {
    if (a.percentage != null) {
      earnedWeight += a.weight || 0;
      earnedPoints += (a.percentage / 100) * (a.weight || 0) * 100;
    } else {
      remainingWeight += a.weight || 0;
    }
  }
  for (const e of course.exams) {
    if (e.percentage != null) {
      earnedWeight += e.weight || 0;
      earnedPoints += (e.percentage / 100) * (e.weight || 0) * 100;
    } else {
      remainingWeight += e.weight || 0;
    }
  }

  const currentGrade = earnedWeight > 0 ? earnedPoints / earnedWeight : 0;
  const totalWeight = earnedWeight + remainingWeight;

  // Project with expected grades
  const expectedGrades = body.expectedGrades as Record<string, number>;
  let projectedPoints = earnedPoints;
  for (const [id, score] of Object.entries(expectedGrades)) {
    const item = [...course.assignments, ...course.exams].find((i) => i.id === id);
    if (item && item.weight) {
      projectedPoints += (score / 100) * item.weight * 100;
    }
  }

  const projectedGrade = totalWeight > 0 ? projectedPoints / totalWeight : 0;

  return NextResponse.json({
    courseCode: course.code,
    courseName: course.name,
    currentGrade: Math.round(currentGrade * 10) / 10,
    projectedGrade: Math.round(projectedGrade * 10) / 10,
    earnedWeight,
    remainingWeight,
    totalWeight,
  });
}
