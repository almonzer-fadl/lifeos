import { describe, it, expect } from "vitest";
import { estimateA1c, estimateAvgGlucose, mmolToMgdl, mgdlToMmol, timeInRange } from "@/lib/h1bc";

describe("glucose math", () => {
  describe("mmolToMgdl / mgdlToMmol", () => {
    it("converts mmol to mg/dL", () => {
      expect(mmolToMgdl(5.5)).toBeCloseTo(99.1, 0);
      expect(mmolToMgdl(7.0)).toBeCloseTo(126.1, 0);
      expect(mmolToMgdl(10.0)).toBeCloseTo(180.2, 0);
    });

    it("converts mg/dL to mmol", () => {
      expect(mgdlToMmol(100)).toBeCloseTo(5.55, 1);
      expect(mgdlToMmol(180)).toBeCloseTo(9.99, 1);
      expect(mgdlToMmol(70)).toBeCloseTo(3.88, 1);
    });

    it("is reversible", () => {
      const original = 5.5;
      expect(mgdlToMmol(mmolToMgdl(original))).toBeCloseTo(original, 5);
    });
  });

  describe("estimateA1c", () => {
    it("calculates A1c from average glucose (ADAG formula)", () => {
      // 120 mg/dL avg → ~5.5% A1c
      expect(estimateA1c(120)).toBeCloseTo(5.54, 1);
      // 150 mg/dL avg → ~6.4% A1c
      expect(estimateA1c(150)).toBeCloseTo(6.38, 1);
      // 180 mg/dL avg → ~7.2% A1c
      expect(estimateA1c(180)).toBeCloseTo(7.23, 1);
    });

    it("handles edge cases", () => {
      expect(estimateA1c(0)).toBeCloseTo(2.17, 1);
      expect(estimateA1c(300)).toBeCloseTo(10.60, 1);
    });
  });

  describe("estimateAvgGlucose", () => {
    it("is the inverse of estimateA1c", () => {
      expect(estimateAvgGlucose(5.5)).toBeCloseTo(118.5, 0);
      expect(estimateAvgGlucose(7.0)).toBeCloseTo(171.9, 0);
    });
  });

  describe("timeInRange", () => {
    it("calculates TIR correctly", () => {
      const readings = [65, 80, 120, 150, 190];
      const result = timeInRange(readings, 70, 180);
      expect(result.low).toBeCloseTo(20, 0);
      expect(result.inRange).toBeCloseTo(60, 0);
      expect(result.high).toBeCloseTo(20, 0);
      expect(result.total).toBe(5);
    });

    it("handles empty array gracefully", () => {
      const result = timeInRange([]);
      expect(result.inRange).toBe(0);
      expect(result.total).toBe(0);
    });

    it("all correct readings yield 100% in range", () => {
      const readings = [80, 100, 120, 140, 160];
      const result = timeInRange(readings);
      expect(result.inRange).toBe(100);
      expect(result.low).toBe(0);
      expect(result.high).toBe(0);
    });
  });
});
