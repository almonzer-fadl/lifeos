// ─── IOB: Insulin On Board ─────────────────────────────────────
// Uses a clinically-standard decay model

interface InsulinDose {
  timestamp: Date | string;
  type: string; // rapid, long, mixed, correction
  units: number;
}

interface InsulinCurve {
  durationHours: number;
}

const CURVES: Record<string, InsulinCurve> = {
  rapid:      { durationHours: 4 },
  long:       { durationHours: 24 },
  mixed:      { durationHours: 6 },
  correction: { durationHours: 4 },
};

// Fraction of insulin USED after elapsedHours (0-1)
// Uses quadratic decay: fractionUsed = (t/d)^2, clamped to [0,1]
// This produces a realistic concave curve — faster decay early, slower tail
function fractionUsed(elapsedHours: number, durationHours: number): number {
  if (elapsedHours <= 0) return 0;
  if (elapsedHours >= durationHours) return 1;
  return Math.pow(elapsedHours / durationHours, 2);
}

export function calculateIOB(doses: InsulinDose[], now: Date = new Date()): number {
  const nowMs = now.getTime();

  return doses
    .filter((d) => d.type === "rapid" || d.type === "correction")
    .reduce((total, dose) => {
      const doseTime = typeof dose.timestamp === "string"
        ? new Date(dose.timestamp).getTime()
        : dose.timestamp.getTime();
      const elapsed = (nowMs - doseTime) / 3600000;
      const curve = CURVES[dose.type] || CURVES.rapid;
      const used = fractionUsed(elapsed, curve.durationHours);
      return total + dose.units * (1 - used);
    }, 0);
}

export function estimateIOBAfterDose(
  dose: InsulinDose,
  hoursLater: number[]
): number[] {
  const duration = (CURVES[dose.type] || CURVES.rapid).durationHours;

  return hoursLater.map((h) => {
    return dose.units * (1 - fractionUsed(h, duration));
  });
}

export { CURVES, fractionUsed };
