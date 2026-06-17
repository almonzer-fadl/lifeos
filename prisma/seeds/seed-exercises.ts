// Seed exercise database from ExerciseDB free API
// Run: npx tsx prisma/seeds/seed-exercises.ts

import { db } from "../../lib/db";

const BASE = "https://oss.exercisedb.dev/api/v1";

interface ExerciseAPI {
  exerciseId: string;
  name: string;
  gifUrl: string;
  targetMuscles: string[];
  bodyParts: string[];
  equipments: string[];
  secondaryMuscles: string[];
  instructions: string[];
}

async function seed() {
  console.log("🌱 Fetching exercises from ExerciseDB...");
  
  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  let all: ExerciseAPI[] = [];
  let cursor: string | undefined;
  let page = 0;

  do {
    const url = cursor
      ? `${BASE}/exercises?cursor=${cursor}&limit=100`
      : `${BASE}/exercises?limit=100`;

    let res: Response;
    let retries = 0;
    while (true) {
      res = await fetch(url);
      if (res.status !== 429) break;
      retries++;
      const wait = Math.min(2000 * Math.pow(2, retries), 30000);
      console.log(`  ⏳ Rate limited, waiting ${wait / 1000}s...`);
      await delay(wait);
    }
    if (!res.ok) {
      console.error(`Failed to fetch (page ${page}): ${res.status}`);
      process.exit(1);
    }

    const body = await res.json() as { data: ExerciseAPI[]; meta: { total: number; hasNextPage: boolean; nextCursor: string } };
    all = all.concat(body.data);
    cursor = body.meta.hasNextPage && all.length < body.meta.total ? body.meta.nextCursor : undefined;
    page++;
    console.log(`📦 Page ${page}: got ${body.data.length} (total so far: ${all.length} / ${body.meta.total})`);
    await delay(500);
  } while (cursor);

  const exercises = all;
  console.log(`📦 Got ${exercises.length} exercises total`);

  let created = 0;
  let skipped = 0;

  for (const e of exercises) {
    try {
      const existing = await db.exercise.findFirst({ where: { name: e.name } });
      if (existing) {
        skipped++;
        continue;
      }

      await db.exercise.create({
        data: {
          name: e.name,
          muscleGroup: e.bodyParts[0] || e.targetMuscles[0] || "other",
          equipment: e.equipments[0] || null,
          instructions: e.instructions?.join("\n\n") || null,
          gifUrl: e.gifUrl || null,
          secondaryMuscles: e.secondaryMuscles?.join(",") || null,
        },
      });
      created++;

      if (created % 100 === 0) {
        console.log(`  ✅ ${created} created, ${skipped} skipped...`);
      }
    } catch (err) {
      // Duplicate or constraint error, skip
      skipped++;
    }
  }

  console.log(`\n🎉 Done! ${created} created, ${skipped} skipped (${created + skipped} total)`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
