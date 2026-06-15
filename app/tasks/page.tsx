import { db } from "@/lib/db";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const [tasks] = await Promise.all([
    db.task.findMany({
      orderBy: [{ status: "asc" }, { priority: "desc" }, { dueDate: "asc" }],
      include: { project: true },
      take: 100,
    }),
  ]);

  const todo = tasks.filter((t) => t.status === "todo");
  const inProgress = tasks.filter((t) => t.status === "in_progress");
  const done = tasks.filter((t) => t.status === "done");

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
        <p className="text-zinc-500 text-sm mt-1">
          {todo.length} todo · {inProgress.length} in progress · {done.length} done
        </p>
      </div>

      {/* Task columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Todo */}
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            Todo ({todo.length})
          </h2>
          <div className="space-y-2">
            {todo.length === 0 && (
              <div className="text-zinc-600 text-sm py-4 text-center">Nothing to do</div>
            )}
            {todo.map((t) => (
              <div key={t.id} className="p-3 rounded-lg bg-zinc-800/30 border border-zinc-800/50">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{t.title}</div>
                    {t.description && (
                      <div className="text-xs text-zinc-500 mt-0.5 line-clamp-2">
                        {t.description}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      {t.dueDate && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                          {format(new Date(t.dueDate), "MMM d")}
                        </span>
                      )}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        t.priority === "urgent" ? "bg-red-900/50 text-red-400" :
                        t.priority === "high" ? "bg-orange-900/50 text-orange-400" :
                        t.priority === "medium" ? "bg-blue-900/50 text-blue-400" :
                        "bg-zinc-800 text-zinc-400"
                      }`}>
                        {t.priority}
                      </span>
                      {t.project && (
                        <span className="text-[10px] text-zinc-500">
                          {t.project.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="text-zinc-600 hover:text-green-400 text-lg" title="Mark done">
                      ○
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* In Progress */}
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
          <h2 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider mb-3">
            In Progress ({inProgress.length})
          </h2>
          <div className="space-y-2">
            {inProgress.length === 0 && (
              <div className="text-zinc-600 text-sm py-4 text-center">Nothing in progress</div>
            )}
            {inProgress.map((t) => (
              <div key={t.id} className="p-3 rounded-lg bg-yellow-900/10 border border-yellow-800/30">
                <div className="text-sm font-medium">{t.title}</div>
                {t.description && (
                  <div className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{t.description}</div>
                )}
                <div className="flex items-center gap-2 mt-2">
                  {t.dueDate && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                      {format(new Date(t.dueDate), "MMM d")}
                    </span>
                  )}
                  {t.project && (
                    <span className="text-[10px] text-zinc-500">{t.project.name}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Done */}
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
          <h2 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-3">
            Done ({done.length})
          </h2>
          <div className="space-y-2">
            {done.length === 0 && (
              <div className="text-zinc-600 text-sm py-4 text-center">Nothing completed yet</div>
            )}
            {done.slice(0, 15).map((t) => (
              <div key={t.id} className="p-2 rounded-lg bg-zinc-800/20 text-sm text-zinc-400 line-through">
                {t.title}
                {t.completedAt && (
                  <span className="text-[10px] text-zinc-600 ml-2">
                    {format(new Date(t.completedAt), "MMM d")}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
