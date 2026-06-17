# 04 — Nutrition Module

**Current Completeness:** 35%  
**Target Completeness:** 100%  
**Priority:** P1 — High  
**Depends On:** T1D module (carb counting → bolus calculation), Finance module (food budget)  
**Feeds Into:** T1D module (post-meal glucose response), Body Metrics (weight vs intake)

---

## 1. Current State Analysis

### 1.1 Existing Models

| Model | Fields | Assessment |
|---|---|---|
| `FoodItem` | id, name, brand, barcode, servingSize, servingUnit, 16 nutrient fields, isSeeded | **Good.** Comprehensive nutrient tracking. Open Food Facts integration. |
| `FoodDiaryEntry` | id, date, mealType (breakfast/lunch/dinner/snack), foodId, servings, grams | **Basic.** Links to food but no carb-specific fields, no glucose correlation. |
| `NutritionGoal` | id, calories, protein, carbs, fat, fiber, waterMl, updatedAt | **Singleton.** One goal set. No per-meal distribution. |
| `WaterLog` | id, date, amountMl | **Simple but functional.** |
| `MealPhoto` | id, date, imagePath, notes | **Basic.** No AI food recognition integration. |

### 1.2 Existing API Routes

Functional: `/api/health/nutrition`, `/api/health/nutrition/food-search` (Open Food Facts + local DB), `/api/health/water`. 

---

## 2. Why 35%? — Gap Analysis

Almonzer is a **T1D endurance athlete in Malaysia on a tight budget**. His nutrition needs are:
1. **Carb counting for every meal** — the primary purpose of nutrition tracking for a T1D
2. **Malaysian food database** — local dishes with unknown carb counts
3. **Budget-conscious eating** — RM 1,200-1,400/month total living, food is a major cost
4. **Exercise fueling** — pre-run carbs, during-run gels, post-run recovery

### Critical Gaps

1. **Carb counting is not first-class.** Carbs are buried among 16 nutrients. For T1D, carbs are THE number. The UI should show carbs prominently with a bolus suggestion.

2. **No net carbs calculation.** Net carbs = total carbs - fiber. This is what matters for insulin dosing.

3. **No Malaysian food database.** Nasi lemak, roti canai, char kway teow, nasi goreng, teh tarik — none of these exist in Open Food Facts. He needs to build a personal database.

4. **No post-meal glucose correlation.** The ultimate T1D nutrition insight: "When I eat nasi lemak, my glucose spikes to 200. When I eat chicken rice, it stays at 140." This requires linking FoodDiaryEntry → CarbEntry → GlucoseReading.

5. **No budget tracking per food.** He can't see "I spent RM 85 on food this week, RM 12 was on teh tarik."

6. **No fasting timer.** Ramadan requires fasting from dawn to sunset. No model for tracking fasting windows or pre-dawn (suhoor) / sunset (iftar) meals.

### Not Needed
- Recipe sharing / social
- Restaurant menu integration
- Meal delivery integration
- Advanced micronutrient tracking beyond what exists

---

## 3. Target State — Functional Requirements

### 3.1 New Models

#### Recipe
```prisma
model Recipe {
  id          String   @id @default(uuid())
  name        String
  description String?
  servings    Float    @default(1)
  prepTime    Int?     // minutes
  cookTime    Int?     // minutes
  instructions String? // markdown
  notes       String?
  isMalaysian Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  ingredients RecipeIngredient[]
  totalCalories  Float? // computed from ingredients
  totalCarbs     Float? // computed
  totalProtein   Float? // computed
  totalFat       Float? // computed
  totalFiber     Float? // computed
  netCarbs       Float? // computed: totalCarbs - totalFiber
  
  @@index([name])
}
```

#### RecipeIngredient
```prisma
model RecipeIngredient {
  id        String   @id @default(uuid())
  recipeId  String
  foodId    String?  // FK to FoodItem (optional — can use custom)
  name      String   // if no foodId: "chicken breast"
  amount    Float    // quantity
  unit      String   // g, ml, cup, tbsp, piece
  recipe    Recipe   @relation(fields: [recipeId], references: [id], onDelete: Cascade)
  
  @@index([recipeId])
}
```

#### FrequentFood
```prisma
model FrequentFood {
  id              String   @id @default(uuid())
  foodId          String   // FK to FoodItem
  personalName    String?  // "Mom's nasi lemak", "Kepong mamak roti canai"
  typicalCarbs    Float?   // user's estimate for a typical serving
  typicalServing  Float?   // grams
  typicalGlucose  Float?   // avg post-meal glucose (computed from history)
  useCount        Int      @default(0) // how often logged
  lastUsedAt      DateTime?
  notes           String?
  
  @@unique([foodId])
}
```

#### FoodCost
```prisma
model FoodCost {
  id          String   @id @default(uuid())
  foodId      String?  // FK to FoodItem
  foodName    String   // "Chicken breast", "Eggs (10 pack)"
  store       String?  // "NSK", "Mydin", "Village Grocer"
  price       Int      // cents (in MYR)
  quantity    Float    // how many units
  unit        String   // kg, pack, piece, ml
  pricePerUnit Float?  // computed: price / quantity
  date        DateTime @default(now())
  notes       String?
  
  @@index([foodId])
  @@index([date])
}
```

#### FastingSession
```prisma
model FastingSession {
  id          String   @id @default(uuid())
  date        DateTime
  type        String   @default("ramadan") // ramadan, intermittent, voluntary_sunnah
  startTime   DateTime // suhoor end / fajr
  endTime     DateTime // iftar / maghrib
  duration    Float?   // computed: hours fasted
  preFastMealId String? // FK to FoodDiaryEntry (suhoor)
  postFastMealId String? // FK to FoodDiaryEntry (iftar)
  preFastGlucose  Float? // glucose before starting
  postFastGlucose Float? // glucose at iftar
  notes       String?
  createdAt   DateTime @default(now())
  
  @@index([date])
  @@index([type])
}
```

### 3.2 Changes to Existing Models

#### FoodDiaryEntry — Add:
```prisma
carbEstimate     Float?   // user-estimated or auto-calculated carbs
bolusSuggested   Float?   // units suggested by bolus calculator
bolusTaken       Float?   // units actually taken
postMealGlucose  Float?   // glucose reading 2h after meal
netCarbs         Float?   // computed from food: carbs - fiber
costEstimate     Int?     // approximate cost in cents
```

#### FoodItem — Add:
```prisma
netCarbs        Float?    // computed: carbs - fiber
isMalaysian     Boolean   @default(false)
isCommonFood    Boolean   @default(false) // frequently eaten by this user
```

---

## 4. Target State — Technical Requirements

### 4.1 New API Routes

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/health/nutrition/recipes` | GET, POST, PATCH, DELETE | Recipe CRUD with ingredient computation |
| `/api/health/nutrition/frequent` | GET, POST | Frequent foods with personal carb notes |
| `/api/health/nutrition/costs` | GET, POST, DELETE | Food cost tracking |
| `/api/health/nutrition/fasting` | GET, POST, DELETE | Fasting session tracking |
| `/api/health/nutrition/glucose-response` | GET | For a given food, return avg post-meal glucose from history |
| `/api/health/nutrition/stats` | GET | Daily macros, weekly averages, budget spent on food |

### 4.2 Carb-First Logging Flow

```
User opens nutrition log
  → Select meal type (breakfast/lunch/dinner/snack)
  → Search food (local DB or Open Food Facts)
  → If Malaysian food not found: "Add custom food" with carb estimate
  → System shows: carbs = Xg, net carbs = Xg
  → If T1D module configured: shows bolus suggestion
  → User enters: servings, actual bolus taken
  → Optional: log cost (for budget tracking)
  → 2h later: prompt for post-meal glucose reading
  → System correlates: this food → this glucose response
```

### 4.3 Net Carbs Computation

```typescript
// Auto-computed on food creation and on diary entry
function calculateNetCarbs(food: FoodItem): number | null {
  if (food.carbs == null) return null;
  return food.carbs - (food.fiber || 0);
}
```

### 4.4 Post-Meal Glucose Correlation

```typescript
// lib/nutrition-insights.ts
async function getGlucoseResponseForFood(foodId: string, userId?: string): Promise<{
  avgGlucose2h: number | null;
  avgGlucose4h: number | null;
  sampleSize: number;
  rating: "great" | "ok" | "spike" | "unknown";
}> {
  // Find all FoodDiaryEntries for this food that have postMealGlucose linked
  // Average the 2h and 4h values
  // Rating: <140 = great, 140-180 = ok, >180 = spike
}
```

---

## 5. UI/UX Requirements

### 5.1 Nutrition Dashboard (Redesigned — Carb-First)

```
┌──────────────────────────────────────────────────────────────┐
│ Nutrition                                   Today            │
│ ┌───────────┬───────────┬───────────┬──────────────────────┐ │
│ │ Carbs     │ Protein   │ Calories  │ Water               │ │
│ │ 145g      │ 82g       │ 1,850     │ 1.8L / 3L           │ │
│ │ Goal: 180g│ Goal: 120g│ Goal:2200 │ ██████░░░░ 60%     │ │
│ └───────────┴───────────┴───────────┴──────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Today's Meals                                            │ │
│ │ 🥣 Breakfast (08:00)     Roti canai + dal   45g carbs   │ │
│ │    Bolus: 4.5u    Post-meal: 132 ✓                       │ │
│ │ 🍗 Lunch (13:30)         Chicken rice       60g carbs   │ │
│ │    Bolus: 6.0u    Post-meal: 168 △                       │ │
│ │ 🍌 Snack (16:00)         Banana             25g carbs   │ │
│ │    No bolus (pre-run)    Post-meal: check                 │ │
│ │ 🍲 Dinner (19:00)        Nasi goreng        55g carbs   │ │
│ │    Bolus: 5.5u    Post-meal: pending                     │ │
│ │                                          [Log Meal]       │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Frequent Foods                        [Search Database]  │ │
│ │ 🍗 Chicken rice       ~60g carbs   Usually OK (142 avg)  │ │
│ │ 🫓 Roti canai         ~45g carbs   Watch portions (158)  │ │
│ │ 🍚 Nasi lemak         ~70g carbs   Spike risk (195 avg)  │ │
│ │ 🍌 Banana (medium)    ~25g carbs   Safe pre-run (118)    │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### 5.2 Food Logging Flow (Mobile — Carb-First)

1. Tap FAB → "Log Meal" → sheet opens
2. Select meal type: 🥣 Breakfast / 🍗 Lunch / 🍲 Dinner / 🍌 Snack
3. Search field with barcode scanner option
4. Results show: food name + **carbs per serving** (primary metric) + calories (secondary)
5. Select food → servings picker → shows: **"45g carbs · 320 cal · 12g protein"**
6. If T1D module configured: **"Suggested bolus: 4.5u (1u:10g ratio, no IOB)"**
7. Bolus taken: number input (defaults to suggestion)
8. "Log" → entry saved
9. 2h reminder: "Check glucose for chicken rice meal"

### 5.3 Malaysian Food Quick-Add

A dedicated section for local foods:
- Nasi lemak (70g carbs)
- Roti canai (45g carbs)
- Char kway teow (65g carbs)
- Nasi goreng kampung (55g carbs)
- Teh tarik (25g carbs)
- Milo ais (30g carbs)
- Mee goreng mamak (60g carbs)

User adjusts carb estimates over time based on post-meal glucose data.

---

## 6. Implementation Steps

### Step 1: Database
1. Add `Recipe`, `RecipeIngredient`, `FrequentFood`, `FoodCost`, `FastingSession` models
2. Add fields to `FoodDiaryEntry`, `FoodItem`
3. Run migration

### Step 2: Utilities
1. Create `lib/net-carbs.ts` — net carbs calculation
2. Create `lib/nutrition-insights.ts` — post-meal glucose correlation

### Step 3: API Routes
1. Recipes CRUD endpoint
2. Frequent foods endpoint (with glucose response data)
3. Food costs endpoint
4. Fasting sessions endpoint
5. Nutrition stats endpoint
6. Expand food-search to prioritize frequent foods and Malaysian items

### Step 4: UI Components
1. `components/modules/nutrition/meal-logger.tsx` — carb-first logging
2. `components/modules/nutrition/frequent-foods.tsx` — personal food database with glucose ratings
3. `components/modules/nutrition/fasting-timer.tsx` — Ramadan/intermittent fasting
4. `components/modules/nutrition/recipe-builder.tsx` — recipe creation with nutrition computation
5. Update `nutrition-form.tsx` with carb-first design
6. Update `water-form.tsx` with progress visualization

### Step 5: Integration with T1D
1. FoodDiaryEntry creation → auto-calculate net carbs → suggest bolus if T1D configured
2. Post-meal glucose prompt → link reading to meal → compute glucose response rating
3. Frequent foods updated with avg post-meal glucose

### Step 6: Tests
1. `__tests__/lib/net-carbs.test.ts`
2. `__tests__/lib/nutrition-insights.test.ts`

---

## 7. Acceptance Criteria

1. Log "nasi lemak" for breakfast → shows 70g carbs → suggests 7.0u bolus (1:10 ratio) → user takes 6.5u → 2h later glucose is 155 → food rated "OK" (slight spike)
2. Search "teh tarik" → not in database → "Add custom food" → enter 25g carbs → saved to personal database as Malaysian food
3. Frequent foods page: chicken rice (60g carbs, avg response 142 ✓), nasi lemak (70g carbs, avg response 195 △)
4. Food cost: NSK chicken breast RM 12.90/kg logged → budget page shows "Food: RM 320 this month, RM 80 remaining"
5. Ramadan mode: fasting timer active → suhoor logged 04:45 → iftar at 19:25 → 14.7h fast → glucose at iftar: 78 (pre-low — eat immediately)
6. Recipe: "Budget Chicken Rice" created → 4 ingredients → computed: 620 cal, 55g carbs, 35g protein, RM 4.50/serving
