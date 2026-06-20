import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseMoneyInput, dollarsToCents } from "@/lib/money";

const VALID_TYPES = ["income", "expense", "transfer"];
const VALID_STATUSES = ["pending", "cleared", "reconciled"];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("accountId");
  const categoryId = searchParams.get("categoryId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const amountMin = searchParams.get("amountMin");
  const amountMax = searchParams.get("amountMax");
  const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 1000);

  const where: Record<string, unknown> = {};
  if (accountId) where.accountId = accountId;
  if (categoryId) where.categoryId = categoryId;
  if (type && VALID_TYPES.includes(type)) where.type = type;
  if (status && VALID_STATUSES.includes(status)) where.status = status;
  if (search) where.description = { contains: search, mode: "insensitive" };
  if (amountMin || amountMax) {
    where.amount = {};
    if (amountMin) (where.amount as Record<string, number>).gte = dollarsToCents(parseFloat(amountMin));
    if (amountMax) (where.amount as Record<string, number>).lte = dollarsToCents(parseFloat(amountMax));
  }
  if (from || to) {
    where.date = {};
    if (from) (where.date as Record<string, string>).gte = from;
    if (to) (where.date as Record<string, string>).lte = to;
  }

  const transactions = await db.transaction.findMany({
    where,
    orderBy: { date: "desc" },
    take: limit,
    include: { account: true, category: true, childTransactions: { include: { category: true } } },
  });

  return NextResponse.json(transactions);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  // ---- TRANSFER: create paired entries ----
  if (body.type === "transfer") {
    if (!body.accountId || !body.transferAccountId) {
      return NextResponse.json({ error: "Both source and destination accounts are required for transfers" }, { status: 400 });
    }
    if (body.accountId === body.transferAccountId) {
      return NextResponse.json({ error: "Cannot transfer to the same account" }, { status: 400 });
    }
    if (body.amount == null || isNaN(parseFloat(body.amount)) || parseFloat(body.amount) <= 0) {
      return NextResponse.json({ error: "Valid positive amount is required" }, { status: 400 });
    }

    const amountCents = parseMoneyInput(body.amount);

    const [sourceTx, destTx] = await db.$transaction([
      db.transaction.create({
        data: {
          date: body.date ? new Date(body.date) : new Date(),
          accountId: body.accountId,
          amount: amountCents,
          currency: body.currency || "USD",
          type: "transfer",
          status: body.status || "pending",
          description: body.description || `Transfer to account`,
          notes: body.notes || null,
          isTransfer: true,
          transferAccountId: body.transferAccountId,
        },
        include: { account: true, category: true },
      }),
      db.transaction.create({
        data: {
          date: body.date ? new Date(body.date) : new Date(),
          accountId: body.transferAccountId,
          amount: amountCents,
          currency: body.currency || "USD",
          type: "transfer",
          status: body.status || "pending",
          description: body.description || `Transfer from account`,
          notes: body.notes || null,
          isTransfer: true,
          transferAccountId: body.accountId,
        },
        include: { account: true, category: true },
      }),
    ]);

    return NextResponse.json({ source: sourceTx, destination: destTx }, { status: 201 });
  }

  // ---- SPLIT: parent with children ----
  if (body.splits && Array.isArray(body.splits) && body.splits.length > 0) {
    if (!body.accountId) {
      return NextResponse.json({ error: "accountId is required" }, { status: 400 });
    }

    const splits = body.splits as { amount: string; categoryId?: string; description?: string }[];
    const splitAmounts = splits.map((s) => parseMoneyInput(s.amount));
    const totalCents = splitAmounts.reduce((a, b) => a + b, 0);

    const parent = await db.transaction.create({
      data: {
        date: body.date ? new Date(body.date) : new Date(),
        accountId: body.accountId,
        amount: totalCents,
        currency: body.currency || "USD",
        type: body.type || "expense",
        status: body.status || "pending",
        description: body.description || "Split transaction",
        notes: body.notes || null,
      },
    });

    const children = await db.$transaction(
      splits.map((s, i) =>
        db.transaction.create({
          data: {
            date: body.date ? new Date(body.date) : new Date(),
            accountId: body.accountId,
            categoryId: s.categoryId || null,
            amount: parseMoneyInput(s.amount),
            currency: body.currency || "USD",
            type: body.type || "expense",
            status: body.status || "pending",
            description: s.description || `Split ${i + 1}`,
            parentTransactionId: parent.id,
          },
          include: { category: true },
        })
      )
    );

    return NextResponse.json({ ...parent, splits: children }, { status: 201 });
  }

  // ---- STANDARD transaction ----
  if (!body.accountId) {
    return NextResponse.json({ error: "accountId is required" }, { status: 400 });
  }
  if (body.type && !VALID_TYPES.includes(body.type)) {
    return NextResponse.json({ error: `Invalid type. Must be one of: ${VALID_TYPES.join(", ")}` }, { status: 400 });
  }
  if (body.status && !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` }, { status: 400 });
  }
  if (body.amount == null || isNaN(parseFloat(body.amount))) {
    return NextResponse.json({ error: "Valid amount is required" }, { status: 400 });
  }

  const tx = await db.transaction.create({
    data: {
      date: body.date ? new Date(body.date) : new Date(),
      accountId: body.accountId,
      categoryId: body.categoryId || null,
      amount: parseMoneyInput(body.amount),
      currency: body.currency || "USD",
      type: body.type || "expense",
      status: body.status || "pending",
      description: body.description || null,
      notes: body.notes || null,
      isTransfer: body.isTransfer === true,
      transferAccountId: body.transferAccountId || null,
    },
    include: { account: true, category: true },
  });

  return NextResponse.json(tx, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (body.status && VALID_STATUSES.includes(body.status)) data.status = body.status;
  if (body.type && VALID_TYPES.includes(body.type)) data.type = body.type;
  if (body.categoryId !== undefined) data.categoryId = body.categoryId || null;
  if (body.description !== undefined) data.description = body.description;
  if (body.notes !== undefined) data.notes = body.notes;
  if (body.amount != null && !isNaN(parseFloat(body.amount))) data.amount = parseMoneyInput(body.amount);

  const tx = await db.transaction.update({ where: { id: body.id }, data, include: { account: true, category: true, childTransactions: { include: { category: true } } } });
  return NextResponse.json(tx);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const tx = await db.transaction.findUnique({ where: { id }, include: { childTransactions: true } });
  if (!tx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Delete children first if this is a split parent
  if (tx.childTransactions.length > 0) {
    await db.transaction.deleteMany({ where: { parentTransactionId: id } });
  }

  await db.transaction.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
