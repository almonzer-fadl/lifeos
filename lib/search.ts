import { db } from "@/lib/db";

export interface SearchResult {
  id: string;
  type: string; // "transaction", "task", "habit", "journal", "food", "exercise", "project", "account"
  title: string;
  subtitle: string;
  href: string;
  matchedOn: string; // field that matched
  date: string | null;
}

const SEARCH_LIMIT = 20;

export async function searchAll(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  const q = query.trim();
  const results: SearchResult[] = [];

  // ── Transactions ─────────────────────────────────────────
  const transactions = await db.transaction.findMany({
    where: {
      OR: [
        { description: { contains: q, mode: "insensitive" } },
        { notes: { contains: q, mode: "insensitive" } },
      ],
    },
    include: { account: true, category: true },
    take: SEARCH_LIMIT,
    orderBy: { date: "desc" },
  });
  for (const t of transactions) {
    results.push({
      id: t.id,
      type: "transaction",
      title: t.description || t.category?.name || "Transaction",
      subtitle: `${t.type === "income" ? "+" : "-"}${(t.amount / 100).toFixed(2)} · ${t.account.name}`,
      href: `/finance/accounts/${t.accountId}`,
      matchedOn: t.description?.toLowerCase().includes(q.toLowerCase()) ? "description" : "notes",
      date: t.date.toISOString(),
    });
  }

  // ── Tasks ────────────────────────────────────────────────
  const tasks = await db.task.findMany({
    where: {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    },
    include: { project: true },
    take: SEARCH_LIMIT,
    orderBy: { createdAt: "desc" },
  });
  for (const t of tasks) {
    results.push({
      id: t.id,
      type: "task",
      title: t.title,
      subtitle: `${t.status.replace("_", " ")} · ${t.priority}${t.project ? " · " + t.project.name : ""}`,
      href: `/tasks/${t.id}`,
      matchedOn: t.title.toLowerCase().includes(q.toLowerCase()) ? "title" : "description",
      date: t.dueDate?.toISOString() || t.createdAt.toISOString(),
    });
  }

  // ── Habits ───────────────────────────────────────────────
  const habits = await db.habit.findMany({
    where: {
      name: { contains: q, mode: "insensitive" },
    },
    take: SEARCH_LIMIT,
  });
  for (const h of habits) {
    results.push({
      id: h.id,
      type: "habit",
      title: h.name,
      subtitle: `${h.frequency}${h.category ? " · " + h.category : ""}`,
      href: `/habits/${h.id}`,
      matchedOn: "name",
      date: null,
    });
  }

  // ── Journal ──────────────────────────────────────────────
  const journals = await db.journalEntry.findMany({
    where: {
      content: { contains: q, mode: "insensitive" },
    },
    take: SEARCH_LIMIT,
    orderBy: { date: "desc" },
  });
  for (const j of journals) {
    const snippet = j.content.length > 100 ? j.content.slice(0, 100) + "…" : j.content;
    results.push({
      id: j.id,
      type: "journal",
      title: snippet.replace(/\n/g, " "),
      subtitle: j.mood ? `Mood: ${j.mood}` : "Journal entry",
      href: `/journal/${j.id}`,
      matchedOn: "content",
      date: j.date.toISOString(),
    });
  }

  // ── Food Items ───────────────────────────────────────────
  const foods = await db.foodItem.findMany({
    where: {
      name: { contains: q, mode: "insensitive" },
    },
    take: SEARCH_LIMIT,
  });
  for (const f of foods) {
    results.push({
      id: f.id,
      type: "food",
      title: f.name,
      subtitle: f.brand ? `${f.brand} · ${f.calories || 0} cal` : `${f.calories || 0} cal per serving`,
      href: "/nutrition/log",
      matchedOn: "name",
      date: null,
    });
  }

  // ── Exercises ────────────────────────────────────────────
  const exercises = await db.exercise.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { muscleGroup: { contains: q, mode: "insensitive" } },
      ],
    },
    take: SEARCH_LIMIT,
  });
  for (const e of exercises) {
    results.push({
      id: e.id,
      type: "exercise",
      title: e.name,
      subtitle: e.muscleGroup + (e.equipment ? ` · ${e.equipment}` : ""),
      href: `/exercises`,
      matchedOn: e.name.toLowerCase().includes(q.toLowerCase()) ? "name" : "muscleGroup",
      date: null,
    });
  }

  // ── Projects ─────────────────────────────────────────────
  const projects = await db.project.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    },
    take: SEARCH_LIMIT,
  });
  for (const p of projects) {
    results.push({
      id: p.id,
      type: "project",
      title: p.name,
      subtitle: p.status,
      href: `/tasks/projects`,
      matchedOn: p.name.toLowerCase().includes(q.toLowerCase()) ? "name" : "description",
      date: null,
    });
  }

  // ── Accounts ─────────────────────────────────────────────
  const accounts = await db.account.findMany({
    where: {
      name: { contains: q, mode: "insensitive" },
      isActive: true,
    },
    take: SEARCH_LIMIT,
  });
  for (const a of accounts) {
    results.push({
      id: a.id,
      type: "account",
      title: a.name,
      subtitle: `${a.type} · ${a.currency}`,
      href: `/finance/accounts/${a.id}`,
      matchedOn: "name",
      date: null,
    });
  }

  // Sort by relevance: title matches first, then date descending
  results.sort((a, b) => {
    const aTitle = a.matchedOn === "title" || a.matchedOn === "name";
    const bTitle = b.matchedOn === "title" || b.matchedOn === "name";
    if (aTitle && !bTitle) return -1;
    if (!aTitle && bTitle) return 1;
    if (a.date && b.date) return new Date(b.date).getTime() - new Date(a.date).getTime();
    return 0;
  });

  return results.slice(0, SEARCH_LIMIT);
}
