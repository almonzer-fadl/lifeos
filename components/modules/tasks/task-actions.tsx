"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

type Task = {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  priority: string;
  status: string;
  completedAt: Date | null;
  project: { name: string } | null;
};

const NEXT_STATUS: Record<string, string> = {
  todo: "in_progress",
  in_progress: "done",
};

const STATUS_LABEL: Record<string, string> = {
  todo: "Start",
  in_progress: "Complete",
};

export function CreateTaskForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    await fetch("/api/productivity/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, priority }),
    });
    setTitle("");
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New task..."
        className="flex-1"
        required
      />
      <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-24">
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="urgent">Urgent</option>
      </select>
      <button
        type="submit"
        disabled={saving || !title.trim()}
        className="px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 disabled:opacity-40 transition-all active:scale-[0.97] shadow-sm"
      >
        Add
      </button>
    </form>
  );
}

export function TaskCard({
  task,
  priorityCls,
  active,
}: {
  task: Task;
  priorityCls: (p: string) => string;
  active?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function moveTask() {
    const next = NEXT_STATUS[task.status];
    if (!next) return;
    setBusy(true);
    await fetch("/api/productivity/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: task.id, status: next }),
    });
    setBusy(false);
    router.refresh();
  }

  async function deleteTask() {
    if (!confirm("Delete this task?")) return;
    setBusy(true);
    await fetch(`/api/productivity/tasks?id=${task.id}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  return (
    <div
      className={`group p-3 rounded-xl border transition-colors ${
        active ? "bg-amber-50/50 border-amber-200" : "bg-stone-50 border-[var(--border-light)] hover:bg-stone-100/50"
      } ${busy ? "opacity-50" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-stone-700">{task.title}</div>
          {task.description && (
            <div className="text-xs text-stone-400 mt-1 line-clamp-2">{task.description}</div>
          )}
          <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
            {task.dueDate && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-white border border-[var(--border-light)] text-stone-500">
                {format(new Date(task.dueDate), "MMM d")}
              </span>
            )}
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${priorityCls(task.priority)}`}>
              {task.priority}
            </span>
            {task.project && <span className="text-[10px] text-stone-400">{task.project.name}</span>}
          </div>
        </div>

        {/* Actions — visible on hover */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {NEXT_STATUS[task.status] && (
            <button
              onClick={moveTask}
              disabled={busy}
              className="px-2 py-1 text-[10px] font-semibold rounded-lg bg-white border border-[var(--border)] text-stone-500 hover:text-teal-600 hover:border-teal-300 transition-colors"
              title={STATUS_LABEL[task.status]}
            >
              {STATUS_LABEL[task.status]}
            </button>
          )}
          <button
            onClick={deleteTask}
            disabled={busy}
            className="px-2 py-1 text-[10px] font-semibold rounded-lg bg-white border border-[var(--border)] text-stone-500 hover:text-rose-600 hover:border-rose-300 transition-colors"
            title="Delete"
          >
            Del
          </button>
        </div>
      </div>
    </div>
  );
}
