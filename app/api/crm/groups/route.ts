import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/api-middleware";
import { DEFAULTS } from "@/lib/rate-limit";

export async function GET() {
  const groups = await db.contactGroup.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { contacts: true } } },
  });
  return NextResponse.json(groups);
}

export async function POST(request: NextRequest) {
  const limit = checkRateLimit(request, DEFAULTS.MUTATION);
  if (limit) return limit;

  const body = await request.json();
  if (!body.name) return NextResponse.json({ error: "name is required" }, { status: 400 });

  const group = await db.contactGroup.create({
    data: {
      name: body.name,
      color: body.color || null,
      icon: body.icon || null,
      sortOrder: body.sortOrder ?? 0,
    },
  });

  return NextResponse.json(group, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const contacts = await db.contact.count({ where: { groupId: id } });
  if (contacts > 0) {
    return NextResponse.json({ error: `Cannot delete group with ${contacts} contacts. Remove contacts first.` }, { status: 400 });
  }

  await db.contactGroup.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
