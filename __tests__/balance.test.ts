import { describe, it, expect } from "vitest";

// Pure account balance from ledger — same logic as in /finance/accounts/[id] page

interface LedgerEntry {
  type: "income" | "expense";
  amount: number; // cents
}

function calculateBalance(initialBalance: number, entries: LedgerEntry[]): number {
  return entries.reduce((bal, entry) => {
    if (entry.type === "income") return bal + entry.amount;
    if (entry.type === "expense") return bal - entry.amount;
    return bal;
  }, initialBalance);
}

function calculateRunningBalances(initialBalance: number, entries: LedgerEntry[]): number[] {
  const balances: number[] = [];
  let running = initialBalance;
  for (const entry of entries) {
    if (entry.type === "income") running += entry.amount;
    else if (entry.type === "expense") running -= entry.amount;
    balances.push(running);
  }
  return balances;
}

describe("account balance from ledger", () => {
  it("starts at initial balance with no entries", () => {
    expect(calculateBalance(100000, [])).toBe(100000); // $1000
  });

  it("adds income", () => {
    const entries: LedgerEntry[] = [
      { type: "income", amount: 150000 }, // +$1500
    ];
    expect(calculateBalance(100000, entries)).toBe(250000); // $2500
  });

  it("subtracts expenses", () => {
    const entries: LedgerEntry[] = [
      { type: "expense", amount: 4500 }, // -$45
    ];
    expect(calculateBalance(100000, entries)).toBe(95500); // $955
  });

  it("handles mixed transactions in order", () => {
    const entries: LedgerEntry[] = [
      { type: "income", amount: 200000 }, // +$2000
      { type: "expense", amount: 50000 }, // -$500
      { type: "expense", amount: 25000 }, // -$250
      { type: "income", amount: 100000 }, // +$1000
    ];
    expect(calculateBalance(0, entries)).toBe(225000); // $2250
  });

  it("handles zero initial balance", () => {
    const entries: LedgerEntry[] = [
      { type: "expense", amount: 5000 }, // -$50
    ];
    expect(calculateBalance(0, entries)).toBe(-5000);
  });

  it("calculates running balances correctly", () => {
    const entries: LedgerEntry[] = [
      { type: "income", amount: 100000 }, // +$1000 → $1000
      { type: "expense", amount: 30000 }, // -$300 → $700
      { type: "expense", amount: 20000 }, // -$200 → $500
    ];
    const running = calculateRunningBalances(0, entries);
    expect(running).toEqual([100000, 70000, 50000]);
  });

  it("handles large amounts without floating point issues", () => {
    const entries: LedgerEntry[] = [
      { type: "income", amount: 999999999 }, // $9,999,999.99
      { type: "expense", amount: 1 },         // -$0.01
    ];
    const balance = calculateBalance(0, entries);
    expect(balance).toBe(999999998);
    // Verify no floating point drift
    expect(Number.isInteger(balance)).toBe(true);
  });

  it("all calculations stay as integers (no floating point)", () => {
    const entries: LedgerEntry[] = [];
    for (let i = 0; i < 1000; i++) {
      entries.push({ type: "income", amount: 33 }); // $0.33 each
    }
    const balance = calculateBalance(0, entries);
    expect(balance).toBe(33000); // $330.00
    expect(Number.isInteger(balance)).toBe(true);
  });
});
