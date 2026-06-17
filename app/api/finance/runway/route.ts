import { NextRequest, NextResponse } from "next/server";
import { calculateRunway, createRunwaySnapshot } from "@/lib/runway";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const snapshot = searchParams.get("snapshot");

  if (snapshot === "true") {
    const data = await createRunwaySnapshot();
    return NextResponse.json(data);
  }

  const data = await calculateRunway();
  return NextResponse.json(data);
}
