import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// In-memory fallback rates (updated periodically)
const FALLBACK_RATES: Record<string, number> = {
  "USD": 1, "EUR": 0.92, "GBP": 0.79, "TRY": 32.5, "MYR": 4.72, "SAR": 3.75, "JPY": 156, "CAD": 1.37, "AUD": 1.53, "CHF": 0.91,
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") || "USD";
  const to = searchParams.get("to");

  if (to) {
    // Get specific rate
    const dbRate = await db.exchangeRate.findFirst({
      where: { fromCurrency: from, toCurrency: to },
      orderBy: { date: "desc" },
    });

    if (dbRate) {
      return NextResponse.json({ from, to, rate: dbRate.rate, date: dbRate.date, source: "database" });
    }

    // Fallback
    const fromRate = FALLBACK_RATES[from];
    const toRate = FALLBACK_RATES[to];
    if (fromRate && toRate) {
      return NextResponse.json({ from, to, rate: toRate / fromRate, date: new Date().toISOString(), source: "fallback" });
    }

    return NextResponse.json({ error: "Rate not available" }, { status: 404 });
  }

  // Return all stored rates
  const rates = await db.exchangeRate.findMany({
    orderBy: { date: "desc" },
    take: 50,
  });

  return NextResponse.json({ stored: rates, fallback: FALLBACK_RATES });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.from || !body.to || body.rate == null) {
    return NextResponse.json({ error: "from, to, and rate are required" }, { status: 400 });
  }

  const rate = await db.exchangeRate.create({
    data: {
      fromCurrency: body.from,
      toCurrency: body.to,
      rate: parseFloat(body.rate),
      date: body.date ? new Date(body.date) : new Date(),
    },
  });

  return NextResponse.json(rate, { status: 201 });
}
