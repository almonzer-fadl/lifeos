"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export interface ContactCardData {
  id: string;
  fullName: string;
  type: string;
  subType: string | null;
  relationshipHealth: string | null;
  lastContactedAt: string | null;
  nextFollowUpAt: string | null;
  location: string | null;
  group: { id: string; name: string; color: string | null } | null;
  _count: { interactions: number };
}

const healthConfig: Record<string, { label: string; color: string; bg: string }> = {
  strong: { label: "Strong", color: "text-[var(--emerald)]", bg: "bg-[var(--emerald-soft)]" },
  good: { label: "Good", color: "text-[var(--gold)]", bg: "bg-[rgba(212,175,55,0.1)]" },
  needs_attention: { label: "Needs Attention", color: "text-[var(--amber)]", bg: "bg-[var(--amber-soft)]" },
  strained: { label: "Strained", color: "text-[var(--rose)]", bg: "bg-[var(--rose-soft)]" },
  dormant: { label: "Dormant", color: "text-[var(--text-tertiary)]", bg: "bg-[rgba(255,255,255,0.03)]" },
};

const typeIcons: Record<string, string> = {
  partner: "💚",
  family: "👤",
  friend: "🤝",
  client: "💼",
  mentor: "🎓",
  colleague: "👥",
  acquaintance: "👋",
};

export function ContactCard({ contact }: { contact: ContactCardData }) {
  const health = contact.relationshipHealth
    ? healthConfig[contact.relationshipHealth] || healthConfig.dormant
    : null;

  const lastContacted = contact.lastContactedAt
    ? getRelativeTime(new Date(contact.lastContactedAt))
    : null;

  const isOverdue =
    contact.nextFollowUpAt && new Date(contact.nextFollowUpAt) < new Date();

  return (
    <Link href={`/crm/${contact.id}`}>
      <motion.div
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-[rgba(255,255,255,0.03)]"
      >
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(255,255,255,0.05)] text-lg">
          {typeIcons[contact.type] || "👤"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[var(--text)]">
              {contact.fullName}
            </span>
            {health && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${health.bg} ${health.color}`}
              >
                {health.label}
              </span>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-[10px] text-[var(--text-tertiary)]">
            {contact.subType && (
              <span className="capitalize">{contact.subType.replace(/_/g, " ")}</span>
            )}
            {contact.location && <span>· {contact.location}</span>}
          </div>
          <div className="mt-1 flex items-center gap-3 text-[9px] text-[var(--text-tertiary)]">
            {lastContacted && <span>Last: {lastContacted}</span>}
            {contact._count.interactions > 0 && (
              <span>{contact._count.interactions} interactions</span>
            )}
            {isOverdue && (
              <span className="font-semibold text-[var(--rose)]">Overdue</span>
            )}
          </div>
        </div>
        <div className="text-[10px] text-[var(--text-tertiary)]">&rarr;</div>
      </motion.div>
    </Link>
  );
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}
