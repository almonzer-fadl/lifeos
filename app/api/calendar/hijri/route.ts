import { NextRequest, NextResponse } from "next/server";
import { gregorianToHijri, getHijriDate } from "@/lib/hijri";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");

  const date = dateParam ? new Date(dateParam) : new Date();
  const hijri = gregorianToHijri(date);

  return NextResponse.json({
    gregorian: date.toISOString().slice(0, 10),
    hijri: hijri.formatted,
    hijriYear: hijri.year,
    hijriMonth: hijri.month,
    hijriDay: hijri.day,
  });
}
