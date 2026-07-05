import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/api-middleware";
import { DEFAULTS } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const groupId = searchParams.get("groupId");
  const health = searchParams.get("health");
  const keyPerson = searchParams.get("keyPerson");
  const isActive = searchParams.get("isActive");
  const search = searchParams.get("search");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (groupId) where.groupId = groupId;
  if (health) where.relationshipHealth = health;
  if (keyPerson === "true") where.isKeyPerson = true;
  if (isActive === "false") where.isActive = false;
  if (isActive === "true" || !isActive) where.isActive = true;
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: "insensitive" } },
      { firstName: { contains: search, mode: "insensitive" } },
      { bio: { contains: search, mode: "insensitive" } },
    ];
  }

  const contacts = await db.contact.findMany({
    where,
    orderBy: [{ isKeyPerson: "desc" }, { fullName: "asc" }],
    take: limit,
    include: {
      group: true,
      _count: { select: { interactions: true } },
    },
  });

  return NextResponse.json(contacts);
}

export async function POST(request: NextRequest) {
  const limit = checkRateLimit(request, DEFAULTS.MUTATION);
  if (limit) return limit;

  const body = await request.json();

  if (!body.firstName || !body.type) {
    return NextResponse.json({ error: "firstName and type are required" }, { status: 400 });
  }

  const validTypes = ["family", "partner", "friend", "client", "mentor", "colleague", "acquaintance"];
  if (!validTypes.includes(body.type)) {
    return NextResponse.json({ error: `type must be one of: ${validTypes.join(", ")}` }, { status: 400 });
  }

  const fullName = body.lastName
    ? `${body.firstName} ${body.lastName}`
    : body.firstName;

  const contact = await db.contact.create({
    data: {
      firstName: body.firstName,
      lastName: body.lastName || null,
      fullName,
      type: body.type,
      subType: body.subType || null,
      groupId: body.groupId || null,
      birthday: body.birthday ? new Date(body.birthday) : null,
      birthYear: body.birthYear || null,
      nationality: body.nationality || null,
      location: body.location || null,
      languages: body.languages || null,
      email: body.email || null,
      phone: body.phone || null,
      whatsapp: body.whatsapp || null,
      telegram: body.telegram || null,
      socialLinks: body.socialLinks || null,
      bio: body.bio || null,
      preferences: body.preferences || null,
      importantDates: body.importantDates || null,
      relationshipHealth: body.relationshipHealth || null,
      nextFollowUpAt: body.nextFollowUpAt ? new Date(body.nextFollowUpAt) : null,
      followUpFrequency: body.followUpFrequency || null,
      isKeyPerson: body.isKeyPerson || false,
      isActive: body.isActive !== false,
    },
    include: { group: true },
  });

  return NextResponse.json(contact, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const existing = await db.contact.findUnique({ where: { id: body.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const validTypes = ["family", "partner", "friend", "client", "mentor", "colleague", "acquaintance"];
  const validHealth = ["strong", "good", "needs_attention", "strained", "dormant"];
  const validFrequencies = ["daily", "weekly", "biweekly", "monthly", "quarterly"];

  const data: Record<string, unknown> = {};
  if (body.firstName) data.firstName = body.firstName;
  if (body.lastName !== undefined) data.lastName = body.lastName;
  if (body.firstName || body.lastName !== undefined) {
    const fn = body.firstName || existing.firstName;
    const ln = body.lastName !== undefined ? body.lastName : existing.lastName;
    data.fullName = ln ? `${fn} ${ln}` : fn;
  }
  if (body.type && validTypes.includes(body.type)) data.type = body.type;
  if (body.subType !== undefined) data.subType = body.subType;
  if (body.groupId !== undefined) data.groupId = body.groupId;
  if (body.birthday !== undefined) data.birthday = body.birthday ? new Date(body.birthday) : null;
  if (body.birthYear !== undefined) data.birthYear = body.birthYear;
  if (body.nationality !== undefined) data.nationality = body.nationality;
  if (body.location !== undefined) data.location = body.location;
  if (body.languages !== undefined) data.languages = body.languages;
  if (body.email !== undefined) data.email = body.email;
  if (body.phone !== undefined) data.phone = body.phone;
  if (body.whatsapp !== undefined) data.whatsapp = body.whatsapp;
  if (body.telegram !== undefined) data.telegram = body.telegram;
  if (body.socialLinks !== undefined) data.socialLinks = body.socialLinks;
  if (body.bio !== undefined) data.bio = body.bio;
  if (body.preferences !== undefined) data.preferences = body.preferences;
  if (body.importantDates !== undefined) data.importantDates = body.importantDates;
  if (body.relationshipHealth && validHealth.includes(body.relationshipHealth)) data.relationshipHealth = body.relationshipHealth;
  if (body.lastContactedAt !== undefined) data.lastContactedAt = body.lastContactedAt ? new Date(body.lastContactedAt) : null;
  if (body.nextFollowUpAt !== undefined) data.nextFollowUpAt = body.nextFollowUpAt ? new Date(body.nextFollowUpAt) : null;
  if (body.followUpFrequency && validFrequencies.includes(body.followUpFrequency)) data.followUpFrequency = body.followUpFrequency;
  if (body.isKeyPerson !== undefined) data.isKeyPerson = body.isKeyPerson;
  if (body.isActive !== undefined) data.isActive = body.isActive;

  const contact = await db.contact.update({
    where: { id: body.id },
    data,
    include: { group: true },
  });

  return NextResponse.json(contact);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  await db.contact.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
