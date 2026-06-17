type EventHandler<T = unknown> = (payload: T) => void | Promise<void>;

const listeners = new Map<string, Set<EventHandler>>();

function getHandlers(event: string): Set<EventHandler> {
  let set = listeners.get(event);
  if (!set) {
    set = new Set();
    listeners.set(event, set);
  }
  return set;
}

export const events = {
  on<T = unknown>(event: string, handler: EventHandler<T>): () => void {
    const set = getHandlers(event);
    set.add(handler as EventHandler);
    return () => set.delete(handler as EventHandler);
  },

  off<T = unknown>(event: string, handler: EventHandler<T>): void {
    const set = listeners.get(event);
    if (set) set.delete(handler as EventHandler);
  },

  async emit<T = unknown>(event: string, payload: T): Promise<void> {
    const set = listeners.get(event);
    if (!set || set.size === 0) return;
    const promises = Array.from(set).map((handler) => {
      try {
        const result = handler(payload);
        return result instanceof Promise ? result : Promise.resolve();
      } catch {
        return Promise.resolve();
      }
    });
    await Promise.allSettled(promises);
  },

  removeAll(event?: string): void {
    if (event) {
      listeners.delete(event);
    } else {
      listeners.clear();
    }
  },

  listenerCount(event: string): number {
    const set = listeners.get(event);
    return set ? set.size : 0;
  },

  eventNames(): string[] {
    return Array.from(listeners.keys());
  },
};

// ─── Predefined event constants ──────────────────────────────

export const EventTypes = {
  // T1D
  GLUCOSE_READING: "glucose:reading",
  GLUCOSE_LOW: "glucose:low",
  GLUCOSE_HIGH: "glucose:high",
  INSULIN_DOSE: "insulin:dose",

  // Activity
  ACTIVITY_COMPLETED: "activity:completed",
  PR_ACHIEVED: "pr:achieved",

  // Sleep
  SLEEP_SESSION: "sleep:session",

  // Habits
  HABIT_COMPLETED: "habit:completed",
  HABIT_MISSED: "habit:missed",
  HABIT_STREAK_MILESTONE: "habit:streak_milestone",

  // Tasks
  TASK_COMPLETED: "task:completed",

  // Finance
  TRANSACTION_CREATED: "transaction:created",
  BUDGET_OVERSPENT: "budget:overspent",
  PAYMENT_RECEIVED: "finance:payment_received",

  // Prayer
  PRAYER_COMPLETED: "prayer:completed",
  PRAYER_MISSED: "prayer:missed",

  // Cross-module
  INSIGHT_GENERATED: "insight:generated",
  NOTIFICATION_CREATED: "notification:created",
} as const;
