import { NextRequest, NextResponse } from "next/server";
import {
  getUnreadNotifications,
  getUnpushedNotifications,
  markAsRead,
  markAsReadBulk,
  markAsPushed,
  getUnreadCount,
  cleanupOldNotifications,
} from "@/lib/notifications";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode");

    // Poll endpoint for service worker / client polling
    if (mode === "poll") {
      const unpushed = await getUnpushedNotifications(10);
      if (unpushed.length > 0) {
        await markAsPushed(unpushed.map((n) => n.id));
      }
      return NextResponse.json(unpushed);
    }

    // Count only
    if (mode === "count") {
      await cleanupOldNotifications(30);
      const count = await getUnreadCount();
      return NextResponse.json({ count });
    }

    // Default: list unread
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    await cleanupOldNotifications(30);
    const notifications = await getUnreadNotifications(limit);

    return NextResponse.json(notifications);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.action === "read" && body.id) {
      await markAsRead(body.id);
      return NextResponse.json({ success: true });
    }

    if (body.action === "read_all" && body.ids && Array.isArray(body.ids)) {
      await markAsReadBulk(body.ids);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Use action=read with id, or action=read_all with ids[]" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
