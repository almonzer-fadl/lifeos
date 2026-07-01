import { describe, it, expect } from "vitest";
import { calculateTIR } from "@/lib/tir";

const target = { low: 70, high: 180 };

describe("calculateTIR", () => {
  it("handles empty readings", () => {
    const result = calculateTIR([], target);
    expect(result.totalReadings).toBe(0);
    expect(result.inRangePct).toBe(0);
  });

  it("calculates 100% in range", () => {
    const readings = [
      { value: 100 }, { value: 120 }, { value: 150 }, { value: 110 },
    ];
    const result = calculateTIR(readings, target);
    expect(result.inRangePct).toBe(100);
    expect(result.belowRangePct).toBe(0);
    expect(result.aboveRangePct).toBe(0);
  });

  it("detects below range", () => {
    const readings = [
      { value: 65 }, { value: 120 }, { value: 68 }, { value: 150 },
    ];
    const result = calculateTIR(readings, target);
    expect(result.belowRangePct).toBe(50);
    expect(result.veryLow).toBe(0); // 65 > 54
    expect(result.inRangePct).toBe(50);
  });

  it("detects very low (<54)", () => {
    const readings = [
      { value: 50 }, { value: 120 }, { value: 53 }, { value: 150 },
    ];
    const result = calculateTIR(readings, target);
    expect(result.veryLow).toBe(2);
    expect(result.veryLowPct).toBe(50);
    expect(result.belowRange).toBe(2);
  });

  it("detects above range", () => {
    const readings = [
      { value: 200 }, { value: 220 }, { value: 120 }, { value: 150 },
    ];
    const result = calculateTIR(readings, target);
    expect(result.aboveRangePct).toBe(50);
    expect(result.veryHigh).toBe(0); // all < 250
    expect(result.inRangePct).toBe(50);
  });

  it("detects very high (>250)", () => {
    const readings = [
      { value: 260 }, { value: 300 }, { value: 120 }, { value: 150 },
    ];
    const result = calculateTIR(readings, target);
    expect(result.veryHigh).toBe(2);
    expect(result.veryHighPct).toBe(50);
    expect(result.aboveRange).toBe(2);
  });

  it("calculates average glucose", () => {
    const readings = [
      { value: 100 }, { value: 200 },
    ];
    const result = calculateTIR(readings, target);
    expect(result.avgGlucose).toBe(150);
  });

  it("calculates standard deviation", () => {
    const readings = [
      { value: 100 }, { value: 100 }, { value: 100 },
    ];
    const result = calculateTIR(readings, target);
    expect(result.stdDev).toBe(0);
  });

  it("calculates CV", () => {
    const readings = [
      { value: 100 }, { value: 200 }, { value: 100 }, { value: 200 },
    ];
    const result = calculateTIR(readings, target);
    expect(result.cv).toBeGreaterThan(0);
  });

  it("estimates HbA1c using ADAG formula", () => {
    const readings = Array(100).fill({ value: 120 });
    const result = calculateTIR(readings, target);
    // ADAG: (120 + 46.7) / 28.7 ≈ 5.8
    expect(result.estimatedHbA1c).toBeCloseTo(5.8, 1);
  });

  it("estimates HbA1c for higher glucose", () => {
    const readings = Array(100).fill({ value: 180 });
    const result = calculateTIR(readings, target);
    // ADAG: (180 + 46.7) / 28.7 ≈ 7.9
    expect(result.estimatedHbA1c).toBeCloseTo(7.9, 1);
  });

  it("mixes all categories correctly", () => {
    const readings = [
      { value: 50 },  // very low
      { value: 65 },  // below
      { value: 100 }, // in range
      { value: 150 }, // in range
      { value: 200 }, // above
      { value: 260 }, // very high
    ];
    const result = calculateTIR(readings, target);
    expect(result.veryLow).toBe(1);
    expect(result.belowRange).toBe(2); // includes very low
    expect(result.inRange).toBe(2);
    expect(result.aboveRange).toBe(2); // includes very high
    expect(result.veryHigh).toBe(1);
    expect(result.inRangePct).toBeCloseTo(33.3, 0);
  });
});
