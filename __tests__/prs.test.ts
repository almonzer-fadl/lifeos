import { describe, it, expect } from "vitest";
import { detectPR, formatPR } from "@/lib/prs";

describe("detectPR", () => {
  const runActivity = {
    type: "run",
    distance: 5000,
    startTime: new Date("2026-06-17T10:00:00Z"),
    endTime: new Date("2026-06-17T10:24:54Z"),
  };

  it("detects a new PR when no record exists", () => {
    const result = detectPR(runActivity, null);
    expect(result?.isPR).toBe(true);
    expect(result?.metric).toBe("time");
    expect(result?.newValue).toBe(1494); // 24:54
  });

  it("detects improved time PR", () => {
    const result = detectPR(runActivity, { value: 1600 }); // old: 26:40
    expect(result?.isPR).toBe(true);
    expect(result?.metric).toBe("time");
    expect(result?.newValue).toBe(1494);
  });

  it("does not flag when performance is worse", () => {
    const result = detectPR(runActivity, { value: 1400 }); // old: 23:20
    expect(result).toBeNull();
  });

  it("returns null when no endTime", () => {
    const result = detectPR({ ...runActivity, endTime: null }, null);
    expect(result).toBeNull();
  });

  it("detects distance PR for non-timed activity", () => {
    const activity = {
      type: "other",
      distance: 12000,
      startTime: new Date("2026-06-17T10:00:00Z"),
      endTime: new Date("2026-06-17T10:00:01Z"), // has endTime but "other" is not in timed list
    };
    const result = detectPR(activity, { value: 8000 });
    expect(result?.isPR).toBe(true);
    expect(result?.metric).toBe("distance");
  });
});

describe("formatPR", () => {
  it("formats time under 1 minute", () => {
    expect(formatPR(45, "time", "seconds")).toBe("45s");
  });

  it("formats time under 1 hour", () => {
    expect(formatPR(1494, "time", "seconds")).toBe("24:54");
  });

  it("formats time over 1 hour", () => {
    expect(formatPR(5346, "time", "seconds")).toBe("1:29:06");
  });

  it("formats distance in km", () => {
    expect(formatPR(5000, "distance", "meters")).toBe("5.00 km");
  });

  it("formats short distance in meters", () => {
    expect(formatPR(800, "distance", "meters")).toBe("800m");
  });

  it("formats reps", () => {
    expect(formatPR(12, "reps", "reps")).toBe("12 reps");
  });

  it("formats weight", () => {
    expect(formatPR(100, "weight", "kg")).toBe("100 kg");
  });
});
