import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.medicationId) return NextResponse.json({ error: "medicationId is required" }, { status: 400 });

  const log = await db.medicationLog.create({
    data: {
      medicationId: body.medicationId,
      date: body.date ? new Date(body.date) : new Date(),
      taken: body.taken !== undefined ? body.taken : true,
      time: body.time ? new Date(body.time) : undefined,
      dosage: body.dosage || null,
      notes: body.notes || null,
    },
  });
  return NextResponse.json(log, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await db.medicationLog.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
