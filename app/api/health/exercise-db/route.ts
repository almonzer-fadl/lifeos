import { NextRequest, NextResponse } from "next/server";
import { fetchExercises, fetchExercisesByBodyPart, fetchExercisesByEquipment, fetchBodyParts, BODY_PART_LABELS } from "@/lib/exercise-db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const bodyPart = searchParams.get("bodyPart");
  const equipment = searchParams.get("equipment");

  try {
    if (equipment) {
      const exercises = await fetchExercisesByEquipment(equipment);
      return NextResponse.json(exercises);
    }

    if (bodyPart) {
      const exercises = await fetchExercisesByBodyPart(bodyPart);
      return NextResponse.json(exercises);
    }

    const [exercises, bodyParts] = await Promise.all([
      fetchExercises(),
      fetchBodyParts(),
    ]);

    return NextResponse.json({
      exercises: exercises.slice(0, 50), // limit initial load
      total: exercises.length,
      bodyParts: bodyParts.map((bp) => ({
        key: bp,
        label: BODY_PART_LABELS[bp] || bp,
      })),
    });
  } catch (err) {
    console.error("[exercises] API error:", err);
    return NextResponse.json({ error: "Failed to fetch exercises" }, { status: 502 });
  }
}
