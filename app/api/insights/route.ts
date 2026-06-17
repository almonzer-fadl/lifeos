import { NextRequest, NextResponse } from "next/server";
import { getActiveInsights, dismissInsight, markInsightActedOn, cleanupExpiredInsights } from "@/lib/insights";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);

    await cleanupExpiredInsights();
    const insights = await getActiveInsights(limit);

    return NextResponse.json(insights);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id || !body.action) {
      return NextResponse.json({ error: "id and action are required" }, { status: 400 });
    }

    if (body.action === "dismiss") {
      await dismissInsight(body.id);
      return NextResponse.json({ success: true, dismissed: true });
    }

    if (body.action === "acted") {
      await markInsightActedOn(body.id);
      return NextResponse.json({ success: true, actedOn: true });
    }

    return NextResponse.json({ error: "Invalid action. Use 'dismiss' or 'acted'." }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
