import { describe, it, expect } from "vitest";
import { calculateIOB, estimateIOBAfterDose, fractionUsed, CURVES } from "@/lib/iob";

const NOW = new Date("2026-06-17T12:00:00Z").getTime();

describe("fractionUsed", () => {
  it("returns 0 at time 0", () => {
    expect(fractionUsed(0, 4)).toBe(0);
  });

  it("returns 1 after full duration", () => {
    expect(fractionUsed(4, 4)).toBe(1);
    expect(fractionUsed(24, 24)).toBe(1);
  });

  it("returns between 0 and 1 during active period", () => {
    const f = fractionUsed(2, 4);
    expect(f).toBeGreaterThan(0);
    expect(f).toBeLessThan(1);
  });

  it("returns 0 for negative elapsed time", () => {
    expect(fractionUsed(-1, 4)).toBe(0);
  });

  it("quadratic: at 50% time, 25% used (more remaining early)", () => {
    const f = fractionUsed(2, 4); // 50% of time
    expect(f).toBe(0.25); // only 25% used — realistic concave curve
  });

  it("at 75% time, 56.25% used", () => {
    const f = fractionUsed(3, 4);
    expect(f).toBeCloseTo(0.5625, 2);
  });
});

describe("calculateIOB", () => {
  it("returns 0 with no doses", () => {
    expect(calculateIOB([], new Date(NOW))).toBe(0);
  });

  it("calculates IOB for a single recent rapid dose", () => {
    const doses = [
      { timestamp: new Date(NOW - 30 * 60000), type: "rapid", units: 10 }, // 30 min ago = 0.5h
    ];
    const iob = calculateIOB(doses, new Date(NOW));
    // Used: (0.5/4)^2 = 0.0156. Remaining: 10 * 0.9844 = 9.84
    expect(iob).toBeGreaterThan(9);
    expect(iob).toBeLessThan(10);
  });

  it("returns 0 for expired doses", () => {
    const doses = [
      { timestamp: new Date(NOW - 5 * 3600000), type: "rapid", units: 10 },
    ];
    const iob = calculateIOB(doses, new Date(NOW));
    expect(iob).toBe(0);
  });

  it("only counts rapid and correction types", () => {
    const doses = [
      { timestamp: new Date(NOW - 3600000), type: "rapid", units: 5 },     // 1h ago
      { timestamp: new Date(NOW - 3600000), type: "long", units: 20 },     // excluded
      { timestamp: new Date(NOW - 3600000), type: "correction", units: 2 }, // 1h ago
    ];
    const iob = calculateIOB(doses, new Date(NOW));
    // Used per dose: (1/4)^2 = 0.0625. Remaining: (5+2) * (1-0.0625) = 6.56
    expect(iob).toBeCloseTo(6.56, 1);
  });

  it("sums multiple active doses", () => {
    const doses = [
      { timestamp: new Date(NOW - 3600000), type: "rapid", units: 6 },     // 1h ago: used 6.25%
      { timestamp: new Date(NOW - 2 * 3600000), type: "rapid", units: 4 },  // 2h ago: used 25%
    ];
    const iob = calculateIOB(doses, new Date(NOW));
    // 6 * (1 - 0.0625) + 4 * (1 - 0.25) = 5.625 + 3.0 = 8.625
    expect(iob).toBeCloseTo(8.625, 1);
  });

  it("handles string dates", () => {
    const doses = [
      { timestamp: new Date(NOW - 3600000).toISOString(), type: "rapid", units: 5 },
    ];
    expect(() => calculateIOB(doses, new Date(NOW))).not.toThrow();
  });
});

describe("estimateIOBAfterDose", () => {
  it("returns array of IOB values for given hours, declining", () => {
    const dose = { timestamp: new Date(NOW), type: "rapid", units: 10 };
    const estimates = estimateIOBAfterDose(dose, [0, 1, 2, 3, 4]);
    expect(estimates).toHaveLength(5);
    expect(estimates[0]).toBe(10);       // 0h passed = 100% remaining
    expect(estimates[1]).toBeCloseTo(9.375, 1); // 1h: (1/4)^2=0.0625 used, 93.75% remaining
    expect(estimates[2]).toBeCloseTo(7.5, 1);   // 2h: 25% used, 75% remaining
    expect(estimates[3]).toBeCloseTo(4.375, 1); // 3h: 56.25% used, 43.75% remaining
    expect(estimates[4]).toBe(0);        // 4h = fully expired
  });
});

describe("CURVES", () => {
  it("has curves for all insulin types", () => {
    expect(CURVES.rapid).toBeDefined();
    expect(CURVES.long).toBeDefined();
    expect(CURVES.mixed).toBeDefined();
    expect(CURVES.correction).toBeDefined();
  });

  it("rapid insulin lasts 4 hours", () => {
    expect(CURVES.rapid.durationHours).toBe(4);
  });

  it("long insulin lasts 24 hours", () => {
    expect(CURVES.long.durationHours).toBe(24);
  });
});
