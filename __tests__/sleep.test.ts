import { describe, it, expect } from "vitest";
import { calculateCompliance, calculateSleepDebt } from "@/lib/sleep-compliance";

describe("calculateCompliance", () => {
  it("returns 100 for perfect compliance", () => {
    const today = new Date();
    const screensOff = new Date(today); screensOff.setHours(21, 0, 0, 0);
    const inBed = new Date(today); inBed.setHours(21, 45, 0, 0);
    const wake = new Date(today); wake.setDate(wake.getDate() + 1); wake.setHours(5, 45, 0, 0);
    const result = calculateCompliance({
      screensOffAt: screensOff,
      inBedAt: inBed,
      wakeAt: wake,
      preSleepActivity: "reading",
      lateMeal: false,
      whiteNoiseOn: true,
    });
    expect(result).toBe(100);
  });

  it("reduces score for late screens off", () => {
    const result = calculateCompliance({
      screensOffAt: new Date("2026-06-17T21:30:00Z"), // 30 min late
      inBedAt: null, wakeAt: null, preSleepActivity: null, lateMeal: false, whiteNoiseOn: false,
    });
    expect(result).toBeLessThan(50);
  });

  it("penalizes screen activity", () => {
    const perfect = calculateCompliance({
      screensOffAt: new Date("2026-06-17T21:00:00Z"),
      inBedAt: new Date("2026-06-17T21:45:00Z"),
      wakeAt: new Date("2026-06-17T05:45:00Z"),
      preSleepActivity: "reading", lateMeal: false, whiteNoiseOn: true,
    });
    const screens = calculateCompliance({
      screensOffAt: new Date("2026-06-17T21:00:00Z"),
      inBedAt: new Date("2026-06-17T21:45:00Z"),
      wakeAt: new Date("2026-06-17T05:45:00Z"),
      preSleepActivity: "screens", lateMeal: false, whiteNoiseOn: true,
    });
    expect(screens).toBeLessThan(perfect);
  });

  it("penalizes late meal", () => {
    const perfect = calculateCompliance({
      screensOffAt: new Date("2026-06-17T21:00:00Z"),
      inBedAt: new Date("2026-06-17T21:45:00Z"),
      wakeAt: new Date("2026-06-17T05:45:00Z"),
      preSleepActivity: "reading", lateMeal: false, whiteNoiseOn: true,
    });
    const lateMeal = calculateCompliance({
      screensOffAt: new Date("2026-06-17T21:00:00Z"),
      inBedAt: new Date("2026-06-17T21:45:00Z"),
      wakeAt: new Date("2026-06-17T05:45:00Z"),
      preSleepActivity: "reading", lateMeal: true, whiteNoiseOn: true,
    });
    expect(lateMeal).toBeLessThan(perfect);
  });
});

describe("calculateSleepDebt", () => {
  it("returns 0 debt with perfect sleep", () => {
    const sessions = [
      { hours: 8 }, { hours: 8 }, { hours: 8 },
    ];
    const result = calculateSleepDebt(sessions, 8);
    expect(result.currentDebt).toBe(0);
  });

  it("accumulates debt", () => {
    const sessions = [
      { hours: 6 }, { hours: 7 }, { hours: 6.5 },
    ];
    const result = calculateSleepDebt(sessions, 8);
    // deficits: 2, 1, 1.5 = cumulative 4.5
    expect(result.currentDebt).toBe(4.5);
  });

  it("reduces debt on surplus", () => {
    const sessions = [
      { hours: 6 }, { hours: 9 },
    ];
    const result = calculateSleepDebt(sessions, 8);
    // deficit 2, surplus 1 → cumulative = max(0, 0+2-1) = 1
    expect(result.currentDebt).toBe(1);
  });

  it("detects worsening trend", () => {
    const sessions = Array(10).fill({ hours: 6 });
    const result = calculateSleepDebt(sessions, 8);
    expect(result.trend).toBe("worsening");
  });

  it("detects stable trend", () => {
    const sessions = Array(10).fill({ hours: 8 });
    const result = calculateSleepDebt(sessions, 8);
    expect(result.trend).toBe("stable");
  });
});
