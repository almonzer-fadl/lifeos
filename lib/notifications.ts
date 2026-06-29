import { db } from "@/lib/db";
import { events, EventTypes } from "@/lib/events";

interface CreateNotificationInput {
  title: string;
  body: string;
  href?: string;
}

export async function createNotification(
  input: CreateNotificationInput
): Promise<void> {
  await db.notification.create({
    data: {
      title: input.title,
      body: input.body,
      href: input.href || null,
    },
  });

  await events.emit(EventTypes.NOTIFICATION_CREATED, input);
}

export async function getUnreadNotifications(limit = 20) {
  return db.notification.findMany({
    where: { read: false },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getUnpushedNotifications(limit = 10) {
  return db.notification.findMany({
    where: { pushed: false },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function markAsRead(id: string) {
  return db.notification.update({
    where: { id },
    data: { read: true },
  });
}

export async function markAsReadBulk(ids: string[]) {
  return db.notification.updateMany({
    where: { id: { in: ids } },
    data: { read: true },
  });
}

export async function markAsPushed(ids: string[]) {
  return db.notification.updateMany({
    where: { id: { in: ids } },
    data: { pushed: true },
  });
}

export async function getUnreadCount(): Promise<number> {
  return db.notification.count({ where: { read: false } });
}

// ─── Insight → Notification bridge ──────────────────────────

export function startInsightNotificationBridge(): () => void {
  const unsub = events.on<{
    id: string;
    type: string;
    urgency: "high" | "medium" | "low";
    headline: string;
  }>(EventTypes.INSIGHT_GENERATED, async (insight) => {
    // Only push high-urgency insights as notifications
    if (insight.urgency !== "high") return;

    const hrefMap: Record<string, string> = {
      glucose: "/t1d",
      sleep: "/sleep",
      habit: "/habits",
      finance: "/finance",
      task: "/tasks",
      activity: "/activity",
      prayer: "/prayer",
    };

    await createNotification({
      title: insight.headline,
      body: `High priority ${insight.type} alert. Tap to view.`,
      href: hrefMap[insight.type] || "/",
    });
  });

  return unsub;
}

// ─── Cleanup ────────────────────────────────────────────────

export async function cleanupOldNotifications(daysRetain = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysRetain);

  return db.notification.deleteMany({
    where: {
      read: true,
      createdAt: { lt: cutoff },
    },
  });
}
