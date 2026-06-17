export function calculateNetCarbs(carbs: number | null, fiber: number | null): number | null {
  if (carbs == null) return null;
  return Math.max(0, carbs - (fiber || 0));
}

export function calculateMealCarbs(
  foodCarbs: number | null,
  foodFiber: number | null,
  servings: number
): { totalCarbs: number | null; netCarbs: number | null } {
  if (foodCarbs == null) return { totalCarbs: null, netCarbs: null };
  const totalCarbs = foodCarbs * servings;
  const fiber = (foodFiber || 0) * servings;
  return {
    totalCarbs: Math.round(totalCarbs * 10) / 10,
    netCarbs: Math.round(Math.max(0, totalCarbs - fiber) * 10) / 10,
  };
}
