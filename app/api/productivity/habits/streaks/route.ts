import { NextResponse } from "next/server";
import { getAllStreaks } from "@/lib/streaks";

export async function GET() {
  const streaks = await getAllStreaks();
  return NextResponse.json(streaks);
}
