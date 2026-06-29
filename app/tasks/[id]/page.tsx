import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { DeleteButton } from "@/components/ui/delete-button";

export const dynamic = "force-dynamic";

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = await db.task.findUnique({ where: { id }, include: { project: true } });
  if (!task) notFound();

  return (
    <div className="premium-page animate-fade-in">
      <div className="premium-header animate-fade-in">
        <div className="flex items-center gap-2"><Link href="/tasks" className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg></Link><div className="premium-kicker capitalize">{task.status.replace("_", " ")}</div></div>
        <h1 className="premium-title">{task.title}</h1>
        <p className="premium-subtitle">{format(new Date(task.createdAt), "MMM d, yyyy")}</p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="premium-stat"><div className="premium-label">Priority</div><div className="premium-value text-sm capitalize">{task.priority}</div></div>
        <div className="premium-stat"><div className="premium-label">Status</div><div className="premium-value text-sm capitalize">{task.status.replace("_", " ")}</div></div>
        {task.dueDate && <div className="premium-stat"><div className="premium-label">Due</div><div className="premium-value text-lg">{format(new Date(task.dueDate), "MMM d")}</div></div>}
        {task.project && <div className="premium-stat"><div className="premium-label">Project</div><div className="premium-value text-sm">{task.project.name}</div></div>}
      </div>
      {task.description && <section className="premium-panel animate-fade-in"><h2 className="premium-panel-title mb-2">Description</h2><p className="text-sm text-[var(--text-secondary)]">{task.description}</p></section>}
      <div className="flex justify-end"><DeleteButton url={`/api/productivity/tasks?id=${task.id}`} itemName="task" /></div>
    </div>
  );
}
