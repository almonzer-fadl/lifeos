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
  const insulinType = searchParams.get("insulinType") || "rapid";

  // Find the most recent use of each site for this insulin type
  const siteUses = await db.injectionSite.groupBy({
    by: ["site"],
    where: { insulinType },
    _max: { usedAt: true },
  });

  const siteLastUsed = new Map<string, Date>();
  for (const s of siteUses) {
    if (s._max.usedAt) siteLastUsed.set(s.site, s._max.usedAt);
  }

  // Sites not used yet = oldest (recommend first)
  let nextSite = ALL_SITES.find((s) => !siteLastUsed.has(s));

  // Otherwise, find the site used longest ago
  if (!nextSite) {
    let oldestDate = new Date();
    for (const site of ALL_SITES) {
      const lastUsed = siteLastUsed.get(site);
      if (lastUsed && lastUsed < oldestDate) {
        oldestDate = lastUsed;
        nextSite = site;
      }
    }
  }

  // Build rotation history
  const rotation = ALL_SITES.map((site) => ({
    site,
    lastUsed: siteLastUsed.get(site)?.toISOString() || null,
    hoursSinceLastUse: siteLastUsed.has(site)
      ? Math.round((Date.now() - siteLastUsed.get(site)!.getTime()) / 3600000)
      : null,
  })).sort((a, b) => {
    if (!a.lastUsed) return -1;
    if (!b.lastUsed) return 1;
    return new Date(a.lastUsed).getTime() - new Date(b.lastUsed).getTime();
  });

  return NextResponse.json({
    recommendedSite: nextSite,
    rotation,
    insulinType,
  });
}
