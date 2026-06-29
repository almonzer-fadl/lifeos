import { NextResponse } from "next/server";
import { syncCalDAVEvents } from "@/lib/caldav";

export async function POST() {
  try {
    const result = await syncCalDAVEvents(30);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function GET() {
  // Check if configured
  const { isCalDAVConfigured } = await import("@/lib/caldav");
  const configured = await isCalDAVConfigured();
  return NextResponse.json({ configured });
}
