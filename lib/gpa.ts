const GRADE_POINTS: Record<string, number> = {
  "A+": 4.0, "A": 4.0, "A-": 3.7,
  "B+": 3.3, "B": 3.0, "B-": 2.7,
  "C+": 2.3, "C": 2.0, "C-": 1.7,
  "D+": 1.3, "D": 1.0, "F": 0.0,
};

interface CourseGrades {
  credits: number;
  finalGrade: string;
}

export function calculateGPA(courses: CourseGrades[]): { gpa: number; totalCredits: number } {
  let totalPoints = 0;
  let totalCredits = 0;
  for (const course of courses) {
    const gradePoint = GRADE_POINTS[course.finalGrade] || 0;
    totalPoints += gradePoint * course.credits;
    totalCredits += course.credits;
  }
  return {
    gpa: totalCredits > 0 ? Math.round((totalPoints / totalCredits) * 100) / 100 : 0,
    totalCredits,
  };
}

export function gradeToLetter(percentage: number): string {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 75) return "A-";
  if (percentage >= 70) return "B+";
  if (percentage >= 65) return "B";
  if (percentage >= 60) return "B-";
  if (percentage >= 55) return "C+";
  if (percentage >= 50) return "C";
  if (percentage >= 45) return "C-";
  if (percentage >= 40) return "D+";
  if (percentage >= 35) return "D";
  return "F";
}

export function gradePointsFromLetter(grade: string): number {
  return GRADE_POINTS[grade] || 0;
}
