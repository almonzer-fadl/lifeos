import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/api-middleware";
import { DEFAULTS } from "@/lib/rate-limit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);

  const contact = await db.contact.findUnique({ where: { id } });
  if (!contact) return NextResponse.json({ error: "Contact not found" }, { status: 404 });

  const interactions = await db.interaction.findMany({
    where: { contactId: id },
    orderBy: { date: "desc" },
    take: limit,
  });

  return NextResponse.json({ contact: { id: contact.id, fullName: contact.fullName }, interactions });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const limit = checkRateLimit(request, DEFAULTS.MUTATION);
  if (limit) return limit;

  const body = await request.json();

  const contact = await db.contact.findUnique({ where: { id } });
  if (!contact) return NextResponse.json({ error: "Contact not found" }, { status: 404 });

  const validTypes = ["call", "message", "meeting", "email", "video_call", "in_person"];
  const validDirections = ["outgoing", "incoming"];
  const validMoods = ["positive", "neutral", "negative"];

  if (!body.type || !validTypes.includes(body.type)) {
    return NextResponse.json({ error: `type must be one of: ${validTypes.join(", ")}` }, { status: 400 });
  }
  if (body.direction && !validDirections.includes(body.direction)) {
    return NextResponse.json({ error: `direction must be outgoing or incoming` }, { status: 400 });
  }
  if (body.mood && !validMoods.includes(body.mood)) {
    return NextResponse.json({ error: `mood must be positive, neutral, or negative` }, { status: 400 });
  }
  if (!body.summary) {
    return NextResponse.json({ error: "summary is required" }, { status: 400 });
  }

  const interaction = await db.interaction.create({
    data: {
      contactId: id,
      date: body.date ? new Date(body.date) : new Date(),
      type: body.type,
      direction: body.direction || "outgoing",
      platform: body.platform || null,
      summary: body.summary,
      actionItems: body.actionItems || null,
      mood: body.mood || null,
      duration: body.duration || null,
      tags: body.tags || null,
    },
  });

  // Update contact's lastContactedAt
  await db.contact.update({
    where: { id },
    data: {
      lastContactedAt: new Date(),
      nextFollowUpAt: contact.followUpFrequency
        ? calculateNextFollowUp(contact.followUpFrequency)
        : undefined,
    },
  });

  return NextResponse.json(interaction, { status: 201 });
}

function calculateNextFollowUp(frequency: string): Date {
  const now = new Date();
  switch (frequency) {
    case "daily":
      now.setDate(now.getDate() + 1);
      break;
    case "weekly":
      now.setDate(now.getDate() + 7);
      break;
    case "biweekly":
      now.setDate(now.getDate() + 14);
      break;
    case "monthly":
      now.setMonth(now.getMonth() + 1);
      break;
    case "quarterly":
      now.setMonth(now.getMonth() + 3);
      break;
    default:
      now.setDate(now.getDate() + 7);
  }
  return now;
}
