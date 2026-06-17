// Free open-source exercise database client
// Uses ExerciseDB API: https://oss.exercisedb.dev (no API key needed)
// Attribution: credit to AscendAPI

const BASE = "https://oss.exercisedb.dev/api/v1";

export interface ExerciseDBItem {
  exerciseId: string;
  name: string;
  gifUrl: string;
  targetMuscles: string[];
  bodyParts: string[];
  equipments: string[];
  secondaryMuscles: string[];
  instructions: string[];
}

async function fetchFromAPI<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ExerciseDB: ${res.status}`);
  const body = await res.json() as { data: T };
  return body.data;
}

export async function fetchExercises(): Promise<ExerciseDBItem[]> {
  return fetchFromAPI<ExerciseDBItem[]>(`${BASE}/exercises?limit=25`);
}

export async function fetchExercisesByBodyPart(bodyPart: string): Promise<ExerciseDBItem[]> {
  return fetchFromAPI<ExerciseDBItem[]>(`${BASE}/exercises/bodyparts?bodyParts=${encodeURIComponent(bodyPart)}&limit=25`);
}

export async function fetchExercisesByTarget(target: string): Promise<ExerciseDBItem[]> {
  return fetchFromAPI<ExerciseDBItem[]>(`${BASE}/exercises?targetMuscles=${encodeURIComponent(target)}&limit=25`);
}

export async function fetchExercisesByEquipment(equipment: string): Promise<ExerciseDBItem[]> {
  return fetchFromAPI<ExerciseDBItem[]>(`${BASE}/exercises?equipments=${encodeURIComponent(equipment)}&limit=25`);
}

export async function fetchExerciseById(id: string): Promise<ExerciseDBItem> {
  return fetchFromAPI<ExerciseDBItem>(`${BASE}/exercises/${encodeURIComponent(id)}`);
}

export async function fetchBodyParts(): Promise<string[]> {
  const res = await fetch(`${BASE}/bodyparts`);
  if (!res.ok) throw new Error(`ExerciseDB: ${res.status}`);
  const body = await res.json() as { data: Array<{ name: string }> };
  return body.data.map(bp => bp.name);
}

// Map ExerciseDB bodyParts to friendly names
export const BODY_PART_LABELS: Record<string, string> = {
  chest: "Chest",
  back: "Back",
  legs: "Legs",
  "upper legs": "Upper Legs",
  "lower legs": "Lower Legs",
  shoulders: "Shoulders",
  "upper arms": "Upper Arms",
  "lower arms": "Lower Arms",
  core: "Core",
  cardio: "Cardio",
  neck: "Neck",
  waist: "Waist",
};

export function getBodyPartLabel(key: string): string {
  return BODY_PART_LABELS[key] || key;
}

// Map to our Prisma Exercise model
export function toExerciseRecord(e: ExerciseDBItem) {
  return {
    name: e.name,
    muscleGroup: e.bodyParts[0] || e.targetMuscles[0] || "other",
    equipment: e.equipments[0] || null,
    instructions: e.instructions.join("\n\n"),
    gifUrl: e.gifUrl,
    secondaryMuscles: e.secondaryMuscles.join(","),
  };
}
