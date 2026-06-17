import { describe, it, expect } from "vitest";
import { calculateBolus, carbBolus, correctionBolus } from "@/lib/bolus";

describe("calculateBolus", () => {
  it("calculates bolus for carbs only (in-range glucose)", () => {
    const result = calculateBolus({
      carbs: 60,
      currentGlucose: 120,
      targetGlucose: 110,
      icr: 10,
      cf: 50,
      iob: 0,
    });
    expect(result.carbDose).toBe(6);
    expect(result.correctionDose).toBe(0.2);
    expect(result.totalDose).toBe(6.2);
    expect(result.roundedDose).toBe(6);
  });

  it("adds correction when above target", () => {
    const result = calculateBolus({
      carbs: 60,
      currentGlucose: 210,
      targetGlucose: 110,
      icr: 10,
      cf: 50,
      iob: 0,
    });
    expect(result.carbDose).toBe(6);
    expect(result.correctionDose).toBe(2);
    expect(result.totalDose).toBe(8);
    expect(result.roundedDose).toBe(8);
  });

  it("subtracts IOB from correction", () => {
    const result = calculateBolus({
      carbs: 60,
      currentGlucose: 210,
      targetGlucose: 110,
      icr: 10,
      cf: 50,
      iob: 1.5, // 1.5 units still active
    });
    expect(result.carbDose).toBe(6);
    expect(result.correctionDose).toBe(0.5); // 2 - 1.5
    expect(result.roundedDose).toBe(6.5);
  });

  it("never gives negative correction", () => {
    const result = calculateBolus({
      carbs: 60,
      currentGlucose: 100,
      targetGlucose: 110,
      icr: 10,
      cf: 50,
      iob: 2,
    });
    expect(result.correctionDose).toBe(0);
    expect(result.roundedDose).toBe(6); // just carbs, no correction
  });

  it("applies exercise reduction", () => {
    const resultNoExercise = calculateBolus({
      carbs: 60, currentGlucose: 210, targetGlucose: 110, icr: 10, cf: 50, iob: 0,
    });

    const resultWithExercise = calculateBolus({
      carbs: 60, currentGlucose: 210, targetGlucose: 110, icr: 10, cf: 50, iob: 0,
      exerciseReduction: 0.25,
    });

    expect(resultWithExercise.totalDose).toBeLessThan(resultNoExercise.totalDose);
    expect(resultWithExercise.roundedDose).toBe(6); // 8 * 0.75 = 6
    expect(resultWithExercise.formula).toContain("25% exercise reduction");
  });

  it("rounds to nearest 0.5 units", () => {
    const result = calculateBolus({
      carbs: 45, currentGlucose: 150, targetGlucose: 110, icr: 8, cf: 40, iob: 0,
    });
    // 45/8 = 5.625 + (150-110)/40 = 1.0 = 6.625 → round to 6.5
    expect(result.roundedDose).toBe(6.5);
  });

  it("includes formula breakdown", () => {
    const result = calculateBolus({
      carbs: 60, currentGlucose: 210, targetGlucose: 110, icr: 10, cf: 50, iob: 0,
    });
    expect(result.formula).toContain("60g ÷ 10");
    expect(result.formula).toContain("(210 - 110) ÷ 50");
    expect(result.formula).toContain("= 8u");
  });
});

describe("carbBolus", () => {
  it("calculates carbs-only bolus", () => {
    expect(carbBolus(60, 10)).toBe(6);
    expect(carbBolus(45, 8)).toBe(5.5);
    expect(carbBolus(30, 15)).toBe(2);
  });
});

describe("correctionBolus", () => {
  it("calculates correction without IOB", () => {
    expect(correctionBolus(210, 110, 50)).toBe(2);
  });

  it("subtracts IOB", () => {
    expect(correctionBolus(210, 110, 50, 1.5)).toBe(0.5);
  });

  it("returns 0 when IOB exceeds correction needed", () => {
    expect(correctionBolus(150, 110, 50, 2)).toBe(0);
  });
});
