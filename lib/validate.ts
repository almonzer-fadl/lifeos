import { z } from "zod";

const uuid = z.string().uuid("Invalid UUID");
const isoDate = z.string().datetime("Invalid ISO date").or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"));
const moneyCents = z.number().int("Amount must be integer cents");
const moneyDisplay = z.string().regex(/^-?\d+(\.\d{2})?$/, "Invalid money format");
const nonEmptyString = z.string().min(1, "Required");

export const schemas = {
  uuid,
  isoDate,
  moneyCents,
  moneyDisplay,
  nonEmptyString,

  account: z.object({
    name: nonEmptyString,
    type: z.enum(["checking", "savings", "cash", "credit", "investment", "crypto", "loan", "mortgage"]),
    currency: z.string().length(3).default("USD"),
    initialBalance: z.number().int().default(0),
    isDebt: z.boolean().default(false),
    interestRate: z.number().min(0).nullable().default(null),
    minimumPayment: z.number().int().min(0).nullable().default(null),
    creditLimit: z.number().int().min(0).nullable().default(null),
    paymentDueDay: z.number().int().min(1).max(31).nullable().default(null),
  }),

  transaction: z.object({
    accountId: uuid,
    type: z.enum(["income", "expense"]),
    amount: z.number().positive("Amount must be positive"),
    currency: z.string().length(3).default("USD"),
    categoryId: uuid.nullable().default(null),
    description: z.string().nullable().default(null),
    date: isoDate.default(() => new Date().toISOString()),
    status: z.enum(["pending", "cleared", "reconciled"]).default("pending"),
    isTransfer: z.boolean().default(false),
    transferAccountId: uuid.nullable().default(null),
    parentTransactionId: uuid.nullable().default(null),
  }),

  category: z.object({
    name: nonEmptyString,
    type: z.enum(["income", "expense"]),
    parentId: uuid.nullable().default(null),
  }),

  budget: z.object({
    categoryId: uuid,
    month: isoDate,
    amount: moneyCents,
  }),

  asset: z.object({
    name: nonEmptyString,
    type: z.enum(["investment", "property", "vehicle", "crypto", "gold", "collectible", "other"]),
    purchaseValue: z.number().int().default(0),
    currentValue: z.number().int().default(0),
    currency: z.string().length(3).default("USD"),
  }),

  goal: z.object({
    name: nonEmptyString,
    targetAmount: moneyCents,
    currentAmount: moneyCents.default(0),
    currency: z.string().length(3).default("USD"),
    accountId: uuid.nullable().default(null),
  }),

  recurring: z.object({
    description: nonEmptyString,
    type: z.enum(["income", "expense"]),
    amount: z.number().positive(),
    currency: z.string().length(3).default("USD"),
    accountId: uuid,
    frequency: z.enum(["daily", "weekly", "biweekly", "monthly", "quarterly", "yearly"]),
    startDate: isoDate,
    nextDate: isoDate,
    categoryId: uuid.nullable().default(null),
  }),

  glucose: z.object({
    value: z.number().min(20).max(600),
    notes: z.string().nullable().default(null),
    unit: z.enum(["mg/dL", "mmol/L"]).default("mg/dL"),
  }),

  insulin: z.object({
    units: z.number().positive(),
    type: z.enum(["rapid", "long", "mixed", "correction"]),
    brand: z.string().nullable().default(null),
    notes: z.string().nullable().default(null),
  }),

  activity: z.object({
    type: z.enum(["run", "swim", "bike", "walk", "hike", "other"]),
    startTime: isoDate,
    endTime: isoDate.nullable().default(null),
    distance: z.number().min(0).nullable().default(null),
    heartRateAvg: z.number().int().min(30).max(250).nullable().default(null),
    notes: z.string().nullable().default(null),
  }),

  sleep: z.object({
    startTime: isoDate,
    endTime: isoDate,
    quality: z.number().int().min(1).max(5),
    notes: z.string().nullable().default(null),
  }),

  bodyMeasurement: z.object({
    weight: z.number().positive().nullable().default(null),
    bodyFatPct: z.number().min(0).max(60).nullable().default(null),
    waist: z.number().positive().nullable().default(null),
    chest: z.number().positive().nullable().default(null),
    notes: z.string().nullable().default(null),
  }),

  labResult: z.object({
    testName: nonEmptyString,
    value: z.number(),
    unit: z.string().nullable().default(null),
    refRangeLow: z.number().nullable().default(null),
    refRangeHigh: z.number().nullable().default(null),
    date: isoDate.default(() => new Date().toISOString()),
  }),

  foodDiary: z.object({
    foodId: uuid,
    mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
    servings: z.number().positive().default(1),
    grams: z.number().positive().nullable().default(null),
  }),

  water: z.object({
    amountMl: z.number().int().positive(),
  }),

  habit: z.object({
    name: nonEmptyString,
    frequency: z.enum(["daily", "weekly", "monthly"]),
    timeOfDay: z.enum(["morning", "afternoon", "evening", "night"]).nullable().default(null),
  }),

  habitLog: z.object({
    habitId: uuid,
    completed: z.boolean(),
  }),

  task: z.object({
    title: nonEmptyString,
    description: z.string().nullable().default(null),
    priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
    status: z.enum(["todo", "in_progress", "done"]).default("todo"),
    projectId: uuid.nullable().default(null),
    dueDate: isoDate.nullable().default(null),
  }),

  journal: z.object({
    content: nonEmptyString,
    mood: z.string().nullable().default(null),
    tags: z.string().nullable().default(null),
  }),
};

export type Schemas = typeof schemas;

export function validate<T extends z.ZodTypeAny>(schema: T, data: unknown): { success: true; data: z.infer<T> } | { success: false; errors: { field: string; message: string }[] } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors = result.error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
  return { success: false, errors };
}
