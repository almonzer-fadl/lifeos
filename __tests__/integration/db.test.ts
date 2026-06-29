import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db";

// Integration tests — require a running PostgreSQL with the schema applied.
// Run: DATABASE_URL=postgresql://... npx vitest run __tests__/integration/

describe("database connection", () => {
  it("can connect and query", async () => {
    const result = await db.$queryRaw<Array<{ one: number }>>`SELECT 1 AS one`;
    expect(result[0].one).toBe(1);
  });
});

describe("crud roundtrip", () => {
  const testAccountId = "test-integration-account";

  afterAll(async () => {
    await db.transactionAudit.deleteMany({ where: { transaction: { accountId: testAccountId } } });
    await db.transaction.deleteMany({ where: { accountId: testAccountId } });
    await db.account.deleteMany({ where: { id: testAccountId } });
  });

  it("creates and reads an account + transaction", async () => {
    // Create account
    const account = await db.account.create({
      data: {
        id: testAccountId,
        name: "Integration Test Account",
        type: "checking",
        currency: "MYR",
        initialBalance: 50000, // 500.00 MYR in cents
      },
    });
    expect(account.name).toBe("Integration Test Account");

    // Create transaction
    const tx = await db.transaction.create({
      data: {
        accountId: testAccountId,
        type: "expense",
        amount: 1500, // 15.00 MYR in cents
        currency: "MYR",
        description: "Integration test expense",
        status: "cleared",
      },
      include: { account: true },
    });
    expect(tx.amount).toBe(1500);
    expect(tx.account.name).toBe("Integration Test Account");

    // Read back
    const found = await db.transaction.findFirst({
      where: { description: "Integration test expense" },
    });
    expect(found).not.toBeNull();
    expect(found!.amount).toBe(1500);
  });
});

describe("search integration", () => {
  const testHabitId = "test-search-habit";

  afterAll(async () => {
    await db.habitLog.deleteMany({ where: { habitId: testHabitId } });
    await db.habit.deleteMany({ where: { id: testHabitId } });
  });

  it("finds a habit by name via ILIKE search", async () => {
    await db.habit.create({
      data: {
        id: testHabitId,
        name: "Integration Test Habit Search",
        frequency: "daily",
      },
    });

    const results = await db.habit.findMany({
      where: { name: { contains: "Habit Search", mode: "insensitive" } },
    });

    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((h) => h.id === testHabitId)).toBe(true);
  });
});

describe("notification persistence", () => {
  afterAll(async () => {
    await db.notification.deleteMany({
      where: { title: { contains: "Integration test" } },
    });
  });

  it("creates and queries notifications", async () => {
    const notif = await db.notification.create({
      data: {
        title: "Integration test notification",
        body: "Created during integration test run",
        href: "/test",
      },
    });
    expect(notif.id).toBeTruthy();
    expect(notif.read).toBe(false);
    expect(notif.pushed).toBe(false);

    const unread = await db.notification.findMany({
      where: { read: false, title: "Integration test notification" },
    });
    expect(unread.length).toBe(1);

    // Cleanup this specific one
    await db.notification.delete({ where: { id: notif.id } });
  });
});

describe("insight persistence", () => {
  afterAll(async () => {
    await db.insight.deleteMany({
      where: { headline: { contains: "Integration test" } },
    });
  });

  it("creates and queries insights", async () => {
    const insight = await db.insight.create({
      data: {
        type: "custom",
        urgency: "low",
        headline: "Integration test insight",
        body: "Testing insight persistence",
        href: "/test",
        icon: "🧪",
      },
    });
    expect(insight.id).toBeTruthy();
    expect(insight.dismissed).toBe(false);

    const active = await db.insight.findMany({
      where: { dismissed: false },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
    expect(active.some((i) => i.id === insight.id)).toBe(true);

    // Dismiss it
    await db.insight.update({
      where: { id: insight.id },
      data: { dismissed: true },
    });

    const afterDismiss = await db.insight.findMany({
      where: { dismissed: false, id: insight.id },
    });
    expect(afterDismiss.length).toBe(0);
  });
});
