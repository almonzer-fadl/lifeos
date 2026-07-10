import { NextRequest, NextResponse } from "next/server";
import { generateDailyTasks } from "@/lib/recurring-tasks";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const date = body.date ? new Date(body.date) : undefined;

  const tasks = await generateDailyTasks(date);
  return NextResponse.json({ generated: tasks.length, tasks });
}
