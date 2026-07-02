import { describe, it, expect } from "vitest";
import { formatRunway, formatMYR } from "@/lib/runway";

describe("formatRunway", () => {
  it("formats months under 12", () => {
    expect(formatRunway(2.3)).toBe("2.3m");
    expect(formatRunway(0.5)).toBe("0.5m");
    expect(formatRunway(11.9)).toBe("11.9m");
  });

  it("formats exactly 12 months as 1y", () => {
    expect(formatRunway(12)).toBe("1y");
  });

  it("formats 24 months as 2y", () => {
    expect(formatRunway(24)).toBe("2y");
  });

  it("formats 18 months as 1y 6m", () => {
    expect(formatRunway(18)).toBe("1y 6m");
  });

  it("formats 36 months as 3y", () => {
    expect(formatRunway(36)).toBe("3y");
  });

  it("returns infinity for Infinity", () => {
    expect(formatRunway(Infinity)).toBe("∞");
  });

  it("returns infinity for negative values", () => {
    expect(formatRunway(-1)).toBe("∞");
  });
});

describe("formatMYR", () => {
  it("formats positive amounts", () => {
    expect(formatMYR(150000)).toBe("RM 1,500.00");
    expect(formatMYR(208800)).toBe("RM 2,088.00");
    expect(formatMYR(0)).toBe("RM 0.00");
  });

  it("formats negative amounts", () => {
    expect(formatMYR(-95000)).toBe("-RM 950.00");
  });

  it("formats small amounts with decimals", () => {
    expect(formatMYR(9990)).toBe("RM 99.90");
  });

  it("formats large amounts with thousand separators", () => {
    expect(formatMYR(10000000)).toBe("RM 100,000.00");
  });
});
