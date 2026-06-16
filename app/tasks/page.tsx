import { db } from "@/lib/db";
import { TaskCard } from "@/components/modules/tasks/task-actions";

export const dynamic = "force-dynamic";

function priorityCls(p: string) {
  const map: Record<string, string> = { urgent: "text-[var(--rose)] bg-[var(--rose-soft)]", high: "text-[var(--amber)] bg-[var(--amber-soft)]", medium: "text-[var(--sky)] bg-[var(--sky-soft)]", low: "text-[var(--text-tertiary)] bg-[rgba(255,255,255,0.04)]" };
  return map[p] || map.medium;
}

export default async function TasksPage() {
  const tasks = await db.task.findMany({ orderBy: [{ status: "asc" }, { createdAt: "desc" }], include: { project: true } });
  const todo = tasks.filter((t) => t.status === "todo");
  const inProgress = tasks.filter((t) => t.status === "in_progress");
  const done = tasks.filter((t) => t.status === "done");

  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in">
        <div className="premium-kicker">Task Command</div>
        <h1 className="premium-title">Tasks</h1>
        <p className="premium-subtitle">{todo.length} todo · {inProgress.length} in progress · {done.length} done</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Column title="Todo" color="border-t-[var(--amber)]" count={todo.length}>
          {todo.map((t) => <TaskCard key={t.id} task={t as any} priorityCls={priorityCls} />)}
        </Column>
        <Column title="In Progress" color="border-t-[var(--sky)]" count={inProgress.length}>
          {inProgress.map((t) => <TaskCard key={t.id} task={t as any} priorityCls={priorityCls} />)}
        </Column>
        <Column title="Done" color="border-t-[var(--emerald)]" count={done.length}>
          {done.slice(0, 10).map((t) => <TaskCard key={t.id} task={t as any} priorityCls={priorityCls} />)}
        </Column>
      </div>
    </div>
  );
}

function Column({ title, color, count, children }: { title: string; color: string; count: number; children: React.ReactNode }) {
  return (
    <section className={`rounded-lg bg-[var(--surface)] border ${color} border-[var(--border)] shadow-[var(--shadow-card)] overflow-hidden`}>
      <div className="px-3 py-2.5 border-b border-[var(--border-light)] flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--text)]">{title}</h2>
        <span className="rounded border border-[var(--border-light)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-tertiary)]">{count}</span>
      </div>
      <div className="p-2 space-y-2 min-h-[100px]">{children}</div>
    </section>
  );
}
