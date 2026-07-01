// ─── Time-in-Range Statistics ──────────────────────────────────

interface GlucoseReading {
  value: number;
}

interface TargetRange {
  low: number;
  high: number;
}

export interface TIRResult {
  totalReadings: number;
  belowRange: number;
  belowRangePct: number;
  veryLow: number;
  veryLowPct: number;
  inRange: number;
  inRangePct: number;
  aboveRange: number;
  aboveRangePct: number;
  veryHigh: number;
  veryHighPct: number;
  avgGlucose: number;
  stdDev: number;
  cv: number;
  estimatedHbA1c: number;
}

const VERY_LOW_THRESHOLD = 54;
const VERY_HIGH_THRESHOLD = 250;

// ADAG formula: estimated HbA1c = (avgGlucose + 46.7) / 28.7
function adagHbA1c(avgGlucose: number): number {
  return (avgGlucose + 46.7) / 28.7;
}

function standardDeviation(values: number[], mean: number): number {
  if (values.length < 2) return 0;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (values.length - 1);
  return Math.sqrt(variance);
}

export function calculateTIR(
  readings: GlucoseReading[],
  target: TargetRange
): TIRResult {
  if (readings.length === 0) {
    return {
      totalReadings: 0,
      belowRange: 0, belowRangePct: 0, veryLow: 0, veryLowPct: 0,
      inRange: 0, inRangePct: 0,
      aboveRange: 0, aboveRangePct: 0, veryHigh: 0, veryHighPct: 0,
      avgGlucose: 0, stdDev: 0, cv: 0, estimatedHbA1c: 0,
    };
  }

  const values = readings.map((r) => r.value);
  const avgGlucose = values.reduce((s, v) => s + v, 0) / values.length;
  const stdDev = standardDeviation(values, avgGlucose);
  const cv = avgGlucose > 0 ? (stdDev / avgGlucose) * 100 : 0;

  let belowRange = 0, veryLow = 0, inRange = 0, aboveRange = 0, veryHigh = 0;

  for (const r of readings) {
    if (r.value < VERY_LOW_THRESHOLD) {
      veryLow++;
      belowRange++;
    } else if (r.value < target.low) {
      belowRange++;
    } else if (r.value <= target.high) {
      inRange++;
    } else if (r.value > VERY_HIGH_THRESHOLD) {
      veryHigh++;
      aboveRange++;
    } else {
      aboveRange++;
    }
  }

  const total = readings.length;

  return {
    totalReadings: total,
    belowRange,
    belowRangePct: Math.round((belowRange / total) * 1000) / 10,
    veryLow,
    veryLowPct: Math.round((veryLow / total) * 1000) / 10,
    inRange,
    inRangePct: Math.round((inRange / total) * 1000) / 10,
    aboveRange,
    aboveRangePct: Math.round((aboveRange / total) * 1000) / 10,
    veryHigh,
    veryHighPct: Math.round((veryHigh / total) * 1000) / 10,
    avgGlucose: Math.round(avgGlucose * 10) / 10,
    stdDev: Math.round(stdDev * 10) / 10,
    cv: Math.round(cv * 10) / 10,
    estimatedHbA1c: Math.round(adagHbA1c(avgGlucose) * 10) / 10,
  };
}
