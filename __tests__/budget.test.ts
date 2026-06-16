import { describe, it, expect } from "vitest";

// Pure budget calculation — same logic as in /api/finance/budget
interface BudgetRow {
  categoryId: string;
  budgeted: number | null;
}

interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
}

interface Txn {
  categoryId: string | null;
  type: "income" | "expense";
  amount: number; // cents
}

function calculateBudget(
  month: string,
  budgetRows: BudgetRow[],
  transactions: Txn[],
  categories: Category[]
) {
  const monthlyIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);

  const activity: Record<string, number> = {};
  transactions
    .filter((t) => t.type === "expense" && t.categoryId)
    .forEach((t) => {
      activity[t.categoryId!] = (activity[t.categoryId!] || 0) + t.amount;
    });

  const envelopes = categories
    .filter((c) => c.type === "expense")
    .map((c) => {
      const budget = budgetRows.find((b) => b.categoryId === c.id);
      const assigned = budget?.budgeted ?? 0;
      const spent = activity[c.id] || 0;
      const available = assigned - spent;
      return { categoryId: c.id, categoryName: c.name, assigned, activity: spent, available };
    });

  const totalAssigned = envelopes.reduce((s, e) => s + e.assigned, 0);
  const totalActivity = envelopes.reduce((s, e) => s + e.activity, 0);
  const availableToAssign = monthlyIncome - totalAssigned;

  return { month, monthlyIncome, totalAssigned, totalActivity, availableToAssign, envelopes };
}

describe("budget calculation", () => {
  const categories: Category[] = [
    { id: "cat-rent", name: "Rent", type: "expense" },
    { id: "cat-groceries", name: "Groceries", type: "expense" },
    { id: "cat-salary", name: "Salary", type: "income" },
    { id: "cat-freelance", name: "Freelance", type: "income" },
  ];

  it("calculates income correctly", () => {
    const txns: Txn[] = [
      { categoryId: "cat-salary", type: "income", amount: 500000 }, // $5000
    ];

    const result = calculateBudget("2026-06", [], txns, categories);
    expect(result.monthlyIncome).toBe(500000);
  });

  it("calculates envelope spending against budget", () => {
    const budgets: BudgetRow[] = [
      { categoryId: "cat-rent", budgeted: 200000 }, // $2000
      { categoryId: "cat-groceries", budgeted: 60000 }, // $600
    ];

    const txns: Txn[] = [
      { categoryId: "cat-rent", type: "expense", amount: 200000 }, // spent exactly budgeted
      { categoryId: "cat-groceries", type: "expense", amount: 45000 }, // spent less than budgeted
      { categoryId: "cat-salary", type: "income", amount: 500000 },
    ];

    const result = calculateBudget("2026-06", budgets, txns, categories);

    const rent = result.envelopes.find((e) => e.categoryName === "Rent")!;
    expect(rent.assigned).toBe(200000);
    expect(rent.activity).toBe(200000);
    expect(rent.available).toBe(0); // fully spent

    const groceries = result.envelopes.find((e) => e.categoryName === "Groceries")!;
    expect(groceries.assigned).toBe(60000);
    expect(groceries.activity).toBe(45000);
    expect(groceries.available).toBe(15000); // $150 left
  });

  it("calculates availableToAssign = income - total assigned", () => {
    const budgets: BudgetRow[] = [
      { categoryId: "cat-rent", budgeted: 200000 },
      { categoryId: "cat-groceries", budgeted: 60000 },
    ];

    const txns: Txn[] = [
      { categoryId: "cat-salary", type: "income", amount: 500000 },
    ];

    const result = calculateBudget("2026-06", budgets, txns, categories);
    expect(result.availableToAssign).toBe(500000 - 260000);
    expect(result.monthlyIncome).toBe(500000);
    expect(result.totalAssigned).toBe(260000);
  });

  it("handles no budget set (assigned = 0)", () => {
    const txns: Txn[] = [
      { categoryId: "cat-groceries", type: "expense", amount: 45000 },
      { categoryId: "cat-salary", type: "income", amount: 500000 },
    ];

    const result = calculateBudget("2026-06", [], txns, categories);
    const groceries = result.envelopes.find((e) => e.categoryName === "Groceries")!;
    expect(groceries.assigned).toBe(0);
    expect(groceries.activity).toBe(45000);
    expect(groceries.available).toBe(-45000); // overspent
  });

  it("handles no transactions", () => {
    const result = calculateBudget("2026-06", [], [], categories);
    expect(result.monthlyIncome).toBe(0);
    expect(result.totalAssigned).toBe(0);
    expect(result.envelopes.length).toBe(2); // 2 expense categories
    result.envelopes.forEach((e) => {
      expect(e.assigned).toBe(0);
      expect(e.activity).toBe(0);
    });
  });

  it("returns 100% availableToAssign when nothing is budgeted", () => {
    const txns: Txn[] = [
      { categoryId: "cat-salary", type: "income", amount: 300000 },
    ];

    const result = calculateBudget("2026-06", [], txns, categories);
    expect(result.availableToAssign).toBe(300000);
  });
});
