import { db } from "@/lib/db";

export interface RunwayData {
  totalSavings: number;
  monthlyBurnRate: number;
  monthlyIncome: number;
  cashflowPositive: boolean;
  runwayMonths: number;
  monthsToGoal: number;
  subscriptionTotal: number;
  fatherSupport: number;
  fatherSupportPct: number;
  clientIncome: number;
  clientIncomePct: number;
}

const LOOKBACK_DAYS = 90;
const GOAL_TARGET_CENTS = 100_000 * 100; // 100,000 in base currency units

export async function calculateRunway(): Promise<RunwayData> {
  const now = new Date();
  const lookbackStart = new Date(now);
  lookbackStart.setDate(lookbackStart.getDate() - LOOKBACK_DAYS);

  // Total savings: sum balances of all non-debt, active accounts
  const accounts = await db.account.findMany({
    where: { isDebt: false, isActive: true },
  });
  const totalSavings = accounts.reduce((sum, a) => {
    return sum + a.initialBalance;
  }, 0);

  // Monthly burn rate: average monthly expenses over lookback period
  const expenses = await db.transaction.aggregate({
    _sum: { amount: true },
    where: {
      type: "expense",
      date: { gte: lookbackStart },
    },
  });
  const totalExpenses = expenses._sum.amount || 0;
  const monthlyBurnRate = Math.round((totalExpenses / LOOKBACK_DAYS) * 30);

  // Monthly income: average monthly income over lookback period
  const income = await db.transaction.aggregate({
    _sum: { amount: true },
    where: {
      type: "income",
      date: { gte: lookbackStart },
    },
  });
  const totalIncome = income._sum.amount || 0;
  const monthlyIncome = Math.round((totalIncome / LOOKBACK_DAYS) * 30);

  // Cashflow
  const cashflowPositive = monthlyIncome >= monthlyBurnRate;
  const netCashflow = monthlyIncome - monthlyBurnRate;

  // Runway: how many months until savings run out
  let runwayMonths = Infinity;
  if (!cashflowPositive && monthlyBurnRate > 0) {
    runwayMonths = totalSavings / (monthlyBurnRate - monthlyIncome);
  }

  // Months to reach savings goal
  let monthsToGoal = Infinity;
  if (cashflowPositive && netCashflow > 0) {
    monthsToGoal = (GOAL_TARGET_CENTS - totalSavings) / netCashflow;
  }

  // Subscription total
  const subscriptions = await db.subscription.findMany({
    where: { isActive: true },
  });
  const subscriptionTotal = subscriptions.reduce((sum, s) => {
    if (s.billingCycle === "yearly") return sum + Math.round(s.amount / 12);
    if (s.billingCycle === "weekly") return sum + Math.round((s.amount * 52) / 12);
    return sum + s.amount;
  }, 0);

  // Father support
  const fatherAccounts = await db.account.findMany({
    where: { isFatherSupport: true, isActive: true },
  });
  const fatherTxns = await db.transaction.aggregate({
    _sum: { amount: true },
    where: {
      type: "income",
      date: { gte: lookbackStart },
      accountId: { in: fatherAccounts.map((a) => a.id) },
    },
  });
  const fatherTotal = fatherTxns._sum.amount || 0;
  const fatherSupport = Math.round((fatherTotal / LOOKBACK_DAYS) * 30);
  const fatherSupportPct = monthlyIncome > 0 ? (fatherSupport / monthlyIncome) * 100 : 0;

  // Client income (from invoices)
  const clientTxns = await db.transaction.aggregate({
    _sum: { amount: true },
    where: {
      type: "income",
      date: { gte: lookbackStart },
      invoiceId: { not: null },
    },
  });
  const clientTotal = clientTxns._sum.amount || 0;
  const clientIncome = Math.round((clientTotal / LOOKBACK_DAYS) * 30);
  const clientIncomePct = monthlyIncome > 0 ? (clientIncome / monthlyIncome) * 100 : 0;

  return {
    totalSavings,
    monthlyBurnRate,
    monthlyIncome,
    cashflowPositive,
    runwayMonths: Math.round(runwayMonths * 10) / 10,
    monthsToGoal: monthsToGoal === Infinity ? -1 : Math.round(monthsToGoal),
    subscriptionTotal,
    fatherSupport,
    fatherSupportPct: Math.round(fatherSupportPct),
    clientIncome,
    clientIncomePct: Math.round(clientIncomePct),
  };
}

export async function createRunwaySnapshot(notes?: string) {
  const data = await calculateRunway();
  return db.runwaySnapshot.create({
    data: {
      totalSavings: data.totalSavings,
      monthlyBurnRate: data.monthlyBurnRate,
      runwayMonths: data.runwayMonths,
      monthlyIncome: data.monthlyIncome,
      notes: notes || null,
    },
  });
}

export function formatRunway(months: number): string {
  if (months === Infinity || months < 0) return "∞";
  if (months >= 12) {
    const years = Math.floor(months / 12);
    const remaining = Math.round(months % 12);
    if (remaining === 0) return `${years}y`;
    return `${years}y ${remaining}m`;
  }
  return `${months.toFixed(1)}m`;
}

export function formatMYR(cents: number): string {
  const myr = cents / 100;
  if (myr < 0) return `-RM ${Math.abs(myr).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `RM ${myr.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export interface IncomeProjection {
  scenario: string;
  additionalMonthlyIncome: number;
  newRunwayMonths: number;
  newMonthsToGoal: number;
}

export async function projectIncome(
  additionalMonthlyIncome: number,
): Promise<IncomeProjection> {
  const current = await calculateRunway();
  const newMonthlyIncome = current.monthlyIncome + additionalMonthlyIncome;
  const newNetCashflow = newMonthlyIncome - current.monthlyBurnRate;

  let newRunwayMonths = Infinity;
  if (newNetCashflow < 0 && current.monthlyBurnRate > 0) {
    newRunwayMonths = current.totalSavings / Math.abs(newNetCashflow);
  }

  let newMonthsToGoal = Infinity;
  if (newNetCashflow > 0) {
    newMonthsToGoal = (GOAL_TARGET_CENTS - current.totalSavings) / newNetCashflow;
  }

  return {
    scenario: `Add ${formatMYR(additionalMonthlyIncome)}/mo income`,
    additionalMonthlyIncome,
    newRunwayMonths: Math.round(newRunwayMonths * 10) / 10,
    newMonthsToGoal: newMonthsToGoal === Infinity ? -1 : Math.round(newMonthsToGoal),
  };
}
