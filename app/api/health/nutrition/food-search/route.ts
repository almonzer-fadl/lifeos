import { NextRequest, NextResponse } from "next/server";
import { searchProducts, getProductByBarcode, toFoodItemRecord } from "@/lib/openfoodfacts";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/api-middleware";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const barcode = searchParams.get("barcode");
  const page = parseInt(searchParams.get("page") || "1");

  if (barcode) {
    // Look up by barcode — also cache in our DB
    const product = await getProductByBarcode(barcode);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Cache in our FoodItem table
    if (product.code) {
      try {
        const existing = await db.foodItem.findFirst({ where: { barcode: product.code } });
        if (!existing && product.product_name) {
          await db.foodItem.create({ data: toFoodItemRecord(product) });
        }
      } catch { /* cache miss is ok */ }
    }

    return NextResponse.json({ product, localRecord: toFoodItemRecord(product) });
  }

  if (!query) {
    return NextResponse.json({ error: "q or barcode parameter required" }, { status: 400 });
  }

  const limit = checkRateLimit(request);
  if (limit) return limit;

  // First search our local cache
  const localItems = await db.foodItem.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { brand: { contains: query, mode: "insensitive" } },
      ],
    },
    take: 10,
  });

  // Then search Open Food Facts
  try {
    const results = await searchProducts(query, page, 10);
    return NextResponse.json({
      local: localItems,
      remote: results.products.map(toFoodItemRecord),
      total: results.count,
    });
  } catch {
    // Fall back to local only
    return NextResponse.json({ local: localItems, remote: [], total: localItems.length });
  }
}

export async function POST(request: NextRequest) {
  const limit = checkRateLimit(request);
  if (limit) return limit;

  const body = await request.json();
  if (!body.barcode) {
    return NextResponse.json({ error: "barcode required" }, { status: 400 });
  }

  const product = await getProductByBarcode(body.barcode);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const record = toFoodItemRecord(product);
  const existing = await db.foodItem.findFirst({ where: { barcode: product.code } });

  if (existing) {
    return NextResponse.json(existing);
  }

  const item = await db.foodItem.create({ data: record });
  return NextResponse.json(item, { status: 201 });
}
