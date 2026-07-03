import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/api-middleware";
import { DEFAULTS } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const clientId = searchParams.get("clientId");
  const projectId = searchParams.get("projectId");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (clientId) where.clientId = clientId;
  if (projectId) where.projectId = projectId;

  const invoices = await db.invoice.findMany({
    where,
    orderBy: { issuedDate: "desc" },
    take: limit,
    include: {
      lineItems: true,
      payments: true,
    },
  });

  return NextResponse.json(invoices);
}

export async function POST(request: NextRequest) {
  const limit = checkRateLimit(request, DEFAULTS.MUTATION);
  if (limit) return limit;

  const body = await request.json();

  if (!body.clientId) {
    return NextResponse.json({ error: "clientId is required" }, { status: 400 });
  }
  if (!body.lineItems || !Array.isArray(body.lineItems) || body.lineItems.length === 0) {
    return NextResponse.json({ error: "At least one line item is required" }, { status: 400 });
  }

  // Auto-generate invoice number
  const lastInvoice = await db.invoice.findFirst({
    orderBy: { invoiceNumber: "desc" },
    select: { invoiceNumber: true },
  });
  const lastNum = lastInvoice ? parseInt(lastInvoice.invoiceNumber.replace("INV-", "")) || 0 : 0;
  const invoiceNumber = `INV-${String(lastNum + 1).padStart(3, "0")}`;

  // Calculate totals
  const lineItems = body.lineItems.map((item: { description: string; quantity?: number; unitPrice: number }) => ({
    description: item.description,
    quantity: item.quantity || 1,
    unitPrice: item.unitPrice,
    amount: (item.quantity || 1) * item.unitPrice,
  }));

  const subtotal = lineItems.reduce((sum: number, item: { amount: number }) => sum + item.amount, 0);
  const taxRate = body.taxRate || 0;
  const taxAmount = Math.round(subtotal * taxRate);
  const total = subtotal + taxAmount;

  const invoice = await db.invoice.create({
    data: {
      invoiceNumber,
      clientId: body.clientId,
      projectId: body.projectId || null,
      status: "draft",
      currency: body.currency || "MYR",
      subtotal,
      taxRate,
      taxAmount,
      total,
      dueDate: new Date(body.dueDate || Date.now() + 30 * 24 * 60 * 60 * 1000),
      notes: body.notes || null,
      lineItems: {
        create: lineItems,
      },
    },
    include: { lineItems: true },
  });

  return NextResponse.json(invoice, { status: 201 });
}
