import Link from "next/link";
import { db } from "@/lib/db";
import { formatMYR } from "@/lib/runway";

export const dynamic = "force-dynamic";

const statusColors: Record<string, string> = {
  ideation: "border-[var(--amber)]",
  building: "border-[var(--accent)]",
  launched: "border-[var(--emerald)]",
  active: "border-[var(--emerald)]",
  maintenance: "border-[var(--gold)]",
  paused: "border-[var(--text-tertiary)]",
  completed: "border-[var(--emerald)]",
  archived: "border-[var(--text-tertiary)]",
};

const typeIcons: Record<string, string> = {
  agency: "🔴",
  saas: "🟡",
  internal_tool: "⚪",
  client_app: "🔵",
  personal_vision: "🌍",
};

export default async function ProjectsPage() {
  const [activeProjects, visions, totalMRR] = await Promise.all([
    db.project.findMany({
      where: { status: { notIn: ["completed", "archived"] } },
      orderBy: [{ priority: "asc" }, { name: "asc" }],
      include: {
        _count: { select: { tasks: true, milestones: true } },
      },
    }),
    db.project.findMany({
      where: { type: "personal_vision" },
      orderBy: { priority: "asc" },
    }),
    db.project.aggregate({
      _sum: { mrr: true },
      where: { status: { notIn: ["completed", "archived"] } },
    }),
  ]);

  const activeNonVision = activeProjects.filter((p) => p.type !== "personal_vision");
  const nextActions = activeNonVision
    .filter((p) => p.nextAction)
    .slice(0, 3)
    .map((p) => ({ name: p.name, action: p.nextAction! }));
  const totalDealsWon = activeNonVision.reduce((s, p) => s + p.dealsWon, 0);

  return (
    <div className="premium-page animate-fade-in">
      <div className="premium-header flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="premium-kicker">Project Portfolio</div>
          <h1 className="premium-title">Projects</h1>
          <p className="premium-subtitle">Track everything you&apos;re building.</p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-[var(--bg)] transition-opacity hover:opacity-90"
        >
          + New Project
        </Link>
      </div>

      {/* Stats bar */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatBox label="Total MRR" value={formatMYR(totalMRR._sum.mrr || 0)} tone="positive" />
        <StatBox label="Active" value={`${activeNonVision.length}`} tone="neutral" />
        <StatBox label="Deals Won" value={`${totalDealsWon}`} tone="gold" />
        {nextActions.length > 0 && (
          <StatBox
            label="Next"
            value={nextActions[0].action || "—"}
            subtitle={nextActions[0].name}
            tone="amber"
          />
        )}
      </div>

      {/* Active projects */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--text)]">Active Projects</h2>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
            {activeNonVision.length}
          </span>
        </div>
        <div className="space-y-3">
          {activeNonVision.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className={`block rounded-xl border-l-2 bg-[rgba(255,255,255,0.02)] p-4 transition-colors hover:bg-[rgba(255,255,255,0.04)] ${statusColors[p.status] || "border-[var(--border-light)]"}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{typeIcons[p.type] || "📁"}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text)]">{p.name}</h3>
                    <p className="text-[10px] text-[var(--text-tertiary)]">
                      {p.type.replace("_", " ")} · {p.status.replace("_", " ")} · Priority {p.priority}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {p.mrr > 0 && (
                    <div className="text-xs font-semibold tabular-nums text-[var(--emerald)]">
                      {formatMYR(p.mrr)}/mo
                    </div>
                  )}
                  {p.pipelineStages && (p.activeDeals > 0 || p.dealsWon > 0) && (
                    <div className="text-[9px] text-[var(--text-tertiary)]">
                      {p.activeDeals} leads · {p.dealsWon} won
                    </div>
                  )}
                </div>
              </div>
              {(p.nextAction || p.stack) && (
                <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-[var(--border-light)] pt-2">
                  {p.nextAction && (
                    <span className="rounded bg-[rgba(255,255,255,0.05)] px-2 py-0.5 text-[10px] text-[var(--text)]">
                      Next: {p.nextAction}
                    </span>
                  )}
                  {p.stack && (
                    <span className="text-[9px] text-[var(--text-tertiary)]">{p.stack}</span>
                  )}
                </div>
              )}
              {/* Pipeline progress */}
              {p.pipelineStages && (
                <div className="mt-2 flex gap-1">
                  {Array.isArray(p.pipelineStages) &&
                    (p.pipelineStages as string[]).map((stage: string, i: number) => (
                      <div
                        key={stage}
                        className={`h-1 flex-1 rounded-full ${
                          i <= Math.floor(p.activeDeals / 2) ? "bg-[var(--accent)]" : "bg-[rgba(255,255,255,0.05)]"
                        }`}
                      />
                    ))}
                </div>
              )}
            </Link>
          ))}
          {activeNonVision.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-xs text-[var(--text-tertiary)]">No active projects</p>
            </div>
          )}
        </div>
      </div>

      {/* Long-term visions */}
      {visions.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--text)]">Long-Term Visions</h2>
          </div>
          <div className="space-y-2">
            {visions.map((v) => (
              <Link
                key={v.id}
                href={`/projects/${v.id}`}
                className="block rounded-xl bg-[rgba(255,255,255,0.01)] p-3 transition-colors hover:bg-[rgba(255,255,255,0.03)]"
              >
                <div className="flex items-center gap-2">
                  <span>{v.icon || "🌍"}</span>
                  <div>
                    <h3 className="text-xs font-medium text-[var(--text)]">{v.name}</h3>
                    {v.description && (
                      <p className="text-[10px] text-[var(--text-tertiary)] line-clamp-1">
                        {v.description}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

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
    <div className="rounded-xl bg-[rgba(255,255,255,0.02)] p-3">
      <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--text-tertiary)]">
        {label}
      </span>
      <div className={`mt-1 font-serif text-lg font-normal leading-tight ${toneColors[tone]}`}>
        {value}
      </div>
      {subtitle && (
        <span className="text-[9px] text-[var(--text-tertiary)]">{subtitle}</span>
      )}
    </div>
  );
}
