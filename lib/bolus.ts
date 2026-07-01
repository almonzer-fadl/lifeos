// ─── Bolus Calculator ──────────────────────────────────────────

export interface BolusInput {
  carbs: number;          // grams
  currentGlucose: number; // mg/dL
  targetGlucose: number;  // mg/dL
  icr: number;            // insulin-to-carb ratio: grams of carbs per 1 unit
  cf: number;             // correction factor: mg/dL drop per 1 unit
  iob: number;            // current insulin on board (units)
  exerciseReduction?: number; // 0-1: fraction to reduce (0.25 = 25% reduction for pre-workout)
}

export interface BolusOutput {
  carbDose: number;
  correctionDose: number;
  totalDose: number;
  roundedDose: number;
  formula: string;
}

export function calculateBolus(input: BolusInput): BolusOutput {
  // Carb coverage
  const carbDose = input.carbs / input.icr;

  // Correction: how far above target, minus IOB
  const rawCorrection = (input.currentGlucose - input.targetGlucose) / input.cf;
  const correctionDose = Math.max(0, rawCorrection - input.iob);

  let totalDose = carbDose + correctionDose;

  // Apply exercise reduction
  if (input.exerciseReduction && input.exerciseReduction > 0) {
    totalDose = totalDose * (1 - input.exerciseReduction);
  }

  const roundedDose = Math.round(totalDose * 2) / 2; // nearest 0.5 units

  const exerciseNote = input.exerciseReduction
    ? ` (${(input.exerciseReduction * 100).toFixed(0)}% exercise reduction)`
    : "";

  return {
    carbDose: Math.round(carbDose * 100) / 100,
    correctionDose: Math.round(correctionDose * 100) / 100,
    totalDose: Math.round(totalDose * 100) / 100,
    roundedDose,
    formula: `${input.carbs}g ÷ ${input.icr} = ${carbDose.toFixed(1)}u (carbs) + (${input.currentGlucose} - ${input.targetGlucose}) ÷ ${input.cf} = ${correctionDose.toFixed(1)}u (correction) - ${input.iob.toFixed(1)}u (IOB)${exerciseNote} = ${roundedDose}u`,
  };
}

// Quick lookup: bolus for just carbs (no correction, no IOB)
export function carbBolus(carbs: number, icr: number): number {
  return Math.round((carbs / icr) * 2) / 2;
}

// Quick lookup: correction dose
export function correctionBolus(
  currentGlucose: number,
  targetGlucose: number,
  cf: number,
  iob: number = 0
): number {
  const raw = (currentGlucose - targetGlucose) / cf;
  return Math.max(0, raw - iob);
}
