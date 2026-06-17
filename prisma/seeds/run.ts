// Seed runner: exercises, sample foods, and lab reference ranges
// Usage: DATABASE_URL="postgresql://..." npx tsx prisma/seeds/run.ts

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import exercises from "./exercises";
import foods from "./sample-foods";
import contacts from "./contacts";
import projects from "./projects";
import habits from "./habits";
import journalTemplates from "./journal-templates";
import timeBlocks from "./time-blocks";

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

  // Habits
  const existingHabits = await db.habit.count();
  if (existingHabits === 0) {
    let count = 0;
    for (const h of habits) {
      await db.habit.create({ data: h });
      count++;
    }
    console.log(`  ✓ ${count} habits seeded`);
  } else {
    console.log(`  - ${existingHabits} habits already exist, skipping`);
  }

  // Journal templates
  const existingTemplates = await db.journalTemplate.count();
  if (existingTemplates === 0) {
    let count = 0;
    for (const t of journalTemplates) {
      await db.journalTemplate.create({ data: t });
      count++;
    }
    console.log(`  ✓ ${count} journal templates seeded`);
  } else {
    console.log(`  - ${existingTemplates} journal templates already exist, skipping`);
  }

  // Time blocks
  const existingBlocks = await db.timeBlockTemplate.count();
  if (existingBlocks === 0) {
    let count = 0;
    for (const b of timeBlocks) {
      await db.timeBlockTemplate.create({ data: b });
      count++;
    }
    console.log(`  ✓ ${count} time blocks seeded`);
  } else {
    console.log(`  - ${existingBlocks} time blocks already exist, skipping`);
  }

  console.log("Done.");
}

seed()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });
