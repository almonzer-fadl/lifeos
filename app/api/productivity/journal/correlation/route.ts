import { NextResponse } from "next/server";
import { getMoodCorrelations } from "@/lib/mood-correlation";

export async function GET() {
  const correlations = await getMoodCorrelations(30);
  return NextResponse.json(correlations);
}
