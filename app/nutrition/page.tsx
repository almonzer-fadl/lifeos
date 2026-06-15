import { db } from "@/lib/db";
import { NutritionForm } from "@/components/modules/nutrition/nutrition-form";
import { startOfDay, endOfDay } from "date-fns";

export const dynamic = "force-dynamic";

export default async function NutritionPage() {
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);

  const [todayEntries, waterToday, nutritionGoal] = await Promise.all([
    db.foodDiaryEntry.findMany({
      where: { date: { gte: todayStart, lt: todayEnd } },
      include: { food: true },
      orderBy: { createdAt: "desc" },
    }),
    db.waterLog.findMany({
      where: { date: { gte: todayStart, lt: todayEnd } },
    }),
    db.nutritionGoal.findFirst(),
  ]);

  const waterTotal = waterToday.reduce((sum, w) => sum + w.amountMl, 0);

  // Calculate today's macros
  const macros = todayEntries.reduce(
    (acc, entry) => {
      if (!entry.food) return acc;
      const factor = entry.grams
        ? entry.grams / (entry.food.servingSize || 100)
        : entry.servings;
      return {
        calories: acc.calories + (entry.food.calories || 0) * factor,
        protein: acc.protein + (entry.food.protein || 0) * factor,
        carbs: acc.carbs + (entry.food.carbs || 0) * factor,
        fat: acc.fat + (entry.food.fat || 0) * factor,
        fiber: acc.fiber + (entry.food.fiber || 0) * factor,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nutrition</h1>
        <p className="text-zinc-500 text-sm mt-1">Food diary, macros, and water tracking</p>
      </div>

      {/* Macro stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MacroCard
          label="Calories"
          value={`${macros.calories.toFixed(0)}`}
          goal={nutritionGoal?.calories ? `${nutritionGoal.calories}` : "--"}
          unit="kcal"
          color="text-orange-400"
        />
        <MacroCard label="Protein" value={`${macros.protein.toFixed(0)}g`} goal={nutritionGoal?.protein ? `${nutritionGoal.protein}g` : "--"} unit="" color="text-red-400" />
        <MacroCard label="Carbs" value={`${macros.carbs.toFixed(0)}g`} goal={nutritionGoal?.carbs ? `${nutritionGoal.carbs}g` : "--"} unit="" color="text-yellow-400" />
        <MacroCard label="Fat" value={`${macros.fat.toFixed(0)}g`} goal={nutritionGoal?.fat ? `${nutritionGoal.fat}g` : "--"} unit="" color="text-blue-400" />
        <MacroCard label="Fiber" value={`${macros.fiber.toFixed(0)}g`} goal={nutritionGoal?.fiber ? `${nutritionGoal.fiber}g` : "--"} unit="" color="text-green-400" />
        <MacroCard
          label="Water"
          value={`${waterTotal}`}
          goal={nutritionGoal?.waterMl ? `${nutritionGoal.waterMl}` : "--"}
          unit="ml"
          color="text-cyan-400"
        />
      </div>

      {/* Log food */}
      <section className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Log Food</h2>
        <NutritionForm />
      </section>

      {/* Today's diary */}
      <section className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          Today&apos;s Diary
        </h2>
        {todayEntries.length === 0 ? (
          <div className="text-zinc-600 text-sm py-4 text-center">
            Nothing logged today. Add your first meal.
          </div>
        ) : (
          <div className="space-y-3">
            {["breakfast", "lunch", "dinner", "snack"].map((mealType) => {
              const meals = todayEntries.filter((e) => e.mealType === mealType);
              if (meals.length === 0) return null;
              return (
                <div key={mealType}>
                  <div className="text-xs font-semibold text-zinc-500 uppercase mb-1 capitalize">
                    {mealType}
                  </div>
                  <div className="space-y-1">
                    {meals.map((entry) => {
                      const food = entry.food;
                      if (!food) return null;
                      const factor = entry.grams
                        ? entry.grams / (food.servingSize || 100)
                        : entry.servings;
                      return (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/30 text-sm"
                        >
                          <div>
                            <span className="text-zinc-200">
                              {food.name}
                              {food.brand && (
                                <span className="text-zinc-600 text-xs ml-1">
                                  · {food.brand}
                                </span>
                              )}
                            </span>
                            <span className="text-zinc-500 text-xs ml-2">
                              {entry.servings > 1 && `${entry.servings}x `}
                              {food.servingSize
                                ? `${(food.servingSize * (entry.grams ? entry.grams / food.servingSize : entry.servings)).toFixed(0)}g`
                                : ""}
                            </span>
                          </div>
                          <div className="text-zinc-400 text-xs">
                            {food.calories
                              ? `${(food.calories * factor).toFixed(0)} kcal`
                              : ""}
                            {food.protein
                              ? ` · P${(food.protein * factor).toFixed(0)}`
                              : ""}
                            {food.carbs
                              ? ` C${(food.carbs * factor).toFixed(0)}`
                              : ""}
                            {food.fat
                              ? ` F${(food.fat * factor).toFixed(0)}`
                              : ""}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function MacroCard({
  label,
  value,
  goal,
  unit,
  color,
}: {
  label: string;
  value: string;
  goal: string;
  unit: string;
  color: string;
}) {
  return (
    <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className={`text-xl font-bold mt-1 ${color}`}>{value}</div>
      <div className="text-xs text-zinc-600">
        {goal !== "--" ? `Goal: ${goal} ${unit}` : unit}
      </div>
    </div>
  );
}
