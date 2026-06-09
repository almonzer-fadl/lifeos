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

  const todo = tasks.filter(t => t.status === "todo");
  const inProg = tasks.filter(t => t.status === "in_progress");
  const done = tasks.filter(t => t.status === "done");

  const priorityCls = (p: string) => ({
    urgent: "bg-rose-100 text-rose-700", high: "bg-amber-100 text-amber-700",
    medium: "bg-sky-100 text-sky-700", low: "bg-stone-100 text-stone-500",
  }[p] || "bg-stone-100 text-stone-500");

  return (
    <div className="p-5 lg:p-8 space-y-5">
      <div className="animate-fade-in flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">Tasks</h1>
          <p className="text-sm text-stone-500 mt-0.5">{todo.length} todo · {inProg.length} in progress · {done.length} done</p>
        </div>
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-stone-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </div>
      </div>

      {/* Create form */}
      <div className="rounded-2xl bg-white border border-[var(--border)] shadow-[var(--shadow-card)] p-4 animate-fade-in">
        <CreateTaskForm />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-stagger">
        <Column title="Todo" count={todo.length} color="border-t-stone-400">
          {todo.map(t => <TaskCard key={t.id} task={t} priorityCls={priorityCls} />)}
        </Column>
        <Column title="In Progress" count={inProg.length} color="border-t-amber-500">
          {inProg.map(t => <TaskCard key={t.id} task={t} priorityCls={priorityCls} active />)}
        </Column>
        <Column title="Done" count={done.length} color="border-t-emerald-500">
          {done.slice(0, 15).map(t => (
            <div key={t.id} className="p-3 rounded-xl bg-stone-50 border border-[var(--border-light)] text-sm text-stone-400 line-through">
              {t.title}
              {t.completedAt && <span className="text-[10px] text-stone-300 ml-1.5">{format(new Date(t.completedAt), "MMM d")}</span>}
            </div>
          ))}
        </Column>
      </div>
    </div>
  );
}

function Column({ title, count, color, children }: { title: string; count: number; color: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-2xl bg-white border border-[var(--border)] shadow-[var(--shadow-card)] border-t-[3px] ${color} overflow-hidden`}>
      <div className="px-5 py-3 border-b border-[var(--border-light)]">
        <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">{title} ({count})</h2>
      </div>
      <div className="p-3 space-y-2">
        {count === 0 && <div className="py-6 text-center text-sm text-stone-300">No tasks</div>}
        {children}
      </div>
    </div>
  );
}
