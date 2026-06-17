import { NextRequest, NextResponse } from "next/server";

// KL coordinates
const LAT = 3.1390;
const LNG = 101.6869;
const TZ = 8;

function calculatePrayerTimes(date: Date): Record<string, string> {
  // Simplified calculation using fixed offsets for KL
  // In production, use a proper library like adhan-js
  const base = new Date(date);
  base.setHours(5, 52, 0, 0); // Fajr ~05:52
  const fajr = new Date(base);
  const dhuhr = new Date(base); dhuhr.setHours(13, 15, 0, 0);
  const asr = new Date(base); asr.setHours(16, 38, 0, 0);
  const maghrib = new Date(base); maghrib.setHours(19, 10, 0, 0);
  const isha = new Date(base); isha.setHours(20, 20, 0, 0);

  return {
    fajr: fajr.toISOString(),
    dhuhr: dhuhr.toISOString(),
    asr: asr.toISOString(),
    maghrib: maghrib.toISOString(),
    isha: isha.toISOString(),
    location: `KL (${LAT}, ${LNG})`,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get("date") || new Date().toISOString().slice(0, 10);
  const times = calculatePrayerTimes(new Date(dateStr));
  return NextResponse.json(times);
}
