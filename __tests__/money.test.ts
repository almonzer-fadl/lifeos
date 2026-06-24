import { describe, it, expect } from "vitest";
import { dollarsToCents, centsToDollars, formatCents, parseMoneyInput, parseOptionalMoneyInput } from "@/lib/money";

describe("money utilities", () => {
  describe("dollarsToCents", () => {
    it("converts whole dollars", () => {
      expect(dollarsToCents(10)).toBe(1000);
      expect(dollarsToCents(0)).toBe(0);
      expect(dollarsToCents(1)).toBe(100);
    });

    it("converts decimal dollars", () => {
      expect(dollarsToCents(10.99)).toBe(1099);
      expect(dollarsToCents(0.01)).toBe(1);
      expect(dollarsToCents(0.99)).toBe(99);
    });

    it("handles negative values", () => {
      expect(dollarsToCents(-5.50)).toBe(-550);
      expect(dollarsToCents(-0.01)).toBe(-1);
    });

    it("rounds correctly using Math.round", () => {
      expect(dollarsToCents(10.999)).toBe(1100);
      expect(dollarsToCents(10.994)).toBe(1099);
      expect(dollarsToCents(0.005)).toBe(1);
    });
  });

  describe("centsToDollars", () => {
    it("converts cents to dollars", () => {
      expect(centsToDollars(1000)).toBe(10);
      expect(centsToDollars(0)).toBe(0);
      expect(centsToDollars(1)).toBe(0.01);
      expect(centsToDollars(1099)).toBe(10.99);
    });

    it("handles negative values", () => {
      expect(centsToDollars(-550)).toBe(-5.5);
      expect(centsToDollars(-1)).toBe(-0.01);
    });
  });

  describe("formatCents", () => {
    it("formats with 2 decimal places", () => {
      expect(formatCents(1099)).toBe("10.99");
      expect(formatCents(1000)).toBe("10.00");
      expect(formatCents(0)).toBe("0.00");
      expect(formatCents(5)).toBe("0.05");
    });

    it("handles negative values", () => {
      expect(formatCents(-1099)).toBe("-10.99");
    });
  });

  describe("parseMoneyInput", () => {
    it("parses dollar string to cents", () => {
      expect(parseMoneyInput("10.99")).toBe(1099);
      expect(parseMoneyInput("10")).toBe(1000);
      expect(parseMoneyInput("0.01")).toBe(1);
    });

    it("returns 0 for negative input (coerces to safe value)", () => {
      expect(parseMoneyInput("-5.50")).toBe(0);
    });

    it("returns 0 for invalid input (does not throw)", () => {
      expect(parseMoneyInput("abc")).toBe(0);
      expect(parseMoneyInput("")).toBe(0);
    });
  });

  describe("parseOptionalMoneyInput", () => {
    it("returns null for empty or whitespace", () => {
      expect(parseOptionalMoneyInput("")).toBeNull();
      expect(parseOptionalMoneyInput("   ")).toBeNull();
    });

    it("parses valid input", () => {
      expect(parseOptionalMoneyInput("10.99")).toBe(1099);
    });

    it("returns null for NaN input", () => {
      expect(parseOptionalMoneyInput("abc")).toBeNull();
    });
  });

  describe("roundtrip", () => {
    it("dollars -> cents -> dollars preserves value", () => {
      const original = 1234.56;
      const cents = dollarsToCents(original);
      const back = centsToDollars(cents);
      expect(back).toBe(original);
    });
  });
});
