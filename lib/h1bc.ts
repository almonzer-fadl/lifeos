/**
 * h1bc (A1c) estimation from average glucose readings.
 *
 * Uses the ADAG (A1c-Derived Average Glucose) formula:
 *   Estimated A1c (%) = (avg_glucose_mgdl + 77.3) / 35.6
 *
 * Alternative DCCT formula:
 *   Estimated A1c (%) = (avg_glucose_mgdl + 46.7) / 28.7
 *
 * Ref: Nathan et al., Diabetes Care, 2008
 */

export function estimateA1c(avgGlucoseMgdl: number): number {
  return (avgGlucoseMgdl + 77.3) / 35.6;
}

export function estimateAvgGlucose(a1c: number): number {
  return a1c * 35.6 - 77.3;
}

export function mmolToMgdl(mmol: number): number {
  return mmol * 18.018;
}

export function mgdlToMmol(mgdl: number): number {
  return mgdl / 18.018;
}

export function timeInRange(
  readings: number[],
  low: number = 70,
  high: number = 180,
): { low: number; inRange: number; high: number; total: number } {
  let lowCount = 0;
  let inRangeCount = 0;
  let highCount = 0;

  for (const r of readings) {
    if (r < low) lowCount++;
    else if (r > high) highCount++;
    else inRangeCount++;
  }

  const total = readings.length || 1;
  return {
    low: (lowCount / total) * 100,
    inRange: (inRangeCount / total) * 100,
    high: (highCount / total) * 100,
    total: readings.length,
  };
}
