import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const BLOCK_ORDER = ["deep_work_1", "university", "deep_work_2", "admin", "free"];

export async function GET() {
  const today = new Date();
  const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const [tasks, inbox] = await Promise.all([
    db.task.findMany({
      where: {
        dueDate: { gte: dayStart, lt: dayEnd },
        status: { not: "cancelled" },
        isQuickCapture: false,
      },
      orderBy: [{ timeBlockSlot: "asc" }, { priority: "asc" }],
      include: {
        subtaskItems: { orderBy: { sortOrder: "asc" } },
        timeBlock: true,
        project: { select: { id: true, name: true, color: true } },
      },
    }),
    db.task.findMany({
      where: { isQuickCapture: true, status: "todo" },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  // Group by time block
  const blocks: Record<string, typeof tasks> = {};
  for (const block of BLOCK_ORDER) {
    blocks[block] = [];
  }
  blocks.unscheduled = [];

  for (const task of tasks) {
    const slot = task.timeBlockSlot || "unscheduled";
    if (!blocks[slot]) blocks[slot] = [];
    blocks[slot].push(task);
  }

  return NextResponse.json({
    date: dayStart.toISOString(),
    blocks,
    inbox,
    totalTasks: tasks.length,
    inboxCount: inbox.length,
    completedCount: tasks.filter((t) => t.status === "done").length,
  });
}
