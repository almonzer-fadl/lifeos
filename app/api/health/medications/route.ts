import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const where: Record<string, unknown> = {};
  if (type) where.type = type;

  const meds = await db.medication.findMany({ where, include: { logs: { take: 7, orderBy: { date: "desc" } } }, orderBy: { name: "asc" } });
  return NextResponse.json(meds);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.name || !body.dosage || !body.frequency) {
    return NextResponse.json({ error: "name, dosage, and frequency are required" }, { status: 400 });
  }

  const med = await db.medication.create({
    data: {
      name: body.name, type: body.type || "prescription", dosage: body.dosage,
      frequency: body.frequency, timeOfDay: body.timeOfDay || null,
      startDate: body.startDate ? new Date(body.startDate) : new Date(),
      prescribingDoctor: body.prescribingDoctor || null,
      pharmacy: body.pharmacy || null, cost: body.cost ?? undefined,
      refillReminder: body.refillReminder || false, notes: body.notes || null,
    },
  });
  return NextResponse.json(med, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  const data: Record<string, unknown> = {};
  if (body.endDate !== undefined) data.endDate = body.endDate ? new Date(body.endDate) : new Date();
  if (body.refillReminder !== undefined) data.refillReminder = body.refillReminder;
  const med = await db.medication.update({ where: { id: body.id }, data });
  return NextResponse.json(med);
}
