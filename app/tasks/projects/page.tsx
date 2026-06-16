import { db } from "@/lib/db";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const tasks = await db.task.findMany({ orderBy: { createdAt: "desc" }, include: { project: true } });
  const grouped: Record<string, typeof tasks> = {};
  tasks.forEach((t) => {
    const key = t.project?.name || "No Project";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(t);
  });

  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in"><div className="premium-kicker">Workspaces</div><h1 className="premium-title">Projects</h1><p className="premium-subtitle">{Object.keys(grouped).length} groups · {tasks.length} tasks</p></div>
      {Object.keys(grouped).length === 0 ? (
        <section className="premium-panel animate-fade-in"><p className="py-10 text-center text-sm text-[var(--text-tertiary)]">No tasks yet. Create tasks and assign them to projects.</p></section>
      ) : (
        <div className="space-y-3">
          {Object.entries(grouped).map(([name, items]) => (
            <section key={name} className="premium-panel animate-fade-in">
              <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold text-[var(--text)]">{name}</h2><span className="premium-panel-kicker">{items.length}</span></div>
              <div className="space-y-1">
                {items.map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded px-2 py-1.5 text-sm hover:bg-[var(--surface-hover)]">
                    <span className="text-[var(--text-secondary)]">{t.title}</span>
                    <span className={`text-[10px] font-semibold uppercase ${t.status === "done" ? "text-[var(--emerald)]" : t.status === "in_progress" ? "text-[var(--sky)]" : "text-[var(--amber)]"}`}>{t.status.replace("_", " ")}</span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
