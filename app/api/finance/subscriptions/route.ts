import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/api-middleware";
import { DEFAULTS } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const isActive = searchParams.get("isActive");
  const category = searchParams.get("category");

  const where: Record<string, unknown> = {};
  if (isActive === "true") where.isActive = true;
  if (isActive === "false") where.isActive = false;
  if (category) where.category = category;

  const subscriptions = await db.subscription.findMany({
    where,
    orderBy: { nextBillingDate: "asc" },
  });

  return NextResponse.json(subscriptions);
}

export async function POST(request: NextRequest) {
  const limit = checkRateLimit(request, DEFAULTS.MUTATION);
  if (limit) return limit;

  const body = await request.json();

  if (!body.name || !body.provider || !body.amount || !body.billingCycle) {
    return NextResponse.json(
      { error: "name, provider, amount, and billingCycle are required" },
      { status: 400 }
    );
  }

  const validCycles = ["monthly", "yearly", "weekly"];
  if (!validCycles.includes(body.billingCycle)) {
    return NextResponse.json({ error: "billingCycle must be monthly, yearly, or weekly" }, { status: 400 });
  }

  const subscription = await db.subscription.create({
    data: {
      name: body.name,
      provider: body.provider,
      amount: body.amount,
      currency: body.currency || "MYR",
      billingCycle: body.billingCycle,
      nextBillingDate: new Date(body.nextBillingDate || Date.now()),
      category: body.category || null,
      isActive: body.isActive !== false,
      notes: body.notes || null,
      recurringTxId: body.recurringTxId || null,
    },
  });

  return NextResponse.json(subscription, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const existing = await db.subscription.findUnique({ where: { id: body.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (body.name) data.name = body.name;
  if (body.provider) data.provider = body.provider;
  if (body.amount != null) data.amount = body.amount;
  if (body.billingCycle) {
    const validCycles = ["monthly", "yearly", "weekly"];
    if (validCycles.includes(body.billingCycle)) data.billingCycle = body.billingCycle;
  }
  if (body.nextBillingDate) data.nextBillingDate = new Date(body.nextBillingDate);
  if (body.category !== undefined) data.category = body.category;
  if (body.isActive !== undefined) data.isActive = body.isActive;
  if (body.notes !== undefined) data.notes = body.notes;
  if (body.recurringTxId !== undefined) data.recurringTxId = body.recurringTxId;

  const subscription = await db.subscription.update({
    where: { id: body.id },
    data,
  });

  return NextResponse.json(subscription);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  await db.subscription.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
