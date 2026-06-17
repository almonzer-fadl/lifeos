import { describe, it, expect, beforeEach, vi } from "vitest";
import { events, EventTypes } from "@/lib/events";

describe("event bus", () => {
  beforeEach(() => {
    events.removeAll();
  });

  describe("on / emit", () => {
    it("calls a handler when an event is emitted", async () => {
      const handler = vi.fn();
      events.on("test", handler);
      await events.emit("test", { value: 42 });
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({ value: 42 });
    });

    it("calls multiple handlers for the same event", async () => {
      const h1 = vi.fn();
      const h2 = vi.fn();
      events.on("test", h1);
      events.on("test", h2);
      await events.emit("test", null);
      expect(h1).toHaveBeenCalledTimes(1);
      expect(h2).toHaveBeenCalledTimes(1);
    });

    it("does not throw when emitting an event with no listeners", async () => {
      await expect(events.emit("nonexistent", null)).resolves.toBeUndefined();
    });

    it("supports async handlers", async () => {
      const results: number[] = [];
      events.on("async_test", async () => {
        await new Promise((r) => setTimeout(r, 5));
        results.push(1);
      });
      events.on("async_test", async () => {
        results.push(2);
      });
      await events.emit("async_test", null);
      expect(results).toContain(1);
      expect(results).toContain(2);
    });

    it("does not propagate errors from one handler to another", async () => {
      const goodHandler = vi.fn();
      events.on("error_test", () => {
        throw new Error("boom");
      });
      events.on("error_test", goodHandler);
      await events.emit("error_test", null);
      expect(goodHandler).toHaveBeenCalledTimes(1);
    });

    it("handles async handler rejections without failing", async () => {
      const goodHandler = vi.fn();
      events.on("reject_test", async () => {
        throw new Error("async boom");
      });
      events.on("reject_test", goodHandler);
      await events.emit("reject_test", null);
      expect(goodHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe("off", () => {
    it("removes a specific handler", async () => {
      const handler = vi.fn();
      events.on("test", handler);
      events.off("test", handler);
      await events.emit("test", null);
      expect(handler).not.toHaveBeenCalled();
    });

    it("only removes the specified handler", async () => {
      const h1 = vi.fn();
      const h2 = vi.fn();
      events.on("test", h1);
      events.on("test", h2);
      events.off("test", h1);
      await events.emit("test", null);
      expect(h1).not.toHaveBeenCalled();
      expect(h2).toHaveBeenCalledTimes(1);
    });

    it("does not throw when removing a non-existent handler", () => {
      expect(() => events.off("test", vi.fn())).not.toThrow();
    });
  });

  describe("on returns unsubscribe function", () => {
    it("unsubscribes when the returned function is called", async () => {
      const handler = vi.fn();
      const unsub = events.on("test", handler);
      unsub();
      await events.emit("test", null);
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe("removeAll", () => {
    it("removes all handlers for a specific event", async () => {
      const h1 = vi.fn();
      const h2 = vi.fn();
      events.on("a", h1);
      events.on("b", h2);
      events.removeAll("a");
      await events.emit("a", null);
      await events.emit("b", null);
      expect(h1).not.toHaveBeenCalled();
      expect(h2).toHaveBeenCalledTimes(1);
    });

    it("removes all handlers for all events when no event specified", async () => {
      const h1 = vi.fn();
      const h2 = vi.fn();
      events.on("a", h1);
      events.on("b", h2);
      events.removeAll();
      await events.emit("a", null);
      await events.emit("b", null);
      expect(h1).not.toHaveBeenCalled();
      expect(h2).not.toHaveBeenCalled();
    });
  });

  describe("listenerCount", () => {
    it("returns 0 when no handlers are registered", () => {
      expect(events.listenerCount("test")).toBe(0);
    });

    it("returns the correct count after adding handlers", () => {
      events.on("test", vi.fn());
      events.on("test", vi.fn());
      expect(events.listenerCount("test")).toBe(2);
    });

    it("returns 0 after removing all handlers", () => {
      events.on("test", vi.fn());
      events.removeAll("test");
      expect(events.listenerCount("test")).toBe(0);
    });
  });

  describe("eventNames", () => {
    it("returns an empty array when no events are registered", () => {
      expect(events.eventNames()).toEqual([]);
    });

    it("returns all registered event names", () => {
      events.on("a", vi.fn());
      events.on("b", vi.fn());
      const names = events.eventNames();
      expect(names).toContain("a");
      expect(names).toContain("b");
      expect(names).toHaveLength(2);
    });

    it("does not include events that have been cleared", () => {
      events.on("a", vi.fn());
      events.removeAll("a");
      expect(events.eventNames()).toEqual([]);
    });
  });

  describe("EventTypes constants", () => {
    it("all predefined event types are unique strings", () => {
      const values = Object.values(EventTypes);
      const unique = new Set(values);
      expect(unique.size).toBe(values.length);
    });

    it("includes all expected event types", () => {
      expect(EventTypes.GLUCOSE_READING).toBe("glucose:reading");
      expect(EventTypes.GLUCOSE_LOW).toBe("glucose:low");
      expect(EventTypes.GLUCOSE_HIGH).toBe("glucose:high");
      expect(EventTypes.INSULIN_DOSE).toBe("insulin:dose");
      expect(EventTypes.ACTIVITY_COMPLETED).toBe("activity:completed");
      expect(EventTypes.PR_ACHIEVED).toBe("pr:achieved");
      expect(EventTypes.SLEEP_SESSION).toBe("sleep:session");
      expect(EventTypes.HABIT_COMPLETED).toBe("habit:completed");
      expect(EventTypes.HABIT_MISSED).toBe("habit:missed");
      expect(EventTypes.HABIT_STREAK_MILESTONE).toBe("habit:streak_milestone");
      expect(EventTypes.TASK_COMPLETED).toBe("task:completed");
      expect(EventTypes.TRANSACTION_CREATED).toBe("transaction:created");
      expect(EventTypes.BUDGET_OVERSPENT).toBe("budget:overspent");
      expect(EventTypes.PAYMENT_RECEIVED).toBe("finance:payment_received");
      expect(EventTypes.PRAYER_COMPLETED).toBe("prayer:completed");
      expect(EventTypes.PRAYER_MISSED).toBe("prayer:missed");
      expect(EventTypes.INSIGHT_GENERATED).toBe("insight:generated");
      expect(EventTypes.NOTIFICATION_CREATED).toBe("notification:created");
    });
  });

  describe("real-world flow: glucose low after exercise", () => {
    it("chains events correctly", async () => {
      const exerciseLog: unknown[] = [];
      const glucoseLog: unknown[] = [];
      const insightLog: unknown[] = [];

      // Activity module logs a run
      events.on(EventTypes.ACTIVITY_COMPLETED, (p) => {
        exerciseLog.push(p);
      });

      // T1D module logs a glucose reading -> checks if low
      events.on<{ value: number; timestamp?: string }>(EventTypes.GLUCOSE_READING, (p) => {
        glucoseLog.push(p);
        if (p.value < 70) {
          events.emit(EventTypes.GLUCOSE_LOW, {
            value: p.value,
            timestamp: p.timestamp,
          });
        }
      });

      events.on<{ value: number }>(EventTypes.GLUCOSE_LOW, (p) => {
        insightLog.push({
          type: "glucose_low_after_exercise",
          glucose: p.value,
        });
      });

      // Simulate: run completed, then glucose reading of 65
      await events.emit(EventTypes.ACTIVITY_COMPLETED, {
        type: "run",
        duration: 5400,
        distance: 15000,
      });
      await events.emit(EventTypes.GLUCOSE_READING, {
        value: 65,
        timestamp: new Date().toISOString(),
      });

      expect(exerciseLog).toHaveLength(1);
      expect(glucoseLog).toHaveLength(1);
      expect(insightLog).toHaveLength(1);
      expect(insightLog[0]).toMatchObject({
        type: "glucose_low_after_exercise",
        glucose: 65,
      });
    });
  });
});
