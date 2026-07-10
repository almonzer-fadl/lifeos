import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const templates = await db.journalTemplate.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(templates);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.name || !body.entryType || !body.prompts) {
    return NextResponse.json({ error: "name, entryType, and prompts are required" }, { status: 400 });
  }

  const template = await db.journalTemplate.create({
    data: {
      name: body.name,
      entryType: body.entryType,
      prompts: body.prompts,
      isActive: body.isActive !== false,
    },
  });

  return NextResponse.json(template, { status: 201 });
}
