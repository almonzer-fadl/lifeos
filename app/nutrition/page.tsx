import { db } from "@/lib/db";
import { NutritionForm } from "@/components/modules/nutrition/nutrition-form";
import { WaterForm } from "@/components/modules/nutrition/water-form";
import { startOfDay, endOfDay } from "date-fns";

export const dynamic = "force-dynamic";

export default async function NutritionPage() {
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);

  const [todayEntries, waterToday, nutritionGoal] = await Promise.all([
    db.foodDiaryEntry.findMany({ where: { date: { gte: todayStart, lt: todayEnd } }, include: { food: true }, orderBy: { createdAt: "desc" } }),
    db.waterLog.findMany({ where: { date: { gte: todayStart, lt: todayEnd } } }),
    db.nutritionGoal.findFirst(),
  ]);

  const water = waterToday.reduce((s, w) => s + w.amountMl, 0);
  const macros = todayEntries.reduce((acc, e) => {
    if (!e.food) return acc;
    const f = e.grams ? e.grams / (e.food.servingSize || 100) : e.servings;
    return {
      cal: acc.cal + (e.food.calories || 0) * f,
      prot: acc.prot + (e.food.protein || 0) * f,
      carb: acc.carb + (e.food.carbs || 0) * f,
      fat: acc.fat + (e.food.fat || 0) * f,
      fib: acc.fib + (e.food.fiber || 0) * f,
    };
  }, { cal: 0, prot: 0, carb: 0, fat: 0, fib: 0 });

  return (
    <div className="p-5 lg:p-8 space-y-5">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">Nutrition</h1>
        <p className="text-sm text-stone-500 mt-0.5">Food diary, macros, and water</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 animate-stagger">
        <MCard l="Calories" v={`${macros.cal.toFixed(0)}`} g={nutritionGoal?.calories ? `${nutritionGoal.calories}` : "--"} u="kcal" c="text-orange-600" />
        <MCard l="Protein" v={`${macros.prot.toFixed(0)}g`} g={nutritionGoal?.protein ? `${nutritionGoal.protein}g` : "--"} u="" c="text-rose-600" />
        <MCard l="Carbs" v={`${macros.carb.toFixed(0)}g`} g={nutritionGoal?.carbs ? `${nutritionGoal.carbs}g` : "--"} u="" c="text-amber-600" />
        <MCard l="Fat" v={`${macros.fat.toFixed(0)}g`} g={nutritionGoal?.fat ? `${nutritionGoal.fat}g` : "--"} u="" c="text-sky-600" />
        <MCard l="Fiber" v={`${macros.fib.toFixed(0)}g`} g={nutritionGoal?.fiber ? `${nutritionGoal.fiber}g` : "--"} u="" c="text-emerald-600" />
        <MCard l="Water" v={`${water}`} g={nutritionGoal?.waterMl ? `${nutritionGoal.waterMl}` : "--"} u="ml" c="text-cyan-600" />
      </div>

      <Section title="Log Food"><NutritionForm /></Section>
      <Section title="Water"><WaterForm /></Section>

      <Section title="Today's Diary">
        {todayEntries.length === 0 ? <Empty msg="Nothing logged today." /> : (
          <div className="space-y-3">
            {["breakfast","lunch","dinner","snack"].map(mt => {
              const meals = todayEntries.filter(e => e.mealType === mt);
              if (!meals.length) return null;
              return (
                <div key={mt}>
                  <div className="text-xs font-semibold text-stone-400 uppercase mb-2 capitalize">{mt}</div>
                  <div className="space-y-1.5">
                    {meals.map(e => {
                      const food = e.food;
                      if (!food) return null;
                      const f = e.grams ? e.grams / (food.servingSize || 100) : e.servings;
                      const grams = food.servingSize ? (food.servingSize * (e.grams ? e.grams / food.servingSize : e.servings)).toFixed(0) : null;
                      return (
                        <div key={e.id} className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-[var(--border-light)]">
                          <div>
                            <span className="text-sm text-stone-700 font-medium">{food.name}</span>
                            {food.brand && <span className="text-xs text-stone-400 ml-1">· {food.brand}</span>}
                            <span className="text-xs text-stone-400 ml-1.5">{e.servings > 1 ? `${e.servings}× ` : ""}{grams ? `${grams}g` : ""}</span>
                          </div>
                          <div className="text-xs text-stone-400 font-mono">
                            {food.calories ? `${(food.calories * f).toFixed(0)} kcal` : ""}
                            {food.protein ? ` · P${(food.protein * f).toFixed(0)}` : ""}
                            {food.carbs ? ` C${(food.carbs * f).toFixed(0)}` : ""}
                            {food.fat ? ` F${(food.fat * f).toFixed(0)}` : ""}
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
      </Section>
    </div>
  );
}

function MCard({ l, v, g, u, c }: { l: string; v: string; g: string; u: string; c: string }) {
  return (
    <div className="p-3 rounded-2xl bg-white border border-[var(--border)] shadow-[var(--shadow-card)]">
      <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">{l}</div>
      <div className={`text-xl font-bold mt-1 font-mono ${c}`}>{v}</div>
      <div className="text-[11px] text-stone-400">{g !== "--" ? `Goal: ${g} ${u}` : u}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl bg-white border border-[var(--border)] shadow-[var(--shadow-card)] p-5 animate-fade-in"><h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">{title}</h2>{children}</section>;
}

function Empty({ msg }: { msg: string }) {
  return <div className="py-8 text-center text-sm text-stone-400">{msg}</div>;
}
