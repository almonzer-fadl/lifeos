export function calculateTRIMP(durationMin: number, heartRateAvg: number, restingHR: number, maxHR: number): number {
  if (durationMin <= 0 || heartRateAvg <= 0) return 0;
  const hrReserve = maxHR > restingHR ? (heartRateAvg - restingHR) / (maxHR - restingHR) : 0;
  if (hrReserve <= 0) return 0;
  const intensityFactor = 0.64 * Math.exp(1.92 * hrReserve);
  return Math.round(durationMin * hrReserve * intensityFactor * 10) / 10;
}

export function classifyLoad(trimp: number): "light" | "moderate" | "hard" | "very_hard" {
  if (trimp < 30) return "light";
  if (trimp < 70) return "moderate";
  if (trimp < 120) return "hard";
  return "very_hard";
}

const RESTING_HR_DEFAULT = 60;
const MAX_HR_DEFAULT = 200;

export function estimateTRIMP(durationMin: number, heartRateAvg?: number | null): number {
  return calculateTRIMP(
    durationMin,
    heartRateAvg ?? (RESTING_HR_DEFAULT + 30),
    RESTING_HR_DEFAULT,
    MAX_HR_DEFAULT
  );
}
