// All money is stored as integer cents in the database.
// This module handles conversion between display (dollars) and storage (cents).

export const CENTS_PER_DOLLAR = 100;

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * CENTS_PER_DOLLAR);
}

export function centsToDollars(cents: number): number {
  return cents / CENTS_PER_DOLLAR;
}

export function formatCents(cents: number, currency = "USD", decimals = 2): string {
  const dollars = centsToDollars(cents);
  return dollars.toFixed(decimals);
}

export function formatCentsShort(cents: number): string {
  const dollars = centsToDollars(cents);
  return Math.round(dollars).toLocaleString();
}

export function parseMoneyInput(value: string): number {
  const num = parseFloat(value);
  if (isNaN(num) || num < 0) return 0;
  return dollarsToCents(num);
}

export function parseOptionalMoneyInput(value: string): number | null {
  if (!value || value.trim() === "") return null;
  const num = parseFloat(value);
  if (isNaN(num)) return null;
  return dollarsToCents(num);
}
