"use client";

import { useState } from "react";
import Link from "next/link";
import { ContactCard } from "@/components/modules/crm/contact-card";
import { CrmDashboard } from "@/components/modules/crm/crm-dashboard";

interface CrmClientProps {
  contacts: Parameters<typeof ContactCard>[0]["contact"][];
  groups: { id: string; name: string; color: string | null; _count: { contacts: number } }[];
  upcomingBirthdays: { id: string; fullName: string; daysUntil: number }[];
}

export function CrmClient({ contacts, groups, upcomingBirthdays }: CrmClientProps) {
  const [view, setView] = useState<"all" | "dashboard">("dashboard");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [groupFilter, setGroupFilter] = useState<string | null>(null);

  const filtered = contacts.filter((c) => {
    if (search) {
      const q = search.toLowerCase();
      if (!c.fullName.toLowerCase().includes(q)) return false;
    }
    if (typeFilter && c.type !== typeFilter) return false;
    if (groupFilter && c.group?.id !== groupFilter) return false;
    return true;
  });

  const types = [...new Set(contacts.map((c) => c.type))];

  return (
    <div className="mt-6 space-y-4">
      {/* View toggle */}
      <div className="flex gap-1 rounded-xl bg-[rgba(255,255,255,0.03)] p-1">
        {["dashboard", "all"].map((v) => (
          <button
            key={v}
            onClick={() => setView(v as "all" | "dashboard")}
            className={`flex-1 rounded-lg py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
              view === v
                ? "bg-[var(--accent)] text-[var(--bg)]"
                : "text-[var(--text-tertiary)]"
            }`}
          >
            {v === "dashboard" ? "Overview" : "All Contacts"}
          </button>
        ))}
      </div>

      {view === "dashboard" ? (
        <CrmDashboard />
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search contacts..."
              className="flex-1 rounded-lg border border-[var(--border-light)] bg-[rgba(255,255,255,0.02)] px-3 py-1.5 text-xs text-[var(--text)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)] focus:outline-none"
            />
            <select
              value={typeFilter || ""}
              onChange={(e) => setTypeFilter(e.target.value || null)}
              className="rounded-lg border border-[var(--border-light)] bg-[rgba(255,255,255,0.02)] px-2 py-1.5 text-xs text-[var(--text)]"
            >
              <option value="">All types</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              value={groupFilter || ""}
              onChange={(e) => setGroupFilter(e.target.value || null)}
              className="rounded-lg border border-[var(--border-light)] bg-[rgba(255,255,255,0.02)] px-2 py-1.5 text-xs text-[var(--text)]"
            >
              <option value="">All groups</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g._count.contacts})
                </option>
              ))}
            </select>
          </div>

          {/* Upcoming birthdays banner */}
          {upcomingBirthdays.length > 0 && (
            <div className="rounded-xl border border-[var(--gold-soft)] bg-[rgba(212,175,55,0.05)] p-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--gold)]">
                Upcoming Birthdays
              </div>
              <div className="mt-1 flex flex-wrap gap-2">
                {upcomingBirthdays.map((b) => (
                  <Link
                    key={b.id}
                    href={`/crm/${b.id}`}
                    className="rounded-lg bg-[rgba(255,255,255,0.05)] px-2 py-1 text-[10px] text-[var(--text)] transition-colors hover:bg-[rgba(255,255,255,0.08)]"
                  >
                    {b.fullName} — {b.daysUntil === 0 ? "Today!" : `${b.daysUntil}d`}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Contact list */}
          <div className="premium-panel">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--text)]">Contacts</h2>
              <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                {filtered.length}
              </span>
            </div>
            {filtered.length === 0 ? (
              <p className="py-4 text-center text-xs text-[var(--text-tertiary)]">No contacts found</p>
            ) : (
              <div className="divide-y divide-[var(--border-light)]">
                {filtered.slice(0, 50).map((c) => (
                  <ContactCard key={c.id} contact={c} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
