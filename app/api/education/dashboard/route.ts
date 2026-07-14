import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const [courses, gpa] = await Promise.all([
    db.course.findMany({
      where: { isActive: true },
      include: {
        assignments: { where: { status: "pending" }, orderBy: { dueDate: "asc" }, take: 3 },
        exams: { where: { date: { gte: new Date() } }, orderBy: { date: "asc" }, take: 3 },
      },
      orderBy: { code: "asc" },
    }),
    db.gPASnapshot.findFirst({ orderBy: { createdAt: "desc" } }),
  ]);

  const upcomingDeadlines = courses.flatMap((c) =>
    c.assignments.map((a) => ({ ...a, courseCode: c.code, courseName: c.name }))
  ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).slice(0, 5);

  return NextResponse.json({
    courses,
    currentGPA: gpa?.gpa || null,
    currentCGPA: gpa?.cgpa || null,
    upcomingDeadlines,
  });
}
