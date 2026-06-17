"use client";

import { useEffect, useState } from "react";
import { formatRunway, formatMYR, type RunwayData } from "@/lib/runway";
import { ProgressRing } from "@/components/ui/progress-ring";

function StatBox({
  label,
  value,
  subtitle,
  tone = "neutral",
}: {
  label: string;
  value: string;
  subtitle?: string;
  tone?: "positive" | "negative" | "gold" | "amber" | "neutral";
}) {
  const toneColors: Record<string, string> = {
    positive: "text-[var(--emerald)]",
    negative: "text-[var(--rose)]",
    gold: "text-[var(--gold)]",
    amber: "text-[var(--amber)]",
    neutral: "text-[var(--text)]",
  };

  return (
    <div className="flex flex-col gap-1 rounded-xl bg-[rgba(255,255,255,0.02)] p-3">
      <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--text-tertiary)]">
        {label}
      </span>
      <span className={`font-serif text-xl font-normal leading-tight ${toneColors[tone]}`}>
        {value}
      </span>
      {subtitle && (
        <span className="text-[9px] text-[var(--text-tertiary)]">{subtitle}</span>
      )}
    </div>
  );
}

export function RunwayWidget() {
  const [data, setData] = useState<RunwayData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/finance/runway")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="premium-panel animate-fade-in">
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
          Runway
        </div>
        <div className="mt-3 h-20 animate-pulse rounded-xl bg-[rgba(255,255,255,0.02)]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="premium-panel animate-fade-in">
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
          Runway
        </div>
        <p className="mt-2 text-xs text-[var(--text-tertiary)]">Unable to load runway data</p>
      </div>
    );
  }

  const fatherPct = Math.min(data.fatherSupportPct, 100);
  const clientPct = Math.min(data.clientIncomePct, 100);
  const burnVsIncome = data.monthlyIncome / Math.max(data.monthlyBurnRate, 1);

  return (
    <div className="premium-panel animate-fade-in">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
          Financial Runway
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
            data.cashflowPositive
              ? "bg-[var(--emerald-soft)] text-[var(--emerald)]"
              : "bg-[var(--rose-soft)] text-[var(--rose)]"
          }`}
        >
          {data.cashflowPositive ? "POSITIVE" : "BURNING"}
        </span>
      </div>

      {/* Runway ring */}
      <div className="flex items-center gap-4">
        <ProgressRing
          progress={Math.min(Math.max(data.runwayMonths / 12, 0), 1)}
          size={80}
          strokeWidth={6}
          className="flex-shrink-0"
        />
        <div>
          <div className="font-serif text-2xl font-normal leading-tight text-[var(--text)]">
            {formatRunway(data.runwayMonths)}
          </div>
          <div className="text-[10px] text-[var(--text-tertiary)]">
            {data.cashflowPositive ? "Until 100K MYR goal" : "Until savings depleted"}
          </div>
          {data.monthsToGoal > 0 && (
            <div className="mt-0.5 text-[10px] text-[var(--emerald)]">
              Goal in {data.monthsToGoal} months
            </div>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <StatBox
          label="Savings"
          value={formatMYR(data.totalSavings)}
          tone="neutral"
        />
        <StatBox
          label="Monthly Burn"
          value={formatMYR(data.monthlyBurnRate)}
          tone="negative"
        />
        <StatBox
          label="Monthly Income"
          value={formatMYR(data.monthlyIncome)}
          tone="positive"
        />
        <StatBox
          label="Subscriptions"
          value={formatMYR(data.subscriptionTotal)}
          subtitle="/month"
          tone="amber"
        />
      </div>

      {/* Income breakdown */}
      <div className="mt-4 space-y-2">
        <div className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--text-tertiary)]">
          Income Sources
        </div>

        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[rgba(255,255,255,0.05)]">
            <div
              className="h-full rounded-full bg-[var(--amber)] transition-all"
              style={{ width: `${fatherPct}%` }}
            />
          </div>
          <span className="w-12 text-right text-[10px] font-semibold tabular-nums text-[var(--text-tertiary)]">
            {fatherPct}%
          </span>
          <span className="text-[10px] text-[var(--text-tertiary)]">Father</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[rgba(255,255,255,0.05)]">
            <div
              className="h-full rounded-full bg-[var(--emerald)] transition-all"
              style={{ width: `${clientPct}%` }}
            />
          </div>
          <span className="w-12 text-right text-[10px] font-semibold tabular-nums text-[var(--text-tertiary)]">
            {clientPct}%
          </span>
          <span className="text-[10px] text-[var(--text-tertiary)]">Clients</span>
        </div>
      </div>

      {/* Burn ratio */}
      <div className="mt-3 flex items-center gap-2">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-[rgba(255,255,255,0.05)]">
          <div
            className={`h-full rounded-full transition-all ${
              burnVsIncome >= 1 ? "bg-[var(--emerald)]" : "bg-[var(--rose)]"
            }`}
            style={{ width: `${Math.min(burnVsIncome * 100, 100)}%` }}
          />
        </div>
        <span className="text-[9px] text-[var(--text-tertiary)]">
          {data.monthlyBurnRate > 0
            ? `${Math.round(burnVsIncome * 100)}% covered`
            : "No expenses"}
        </span>
      </div>
    </div>
  );
}
