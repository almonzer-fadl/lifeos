import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_request: NextRequest) {
  const panels = await db.thyroidPanel.findMany({ orderBy: { date: "desc" }, take: 20 });
  return NextResponse.json(panels);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.tsh === undefined) return NextResponse.json({ error: "tsh is required" }, { status: 400 });

  const panel = await db.thyroidPanel.create({
    data: {
      date: body.date ? new Date(body.date) : new Date(),
      tsh: body.tsh,
      ft3: body.ft3 ?? undefined,
      ft4: body.ft4 ?? undefined,
      labName: body.labName || null,
      notes: body.notes || null,
    },
  });
  return NextResponse.json(panel, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await db.thyroidPanel.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
