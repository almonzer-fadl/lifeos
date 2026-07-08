// Seed runner: exercises, sample foods, and lab reference ranges
// Usage: DATABASE_URL="postgresql://..." npx tsx prisma/seeds/run.ts

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import exercises from "./exercises";
import foods from "./sample-foods";
import contacts from "./contacts";
import projects from "./projects";

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

  // Contacts (CRM seed data)
  const existingContacts = await db.contact.count();
  if (existingContacts === 0) {
    let count = 0;
    for (const c of contacts) {
      await db.contact.create({ data: c });
      count++;
    }
    console.log(`  ✓ ${count} contacts seeded`);
  } else {
    console.log(`  - ${existingContacts} contacts already exist`);
  }

  // Projects
  const existingProjects = await db.project.count();
  if (existingProjects === 0) {
    let count = 0;
    for (const p of projects) {
      await db.project.create({ data: p });
      count++;
    }
    console.log(`  ✓ ${count} projects seeded`);
  } else {
    console.log(`  - ${existingProjects} projects already exist, skipping`);
  }

  console.log("Done.");
}

seed()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });
