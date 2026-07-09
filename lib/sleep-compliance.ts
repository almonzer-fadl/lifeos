export function calculateCompliance(routine: {
  screensOffAt: Date | null;
  inBedAt: Date | null;
  wakeAt: Date | null;
  preSleepActivity: string | null;
  lateMeal: boolean;
  whiteNoiseOn: boolean;
}): number {
  let score = 0; let total = 0;

  total += 2;
  if (routine.screensOffAt) {
    const d = new Date(routine.screensOffAt);
    const target = new Date(d); target.setHours(21, 0, 0, 0);
    const diff = (routine.screensOffAt.getTime() - target.getTime()) / 3600000;
    if (diff <= 0) score += 2; else if (diff <= 0.5) score += 1;
  }
  total += 3;
  if (routine.inBedAt) {
    const d = new Date(routine.inBedAt);
    const target = new Date(d); target.setHours(21, 45, 0, 0);
    const diff = (routine.inBedAt.getTime() - target.getTime()) / 3600000;
    if (diff <= 0) score += 3; else if (diff <= 0.25) score += 1.5;
  }
  total += 2;
  if (routine.wakeAt) {
    const d = new Date(routine.wakeAt);
    const target = new Date(d); target.setHours(5, 45, 0, 0);
    const diff = Math.abs(routine.wakeAt.getTime() - target.getTime()) / 3600000;
    if (diff <= 0.25) score += 2; else if (diff <= 0.5) score += 1;
  }
  total += 1;
  if (routine.preSleepActivity && routine.preSleepActivity !== "screens") score += 1;
  total += 1;
  if (!routine.lateMeal) score += 1;
  total += 1;
  if (routine.whiteNoiseOn) score += 1;

  return Math.round((score / total) * 100);
}

export function calculateSleepDebt(
  sessions: { hours: number }[],
  targetHours: number = 8
): { currentDebt: number; trend: "improving" | "worsening" | "stable" } {
  let cumulative = 0;
  const recent: number[] = [];
  for (const s of sessions) {
    const deficit = targetHours - s.hours;
    cumulative = Math.max(0, cumulative + deficit);
    recent.push(deficit);
  }
  const last7 = recent.slice(-7);
  const trendSum = last7.reduce((a, b) => a + b, 0);
  const trend = trendSum > 0.5 ? "worsening" : trendSum < -0.5 ? "improving" : "stable";
  return { currentDebt: Math.round(cumulative * 10) / 10, trend };
}
