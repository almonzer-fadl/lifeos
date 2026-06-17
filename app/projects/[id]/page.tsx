import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatMYR } from "@/lib/runway";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;
  const project = await db.project.findUnique({
    where: { id },
    include: {
      tasks: { orderBy: { status: "asc" }, take: 20 },
      milestones: { orderBy: { sortOrder: "asc" } },
      mrrSnapshots: { orderBy: { date: "desc" }, take: 12 },
      invoices: { orderBy: { issuedDate: "desc" }, take: 5 },
    },
  });

  if (!project) notFound();

  const milestoneProgress = project.milestones.length > 0
    ? Math.round(
        (project.milestones.filter((m) => m.status === "achieved").length /
          project.milestones.length) *
          100
      )
    : 0;

  return (
    <div className="premium-page animate-fade-in">
      {/* Header */}
      <div className="premium-header mb-6">
        <Link href="/projects" className="mb-2 inline-block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] hover:text-[var(--accent)]">
          &larr; Projects
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="premium-title">{project.name}</h1>
              <span className="rounded-full bg-[rgba(255,255,255,0.05)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                {project.status.replace("_", " ")}
              </span>
            </div>
            <p className="premium-subtitle">
              {project.type.replace("_", " ")} · Priority {project.priority}
              {project.estimatedEffort && ` · ${project.estimatedEffort}`}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Description */}
          {project.description && (
            <div className="premium-panel">
              <p className="text-sm text-[var(--text)]">{project.description}</p>
              {project.notes && (
                <p className="mt-2 whitespace-pre-wrap text-xs text-[var(--text-tertiary)]">
                  {project.notes}
                </p>
              )}
            </div>
          )}

          {/* Revenue */}
          <div className="premium-panel">
            <h2 className="mb-3 text-sm font-semibold text-[var(--text)]">Revenue</h2>
            <div className="grid grid-cols-3 gap-3">
              <Stat label="MRR" value={formatMYR(project.mrr)} tone="positive" />
              <Stat label="ARR" value={formatMYR(project.arr)} tone="gold" />
              <Stat label="Lifetime" value={formatMYR(project.totalRevenue)} tone="neutral" />
            </div>
            {project.mrr > 0 && project.revenueModel === "subscription" && (
              <div className="mt-3">
                <div className="mb-1 text-[9px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                  MRR History
                </div>
                <div className="flex items-end gap-1" style={{ height: 40 }}>
                  {project.mrrSnapshots.slice().reverse().map((s, i) => (
                    <div
                      key={s.id}
                      className="flex-1 rounded-t bg-[var(--accent)] opacity-50"
                      style={{
                        height: `${Math.max(
                          4,
                          (s.mrr / Math.max(project.mrr, 1)) * 40
                        )}px`,
                      }}
                      title={`${format(new Date(s.date), "MMM yy")}: ${formatMYR(s.mrr)}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pipeline (if applicable) */}
          {project.pipelineStages && Array.isArray(project.pipelineStages) && (project.pipelineStages as string[]).length > 0 && (
            <div className="premium-panel">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[var(--text)]">Pipeline</h2>
                <span className="text-[10px] text-[var(--text-tertiary)]">
                  {project.activeDeals} active · {project.dealsWon} won
                </span>
              </div>
              <div className="flex gap-1">
                {(project.pipelineStages as string[]).map((stage: string) => (
                  <div
                    key={stage}
                    className="flex-1 rounded-lg bg-[rgba(255,255,255,0.02)] p-2 text-center"
                  >
                    <div className="text-[8px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                      {stage}
                    </div>
                    <div className="mt-0.5 text-xs font-semibold tabular-nums text-[var(--text)]">
                      —
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks */}
          <div className="premium-panel">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--text)]">Tasks</h2>
              <Link
                href={`/tasks?projectId=${project.id}`}
                className="text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)]"
              >
                View all &rarr;
              </Link>
            </div>
            {project.tasks.length === 0 ? (
              <p className="py-3 text-center text-xs text-[var(--text-tertiary)]">No tasks yet</p>
            ) : (
              <div className="space-y-1">
                {project.tasks.slice(0, 10).map((t) => (
                  <Link
                    key={t.id}
                    href={`/tasks/${t.id}`}
                    className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-[rgba(255,255,255,0.03)]"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          t.status === "done"
                            ? "bg-[var(--emerald)]"
                            : t.status === "in_progress"
                              ? "bg-[var(--amber)]"
                              : "bg-[rgba(255,255,255,0.2)]"
                        }`}
                      />
                      <span
                        className={`text-xs ${t.status === "done" ? "text-[var(--text-tertiary)] line-through" : "text-[var(--text)]"}`}
                      >
                        {t.title}
                      </span>
                    </div>
                    <span className="text-[9px] capitalize text-[var(--text-tertiary)]">
                      {t.priority}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Milestones */}
          <div className="premium-panel">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--text)]">Milestones</h2>
              <span className="text-[10px] text-[var(--text-tertiary)]">
                {milestoneProgress}%
              </span>
            </div>
            {project.milestones.length === 0 ? (
              <p className="py-3 text-center text-xs text-[var(--text-tertiary)]">No milestones</p>
            ) : (
              <div className="space-y-1">
                {project.milestones.map((m) => (
                  <div key={m.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5">
                    <span className="text-xs">
                      {m.status === "achieved" ? "✓" : m.status === "missed" ? "✗" : "○"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span
                        className={`text-xs ${m.status === "achieved" ? "text-[var(--emerald)]" : m.status === "missed" ? "text-[var(--rose)]" : "text-[var(--text)]"}`}
                      >
                        {m.title}
                      </span>
                      {m.targetDate && (
                        <span className="ml-1 text-[9px] text-[var(--text-tertiary)]">
                          {format(new Date(m.targetDate), "MMM d")}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Progress bar */}
            {project.milestones.length > 0 && (
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-[rgba(255,255,255,0.05)]">
                <div
                  className="h-full rounded-full bg-[var(--emerald)] transition-all"
                  style={{ width: `${milestoneProgress}%` }}
                />
              </div>
            )}
          </div>

          {/* Tech stack */}
          {(project.stack || project.repoUrl || project.deployUrl || project.port) && (
            <div className="premium-panel">
              <h2 className="mb-3 text-sm font-semibold text-[var(--text)]">Tech</h2>
              <div className="space-y-2 text-xs">
                {project.stack && (
                  <div>
                    <span className="text-[var(--text-tertiary)]">Stack: </span>
                    <span className="text-[var(--text)]">{project.stack}</span>
                  </div>
                )}
                {project.repoUrl && (
                  <div>
                    <span className="text-[var(--text-tertiary)]">Repo: </span>
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--accent)] hover:underline"
                    >
                      {project.repoUrl}
                    </a>
                  </div>
                )}
                {project.deployUrl && (
                  <div>
                    <span className="text-[var(--text-tertiary)]">Deploy: </span>
                    <a
                      href={project.deployUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--accent)] hover:underline"
                    >
                      {project.deployUrl}
                    </a>
                  </div>
                )}
                {project.port && (
                  <div>
                    <span className="text-[var(--text-tertiary)]">Port: </span>
                    <span className="text-[var(--text)]">{project.port}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dates */}
          {(project.startedAt || project.launchedAt || project.completedAt) && (
            <div className="premium-panel">
              <h2 className="mb-3 text-sm font-semibold text-[var(--text)]">Timeline</h2>
              <div className="space-y-2 text-xs">
                {project.startedAt && (
                  <div className="flex justify-between">
                    <span className="text-[var(--text-tertiary)]">Started</span>
                    <span className="text-[var(--text)]">{format(new Date(project.startedAt), "MMM d, yyyy")}</span>
                  </div>
                )}
                {project.launchedAt && (
                  <div className="flex justify-between">
                    <span className="text-[var(--text-tertiary)]">Launched</span>
                    <span className="text-[var(--text)]">{format(new Date(project.launchedAt), "MMM d, yyyy")}</span>
                  </div>
                )}
                {project.completedAt && (
                  <div className="flex justify-between">
                    <span className="text-[var(--text-tertiary)]">Completed</span>
                    <span className="text-[var(--text)]">{format(new Date(project.completedAt), "MMM d, yyyy")}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  const tones: Record<string, string> = {
    positive: "text-[var(--emerald)]",
    gold: "text-[var(--gold)]",
    neutral: "text-[var(--text)]",
  };
  return (
    <div>
      <div className="text-[9px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
        {label}
      </div>
      <div className={`font-serif text-lg font-normal ${tones[tone || "neutral"]}`}>
        {value}
      </div>
    </div>
  );
}
