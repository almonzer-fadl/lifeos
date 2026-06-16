import { db } from "@/lib/db";
import { format } from "date-fns";
import { CreateTaskForm, TaskCard } from "@/components/modules/tasks/task-actions";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const tasks = await db.task.findMany({
    orderBy: [{ status: "asc" }, { priority: "desc" }, { dueDate: "asc" }],
    include: { project: true },
    take: 100,
  });

  const todo = tasks.filter((t: { status: string }) => t.status === "todo");
  const inProg = tasks.filter((t: { status: string }) => t.status === "in_progress");
  const done = tasks.filter((t: { status: string }) => t.status === "done");

  const priorityCls = (p: string) => ({
    urgent: "bg-[var(--rose-soft)] text-[var(--rose)] border border-[rgba(255,95,109,0.24)]",
    high: "bg-[var(--amber-soft)] text-[var(--amber)] border border-[rgba(217,154,43,0.24)]",
    medium: "bg-[var(--sky-soft)] text-[var(--sky)] border border-[rgba(115,167,216,0.24)]",
    low: "bg-[rgba(255,255,255,0.025)] text-[var(--text-tertiary)] border border-[var(--border-light)]",
  }[p] || "bg-[rgba(255,255,255,0.025)] text-[var(--text-tertiary)] border border-[var(--border-light)]");

  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in flex items-end justify-between">
        <div>
          <div className="premium-kicker">Execution Desk</div>
          <h1 className="premium-title">Tasks Command</h1>
          <p className="premium-subtitle">{todo.length} todo · {inProg.length} in progress · {done.length} done</p>
        </div>
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--text-tertiary)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </div>
      </div>

      {/* Create form */}
      <div className="premium-panel animate-fade-in">
        <CreateTaskForm />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-stagger">
        <Column title="Todo" count={todo.length} color="border-t-[var(--text-tertiary)]">
          {todo.map((t: { id: string; title: string; description: string | null; dueDate: Date | null; priority: string; status: string; completedAt: Date | null; project: { name: string } | null }) => <TaskCard key={t.id} task={t} priorityCls={priorityCls} />)}
        </Column>
        <Column title="In Progress" count={inProg.length} color="border-t-[var(--amber)]">
          {inProg.map((t: { id: string; title: string; description: string | null; dueDate: Date | null; priority: string; status: string; completedAt: Date | null; project: { name: string } | null }) => <TaskCard key={t.id} task={t} priorityCls={priorityCls} active />)}
        </Column>
        <Column title="Done" count={done.length} color="border-t-[var(--emerald)]">
          {done.slice(0, 15).map((t: { id: string; title: string; completedAt: Date | null }) => (
            <div key={t.id} className="premium-row text-sm text-[var(--text-tertiary)] line-through">
              {t.title}
              {t.completedAt && <span className="text-[10px] text-[var(--text-tertiary)] ml-1.5">{format(new Date(t.completedAt), "MMM d")}</span>}
            </div>
          ))}
        </Column>
      </div>
    </div>
  );
}

function Column({ title, count, color, children }: { title: string; count: number; color: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-lg bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-card)] border-t-[3px] ${color} overflow-hidden`}>
      <div className="px-5 py-3 border-b border-[var(--border-light)]">
        <h2 className="premium-label">{title} ({count})</h2>
      </div>
      <div className="p-3 space-y-2">
        {count === 0 && <div className="premium-empty">No tasks</div>}
        {children}
      </div>
    </div>
  );
}
