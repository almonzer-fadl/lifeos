import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events, EventTypes } from "@/lib/events";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const invoice = await db.invoice.findUnique({
    where: { id },
    include: { payments: true },
  });
  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  if (invoice.status === "cancelled") {
    return NextResponse.json({ error: "Cannot pay a cancelled invoice" }, { status: 400 });
  }

  const amount = body.amount;
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Valid payment amount is required" }, { status: 400 });
  }

  // Create payment record
  const payment = await db.paymentReceived.create({
    data: {
      invoiceId: id,
      amount,
      currency: body.currency || invoice.currency,
      paymentDate: body.paymentDate ? new Date(body.paymentDate) : new Date(),
      method: body.method || null,
      reference: body.reference || null,
      notes: body.notes || null,
      transactionId: body.transactionId || null,
    },
  });

  // Calculate total paid
  const totalPaid = [...invoice.payments, payment].reduce((sum, p) => sum + p.amount, 0);

  // Determine new status
  let newStatus = invoice.status;
  if (totalPaid >= invoice.total) {
    newStatus = "paid";
  } else if (invoice.status === "draft" || invoice.status === "sent" || invoice.status === "overdue") {
    newStatus = "sent"; // partial payment keeps it active
  }

  // Update invoice
  const updatedInvoice = await db.invoice.update({
    where: { id },
    data: {
      status: newStatus,
      paidDate: newStatus === "paid" ? new Date() : invoice.paidDate,
    },
    include: { lineItems: true, payments: true },
  });

  // Optional: auto-create transaction in ledger if accountId provided
  if (body.accountId) {
    await db.transaction.create({
      data: {
        date: new Date(body.paymentDate || Date.now()),
        accountId: body.accountId,
        amount,
        currency: body.currency || invoice.currency,
        type: "income",
        description: `Payment for ${invoice.invoiceNumber}${body.reference ? ` (ref: ${body.reference})` : ""}`,
        status: "cleared",
        invoiceId: id,
      },
    });
  }

  // Emit event
  events.emit(EventTypes.PAYMENT_RECEIVED, {
    invoiceId: id,
    invoiceNumber: invoice.invoiceNumber,
    amount,
    clientId: invoice.clientId,
  }).catch(() => {});

  return NextResponse.json({ payment, invoice: updatedInvoice }, { status: 201 });
}
