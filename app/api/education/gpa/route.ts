import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateGPA, gradeToLetter } from "@/lib/gpa";

export async function GET() {
  const courses = await db.course.findMany({
    where: { isActive: true },
    include: {
      assignments: true,
      exams: true,
    },
  });

  const coursesWithGrades = courses.map((c) => {
    const allItems = [...c.assignments, ...c.exams];
    let weightedSum = 0;
    let totalWeight = 0;

    for (const item of allItems) {
      if (item.percentage != null && item.weight) {
        weightedSum += item.percentage * (item.weight / 100);
        totalWeight += item.weight / 100;
      }
    }

    const estimatedPct = totalWeight > 0 ? weightedSum / totalWeight : null;
    return {
      code: c.code,
      name: c.name,
      credits: c.credits,
      currentPercentage: estimatedPct ? Math.round(estimatedPct * 100) / 100 : null,
      projectedGrade: estimatedPct ? gradeToLetter(estimatedPct) : "N/A",
      assignmentCount: c.assignments.length,
      examCount: c.exams.length,
    };
  });

  // For GPA calculation, use projected grades
  const gpaCourses = coursesWithGrades
    .filter((c) => c.projectedGrade !== "N/A")
    .map((c) => ({ credits: c.credits, finalGrade: c.projectedGrade }));

  const { gpa, totalCredits } = calculateGPA(gpaCourses);

  return NextResponse.json({
    gpa,
    totalCredits,
    courses: coursesWithGrades,
  });
}
