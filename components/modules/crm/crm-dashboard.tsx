"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ContactCard } from "./contact-card";
import type { ContactCardData } from "./contact-card";

interface DashboardData {
  keyPeople: ContactCardData[];
  needsAttention: ContactCardData[];
  overdueFollowUps: ContactCardData[];
}

export function CrmDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/crm/dashboard")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="premium-panel h-16 animate-pulse rounded-xl bg-[rgba(255,255,255,0.02)]" />
        ))}
      </div>
    );
  }

  if (!data) return <p className="text-xs text-[var(--text-tertiary)]">Could not load CRM data</p>;

  return (
    <div className="space-y-4">
      {/* Key People */}
      {data.keyPeople.length > 0 && (
        <div className="premium-panel">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--text)]">Key People</h2>
            <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
              {data.keyPeople.length}
            </span>
          </div>
          <div className="divide-y divide-[var(--border-light)]">
            {data.keyPeople.map((c) => (
              <ContactCard key={c.id} contact={c} />
            ))}
          </div>
        </div>
      )}

      {/* Needs Attention */}
      {data.needsAttention.length > 0 && (
        <div className="premium-panel border border-[var(--rose-soft)]">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--rose)]">Needs Attention</h2>
            <span className="rounded bg-[var(--rose-soft)] px-2 py-0.5 text-[9px] font-bold text-[var(--rose)]">
              {data.needsAttention.length}
            </span>
          </div>
          <div className="divide-y divide-[var(--border-light)]">
            {data.needsAttention.map((c) => (
              <ContactCard key={c.id} contact={c} />
            ))}
          </div>
        </div>
      )}

      {/* Overdue Follow-ups */}
      {data.overdueFollowUps.length > 0 && (
        <div className="premium-panel">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--text)]">Overdue Follow-ups</h2>
            <span className="rounded bg-[var(--amber-soft)] px-2 py-0.5 text-[9px] font-bold text-[var(--amber)]">
              {data.overdueFollowUps.length}
            </span>
          </div>
          <div className="divide-y divide-[var(--border-light)]">
            {data.overdueFollowUps.map((c) => (
              <ContactCard key={c.id} contact={c} />
            ))}
          </div>
        </div>
      )}

      {data.keyPeople.length === 0 && data.needsAttention.length === 0 && (
        <div className="premium-panel py-8 text-center">
          <p className="text-xs text-[var(--text-tertiary)]">No contacts yet</p>
          <Link
            href="/crm/new"
            className="mt-2 inline-block text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--accent)]"
          >
            Add your first contact &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
