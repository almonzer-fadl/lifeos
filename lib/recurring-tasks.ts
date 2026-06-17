import { db } from "@/lib/db";

export async function generateDailyTasks(date?: Date) {
  const targetDate = date || new Date();
  const dayStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const dayOfWeek = targetDate.getDay();

  const templates = await db.recurringTaskTemplate.findMany({
    where: { isActive: true },
  });

  const created: Awaited<ReturnType<typeof db.task.create>>[] = [];

  for (const template of templates) {
    // Skip weekends for weekday tasks
    if (template.frequency === "weekdays" && (dayOfWeek === 0 || dayOfWeek === 6)) continue;

    // For weekly: check if this day of week matches (approximate — generate once per week on Monday)
    if (template.frequency === "weekly" && dayOfWeek !== 1) continue;

    // For monthly: generate only on the 1st
    if (template.frequency === "monthly" && targetDate.getDate() !== 1) continue;

    // Check if already generated for this date
    const existing = await db.task.findFirst({
      where: {
        title: template.title,
        dueDate: { gte: dayStart, lt: dayEnd },
      },
    });
    if (existing) continue;

    const task = await db.task.create({
      data: {
        title: template.title,
        description: template.description,
        priority: template.priority,
        projectId: template.projectId,
        energyLevel: template.energyLevel,
        timeBlockSlot: template.timeBlockSlot,
        estimatedMinutes: template.estimatedMinutes,
        dueDate: dayStart,
      },
    });

    // Update last generated timestamp
    await db.recurringTaskTemplate.update({
      where: { id: template.id },
      data: { lastGeneratedAt: new Date() },
    });

    created.push(task);
  }

  return created;
}
