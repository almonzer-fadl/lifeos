import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const MERCHANT_PATTERNS: { pattern: RegExp; name: string; category?: string }[] = [
  { pattern: /starbucks/i, name: "Starbucks", category: "Dining Out" },
  { pattern: /amazon|amzn/i, name: "Amazon", category: "Shopping" },
  { pattern: /netflix/i, name: "Netflix", category: "Entertainment" },
  { pattern: /spotify/i, name: "Spotify", category: "Entertainment" },
  { pattern: /uber|lyft/i, name: "Ride Share", category: "Transportation" },
  { pattern: /walmart|target|costco/i, name: "Groceries", category: "Groceries" },
  { pattern: /doordash|ubereats|grubhub/i, name: "Food Delivery", category: "Dining Out" },
  { pattern: /gas|shell|chevron|exxon|bp |circle k/i, name: "Fuel", category: "Transportation" },
  { pattern: /rent|lease/i, name: "Rent", category: "Housing" },
  { pattern: /electric|power|utility/i, name: "Utilities", category: "Utilities" },
];

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.description || typeof body.description !== "string") {
    return NextResponse.json({ error: "description is required" }, { status: 400 });
  }

  const description = body.description;
  const match = MERCHANT_PATTERNS.find((p) => p.pattern.test(description));

  if (match) {
    // Try to find matching category
    let categoryId: string | null = null;
    if (match.category) {
      const cat = await db.category.findFirst({ where: { name: match.category } });
      if (cat) categoryId = cat.id;
    }

    return NextResponse.json({
      matched: true,
      normalizedName: match.name,
      suggestedCategory: match.category || null,
      categoryId,
      originalDescription: description,
    });
  }

  return NextResponse.json({
    matched: false,
    normalizedName: description,
    suggestedCategory: null,
    categoryId: null,
    originalDescription: description,
  });
}

// Apply rules to all uncategorized transactions
export async function PATCH(request: NextRequest) {
  const transactions = await db.transaction.findMany({
    where: { categoryId: null, description: { not: null } },
    take: 500,
  });

  let updated = 0;
  for (const tx of transactions) {
    if (!tx.description) continue;
    const desc = tx.description;
    const match = MERCHANT_PATTERNS.find((p) => p.pattern.test(desc));
    if (match?.category) {
      const cat = await db.category.findFirst({ where: { name: match.category } });
      if (cat) {
        await db.transaction.update({ where: { id: tx.id }, data: { categoryId: cat.id } });
        updated++;
      }
    }
  }

  return NextResponse.json({ updated, total: transactions.length });
}
