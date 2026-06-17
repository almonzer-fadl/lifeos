import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getHijriDate } from "@/lib/hijri";

export async function GET() {
  const today = new Date();
  const dayOfWeek = today.getDay().toString();
  const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const [blocks, events, tasks, compliance] = await Promise.all([
    db.timeBlockTemplate.findMany({
      where: {
        isActive: true,
        daysOfWeek: { contains: dayOfWeek },
      },
      orderBy: { sortOrder: "asc" },
    }),
    db.calendarEvent.findMany({
      where: {
        startTime: { gte: dayStart, lt: dayEnd },
      },
      orderBy: { startTime: "asc" },
    }),
    db.task.findMany({
      where: {
        dueDate: { gte: dayStart, lt: dayEnd },
        status: { not: "cancelled" },
        isQuickCapture: false,
      },
      include: { project: { select: { id: true, name: true, color: true } } },
    }),
    db.blockCompliance.findMany({
      where: { date: { gte: dayStart, lt: dayEnd } },
    }),
  ]);

  const timeline = blocks.map((b) => {
    const [sh, sm] = b.startTime.split(":").map(Number);
    const [eh, em] = b.endTime.split(":").map(Number);
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), sh, sm);
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), eh, em);

    const blockTasks = tasks.filter((t) => t.timeBlockSlot === b.name.toLowerCase().replace(/\s+/g, "_"));
    const comp = compliance.find((c) => c.blockName === b.name);

    return {
      blockId: b.id,
      name: b.name,
      startTime: b.startTime,
      endTime: b.endTime,
      start: start.toISOString(),
      end: end.toISOString(),
      color: b.color,
      type: b.type,
      tasks: blockTasks,
      compliance: comp
        ? {
            actualStart: comp.actualStart,
            actualEnd: comp.actualEnd,
            compliance: comp.compliance,
            activity: comp.activity,
          }
        : null,
    };
  });

  return NextResponse.json({
    date: dayStart.toISOString(),
    hijriDate: getHijriDate(today),
    dayOfWeek: today.getDay(),
    timeline,
    events,
    totalBlocks: blocks.length,
  });
}
