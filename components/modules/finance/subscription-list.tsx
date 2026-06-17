"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format, isAfter, addDays } from "date-fns";
import { formatMYR } from "@/lib/runway";

interface SubscriptionSummary {
  id: string;
  name: string;
  provider: string;
  amount: number;
  currency: string;
  billingCycle: string;
  nextBillingDate: string;
  category: string | null;
  isActive: boolean;
}

const categoryColors: Record<string, string> = {
  software: "border-[var(--accent)]",
  rent: "border-[var(--gold)]",
  phone: "border-[var(--emerald)]",
  health: "border-[var(--rose)]",
  education: "border-[var(--amber)]",
};

function cycleLabel(cycle: string): string {
  if (cycle === "monthly") return "/mo";
  if (cycle === "yearly") return "/yr";
  if (cycle === "weekly") return "/wk";
  return "";
}

export function SubscriptionList() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/finance/subscriptions?isActive=true")
      .then((r) => r.json())
      .then(setSubscriptions)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="premium-panel animate-fade-in">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--text)]">Subscriptions</h2>
        </div>
        <div className="mt-3 h-20 animate-pulse rounded-xl bg-[rgba(255,255,255,0.02)]" />
      </div>
    );
  }

  const now = new Date();
  const monthlyTotal = subscriptions.reduce((sum, s) => {
    if (s.billingCycle === "monthly") return sum + s.amount;
    if (s.billingCycle === "yearly") return sum + Math.round(s.amount / 12);
    if (s.billingCycle === "weekly") return sum + Math.round((s.amount * 52) / 12);
    return sum;
  }, 0);

  return (
    <div className="premium-panel animate-fade-in">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--text)]">Subscriptions</h2>
        <span className="text-[9px] font-bold tabular-nums text-[var(--text-tertiary)]">
          {formatMYR(monthlyTotal)}/mo
        </span>
      </div>

      {subscriptions.length === 0 ? (
        <p className="py-3 text-center text-xs text-[var(--text-tertiary)]">
          No active subscriptions
        </p>
      ) : (
        <div className="space-y-1">
          {subscriptions.map((sub) => {
            const nextDate = new Date(sub.nextBillingDate);
            const isDueSoon = isAfter(addDays(now, 7), nextDate) && isAfter(nextDate, now);
            const isOverdue = isAfter(now, nextDate);
            const borderColor = categoryColors[sub.category || ""] || "border-[var(--border-light)]";

            return (
              <Link
                key={sub.id}
                href={`/finance/subscriptions`}
                className={`flex items-center justify-between gap-3 rounded-xl border-l-2 px-3 py-2 transition-colors hover:bg-[rgba(255,255,255,0.03)] ${borderColor}`}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-[var(--text)]">{sub.name}</div>
                  <div className="text-[10px] text-[var(--text-tertiary)]">
                    {sub.provider}
                    {sub.category && ` · ${sub.category}`}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-xs font-semibold tabular-nums text-[var(--text)]">
                    {formatMYR(sub.amount)}
                    <span className="text-[9px] text-[var(--text-tertiary)]">
                      {cycleLabel(sub.billingCycle)}
                    </span>
                  </span>
                  <span
                    className={`text-[8px] font-bold uppercase tracking-wider ${
                      isOverdue
                        ? "text-[var(--rose)]"
                        : isDueSoon
                          ? "text-[var(--amber)]"
                          : "text-[var(--text-tertiary)]"
                    }`}
                  >
                    {isOverdue
                      ? "Overdue"
                      : format(nextDate, "MMM d")}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className="mt-3 border-t border-[var(--border-light)] pt-3">
        <Link
          href="/finance/subscriptions"
          className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--accent)] hover:underline"
        >
          Manage subscriptions &rarr;
        </Link>
      </div>
    </div>
  );
}
