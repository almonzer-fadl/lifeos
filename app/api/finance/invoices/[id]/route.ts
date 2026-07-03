import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const invoice = await db.invoice.findUnique({
    where: { id },
    include: { lineItems: true, payments: true },
  });
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(invoice);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const existing = await db.invoice.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (body.status) {
    const validStatuses = ["draft", "sent", "paid", "overdue", "cancelled"];
    if (validStatuses.includes(body.status)) data.status = body.status;
  }
  if (body.dueDate) data.dueDate = new Date(body.dueDate);
  if (body.notes !== undefined) data.notes = body.notes;
  if (body.projectId !== undefined) data.projectId = body.projectId;

  // If marking as paid, set paidDate
  if (body.status === "paid" && existing.status !== "paid") {
    data.paidDate = new Date();
  }

  const invoice = await db.invoice.update({
    where: { id },
    data,
    include: { lineItems: true, payments: true },
  });

  return NextResponse.json(invoice);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const existing = await db.invoice.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.invoice.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
