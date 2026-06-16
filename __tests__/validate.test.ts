import { describe, it, expect } from "vitest";
import { validate, schemas } from "@/lib/validate";

describe("validation schemas", () => {
  describe("account", () => {
    it("validates a valid account", () => {
      const result = validate(schemas.account, {
        name: "Main Checking",
        type: "checking",
        currency: "USD",
        initialBalance: 0,
      });
      expect(result.success).toBe(true);
    });

    it("rejects missing name", () => {
      const result = validate(schemas.account, {
        type: "checking",
        currency: "USD",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.some((e) => e.field === "name")).toBe(true);
      }
    });

    it("rejects invalid type", () => {
      const result = validate(schemas.account, {
        name: "Test",
        type: "invalid_type",
        currency: "USD",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid currency length", () => {
      const result = validate(schemas.account, {
        name: "Test",
        type: "checking",
        currency: "US",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.some((e) => e.field === "currency")).toBe(true);
      }
    });
  });

  describe("transaction", () => {
    it("validates a valid expense transaction", () => {
      const result = validate(schemas.transaction, {
        accountId: "550e8400-e29b-41d4-a716-446655440000",
        type: "expense",
        amount: 5000,
        currency: "USD",
        date: "2026-06-17T00:00:00.000Z",
      });
      expect(result.success).toBe(true);
    });

    it("validates a valid income transaction", () => {
      const result = validate(schemas.transaction, {
        accountId: "550e8400-e29b-41d4-a716-446655440000",
        type: "income",
        amount: 150000,
        currency: "USD",
      });
      expect(result.success).toBe(true);
    });

    it("rejects negative amount", () => {
      const result = validate(schemas.transaction, {
        accountId: "550e8400-e29b-41d4-a716-446655440000",
        type: "expense",
        amount: -50,
        currency: "USD",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid uuid for accountId", () => {
      const result = validate(schemas.transaction, {
        accountId: "not-a-uuid",
        type: "expense",
        amount: 5000,
        currency: "USD",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("glucose", () => {
    it("validates normal glucose reading", () => {
      const result = validate(schemas.glucose, {
        value: 120,
        unit: "mg/dL",
      });
      expect(result.success).toBe(true);
    });

    it("rejects out of range values", () => {
      expect(validate(schemas.glucose, { value: 10 }).success).toBe(false);
      expect(validate(schemas.glucose, { value: 700 }).success).toBe(false);
    });

    it("defaults unit to mg/dL", () => {
      const result = validate(schemas.glucose, { value: 120 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.unit).toBe("mg/dL");
      }
    });
  });

  describe("bodyMeasurement", () => {
    it("allows all optional fields", () => {
      const result = validate(schemas.bodyMeasurement, {});
      expect(result.success).toBe(true);
    });

    it("validates with partial fields", () => {
      const result = validate(schemas.bodyMeasurement, {
        weight: 75.5,
        bodyFatPct: 18,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("task", () => {
    it("validates a task with defaults", () => {
      const result = validate(schemas.task, { title: "Buy groceries" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.priority).toBe("medium");
        expect(result.data.status).toBe("todo");
      }
    });

    it("rejects empty title", () => {
      const result = validate(schemas.task, { title: "" });
      expect(result.success).toBe(false);
    });

    it("rejects invalid priority", () => {
      const result = validate(schemas.task, { title: "Test", priority: "critical" });
      expect(result.success).toBe(false);
    });
  });
});
