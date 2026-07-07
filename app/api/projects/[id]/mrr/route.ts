import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const snapshots = await db.mRRSnapshot.findMany({
    where: { projectId: id },
    orderBy: { date: "desc" },
    take: 12,
  });
  return NextResponse.json(snapshots);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  if (!body.mrr && body.mrr !== 0) {
    return NextResponse.json({ error: "mrr is required" }, { status: 400 });
  }

  // Use first of current month if no date provided
  const now = new Date();
  const date = body.date
    ? new Date(body.date)
    : new Date(now.getFullYear(), now.getMonth(), 1);

  const snapshot = await db.mRRSnapshot.upsert({
    where: {
      projectId_date: {
        projectId: id,
        date,
      },
    },
    update: { mrr: body.mrr, notes: body.notes || null },
    create: {
      projectId: id,
      date,
      mrr: body.mrr,
      notes: body.notes || null,
    },
  });

  // Update project's mrr field
  await db.project.update({
    where: { id },
    data: { mrr: body.mrr },
  });

  return NextResponse.json(snapshot, { status: 201 });
}
