import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const ALL_SITES = [
  "abdomen_l", "abdomen_r",
  "thigh_l", "thigh_r",
  "arm_l", "arm_r",
  "buttock_l", "buttock_r",
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const insulinType = searchParams.get("insulinType");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where: Record<string, unknown> = {};
  if (insulinType) where.insulinType = insulinType;

  const recent = await db.injectionSite.findMany({
    where,
    orderBy: { usedAt: "desc" },
    take: limit,
  });

  return NextResponse.json(recent);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.site || !ALL_SITES.includes(body.site)) {
    return NextResponse.json(
      { error: `site is required. Valid: ${ALL_SITES.join(", ")}` },
      { status: 400 }
    );
  }

  const site = await db.injectionSite.create({
    data: {
      site: body.site,
      usedAt: body.usedAt ? new Date(body.usedAt) : new Date(),
      insulinType: body.insulinType || "rapid",
      notes: body.notes || null,
    },
  });

  return NextResponse.json(site, { status: 201 });
}
