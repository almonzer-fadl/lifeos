import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_request: NextRequest) {
  const records = await db.hbA1cRecord.findMany({ orderBy: { date: "desc" }, take: 20 });
  return NextResponse.json(records);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.value) return NextResponse.json({ error: "value is required" }, { status: 400 });

  const record = await db.hbA1cRecord.create({
    data: {
      date: body.date ? new Date(body.date) : new Date(),
      value: body.value,
      method: body.method || "lab",
      notes: body.notes || null,
    },
  });
  return NextResponse.json(record, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await db.hbA1cRecord.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
