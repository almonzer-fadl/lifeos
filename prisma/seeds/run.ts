// Seed runner: exercises, sample foods, and lab reference ranges
// Usage: DATABASE_URL="postgresql://..." npx tsx prisma/seeds/run.ts

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import exercises from "./exercises";
import foods from "./sample-foods";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function seed() {
  console.log("Seeding...");

  // Exercises
  const existingExercises = await db.exercise.count();
  if (existingExercises === 0) {
    let count = 0;
    for (const ex of exercises) {
      await db.exercise.upsert({
        where: { name: ex.name },
        update: { muscleGroup: ex.muscleGroup, equipment: ex.equipment || null, instructions: ex.instructions || null },
        create: { name: ex.name, muscleGroup: ex.muscleGroup, equipment: ex.equipment || null, instructions: ex.instructions || null },
      });
      count++;
    }
    console.log(`  ✓ ${count} exercises seeded`);
  } else {
    console.log(`  - ${existingExercises} exercises already exist`);
  }

  // Sample foods
  const existingFoods = await db.foodItem.count({ where: { isSeeded: true } });
  if (existingFoods === 0) {
    let count = 0;
    for (const f of foods) {
      await db.foodItem.create({ data: { name: f.name, brand: f.brand, servingSize: f.servingSize, servingUnit: f.servingUnit, calories: f.calories, protein: f.protein, carbs: f.carbs, fat: f.fat, fiber: f.fiber || null, sugars: f.sugars || null, isSeeded: true } });
      count++;
    }
    console.log(`  ✓ ${count} food items seeded`);
  } else {
    console.log(`  - ${existingFoods} food items already exist, skipping`);
  }

  // Lab reference ranges are just docs — user adds results manually
  // But we could seed them as a catalog if there was a LabReference table
  // For now, lab ranges live in prisma/seeds/lab-ranges.ts for reference

  console.log("Done.");
}

seed()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });
