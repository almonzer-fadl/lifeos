import { describe, it, expect, beforeEach, vi } from "vitest";
import { events, EventTypes } from "@/lib/events";

// Mutable store — reset in beforeEach
let store: Array<{
  id: string;
  title: string;
  body: string;
  href: string | null;
  read: boolean;
  pushed: boolean;
  createdAt: Date;
}> = [];

vi.mock("@/lib/db", () => {
  const getStore = () => store;

  return {
    db: {
      notification: {
        create: vi.fn(async (args: { data: { title: string; body: string; href: string | null } }) => {
          const s = getStore();
          const notif = { id: `notif_${s.length + 1}`, ...args.data, read: false, pushed: false, createdAt: new Date() };
          s.push(notif);
          return notif;
        }),
        findMany: vi.fn(async (args: { where?: Record<string, unknown>; orderBy?: Record<string, string>; take?: number }) => {
          let results = [...getStore()];
          if (args.where?.read !== undefined) results = results.filter((n) => n.read === args.where!.read);
          if (args.where?.pushed !== undefined) results = results.filter((n) => n.pushed === args.where!.pushed);
          if (args.orderBy?.createdAt === "desc") results.reverse();
          if (args.take) results = results.slice(0, args.take);
          return results;
        }),
        update: vi.fn(async (args: { where: { id: string }; data: { read?: boolean } }) => {
          const s = getStore();
          const idx = s.findIndex((n) => n.id === args.where.id);
          if (idx === -1) throw new Error("Not found");
          Object.assign(s[idx], args.data);
          return s[idx];
        }),
        updateMany: vi.fn(async (args: { where: { id: { in: string[] } }; data: { read?: boolean; pushed?: boolean } }) => {
          let count = 0;
          for (const n of getStore()) {
            if (args.where.id.in.includes(n.id)) { Object.assign(n, args.data); count++; }
          }
          return { count };
        }),
        count: vi.fn(async (args: { where: { read?: boolean } }) => {
          return getStore().filter((n) => n.read === (args.where.read ?? false)).length;
        }),
        deleteMany: vi.fn(async () => ({ count: 0 })),
      },
    },
  };
});

import {
  createNotification,
  getUnreadNotifications,
  getUnpushedNotifications,
  getUnreadCount,
  startInsightNotificationBridge,
} from "@/lib/notifications";

describe("notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store = [];
    events.removeAll();
  });

  describe("createNotification", () => {
    it("creates a notification and emits an event", async () => {
      const handler = vi.fn();
      events.on(EventTypes.NOTIFICATION_CREATED, handler);

      await createNotification({ title: "Test", body: "This is a test", href: "/test" });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({ title: "Test", body: "This is a test", href: "/test" });
    });

    it("creates without href", async () => {
      const handler = vi.fn();
      events.on(EventTypes.NOTIFICATION_CREATED, handler);

      await createNotification({ title: "No link", body: "Just a message" });

      expect(handler).toHaveBeenCalledWith({ title: "No link", body: "Just a message" });
    });
  });

  describe("getUnreadNotifications", () => {
    it("returns empty array with clean store", async () => {
      const result = await getUnreadNotifications();
      expect(result).toEqual([]);
    });
  });

  describe("getUnpushedNotifications", () => {
    it("returns empty array with clean store", async () => {
      const result = await getUnpushedNotifications();
      expect(result).toEqual([]);
    });
  });

  describe("getUnreadCount", () => {
    it("returns 0 with clean store", async () => {
      const count = await getUnreadCount();
      expect(count).toBe(0);
    });
  });

  describe("insight notification bridge", () => {
    it("creates notification for high-urgency insights", async () => {
      const unsub = startInsightNotificationBridge();
      const handler = vi.fn();
      events.on(EventTypes.NOTIFICATION_CREATED, handler);

      await events.emit(EventTypes.INSIGHT_GENERATED, {
        id: "i1", type: "glucose", urgency: "high", headline: "12 highs in 30 days",
      });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(expect.objectContaining({ title: "12 highs in 30 days", href: "/t1d" }));
      unsub();
    });

    it("does NOT create notification for low-urgency", async () => {
      const unsub = startInsightNotificationBridge();
      const handler = vi.fn();
      events.on(EventTypes.NOTIFICATION_CREATED, handler);

      await events.emit(EventTypes.INSIGHT_GENERATED, {
        id: "i2", type: "sleep", urgency: "low", headline: "Solid 7.5h",
      });

      expect(handler).not.toHaveBeenCalled();
      unsub();
    });

    it("does NOT create notification for medium-urgency", async () => {
      const unsub = startInsightNotificationBridge();
      const handler = vi.fn();
      events.on(EventTypes.NOTIFICATION_CREATED, handler);

      await events.emit(EventTypes.INSIGHT_GENERATED, {
        id: "i3", type: "habit", urgency: "medium", headline: "40% completion",
      });

      expect(handler).not.toHaveBeenCalled();
      unsub();
    });

    it("maps insight types to correct hrefs", async () => {
      const unsub = startInsightNotificationBridge();
      const results: Array<{ title: string; href: string }> = [];
      events.on(EventTypes.NOTIFICATION_CREATED, (p: unknown) => {
        const n = p as { title: string; href: string };
        results.push({ title: n.title, href: n.href });
      });

      await events.emit(EventTypes.INSIGHT_GENERATED, { id: "a", type: "finance", urgency: "high", headline: "Deficit" });
      await events.emit(EventTypes.INSIGHT_GENERATED, { id: "b", type: "task", urgency: "high", headline: "Tasks piling" });
      await events.emit(EventTypes.INSIGHT_GENERATED, { id: "c", type: "activity", urgency: "high", headline: "No activity" });
      await events.emit(EventTypes.INSIGHT_GENERATED, { id: "d", type: "prayer", urgency: "high", headline: "Missed" });

      expect(results).toHaveLength(4);
      expect(results[0].href).toBe("/finance");
      expect(results[1].href).toBe("/tasks");
      expect(results[2].href).toBe("/activity");
      expect(results[3].href).toBe("/prayer");
      unsub();
    });

    it("stops listening after unsub", async () => {
      const unsub = startInsightNotificationBridge();
      const handler = vi.fn();
      events.on(EventTypes.NOTIFICATION_CREATED, handler);
      unsub();

      await events.emit(EventTypes.INSIGHT_GENERATED, {
        id: "x", type: "glucose", urgency: "high", headline: "Test",
      });

      expect(handler).not.toHaveBeenCalled();
    });
  });
});
