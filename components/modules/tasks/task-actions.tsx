"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ConfirmSheet } from "@/components/ui/confirm-sheet";
import { toast } from "@/lib/toast";

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
    try {
      const res = await fetch("/api/productivity/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, priority }),
      });
      if (!res.ok) throw new Error();
      toast.success("Task created");
      setTitle("");
      router.refresh();
    } catch {
      toast.error("Failed to create task");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto]">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New task..."
        className="min-w-0"
        required
      />
      <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full sm:w-28">
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="urgent">Urgent</option>
      </select>
      <button
        type="submit"
        disabled={saving || !title.trim()}
        className="rounded-lg border border-[rgba(220,193,122,0.34)] bg-[var(--accent-soft)] px-4 py-2 text-sm font-semibold text-[var(--accent)] transition-all hover:bg-[rgba(220,193,122,0.2)] disabled:opacity-40 active:scale-[0.97]"
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
    try {
      const res = await fetch("/api/productivity/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id, status: next }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      toast.error("Failed to move task");
    } finally {
      setBusy(false);
    }
  }

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  async function deleteTask() {
    setBusy(true);
    try {
      const res = await fetch(`/api/productivity/tasks?id=${task.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Task deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete task");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
    <div
      className={`group rounded-lg border p-3 transition-colors ${
        active ? "border-[rgba(217,154,43,0.28)] bg-[var(--amber-soft)]" : "border-[var(--border-light)] bg-[rgba(255,255,255,0.025)] hover:bg-[var(--surface-hover)]"
      } ${busy ? "opacity-50" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-[var(--text)]">{task.title}</div>
          {task.description && (
            <div className="text-xs text-[var(--text-tertiary)] mt-1 line-clamp-2">{task.description}</div>
          )}
          <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
            {task.dueDate && (
              <span className="premium-chip">
                {format(new Date(task.dueDate), "MMM d")}
              </span>
            )}
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${priorityCls(task.priority)}`}>
              {task.priority}
            </span>
            {task.project && <span className="text-[10px] text-[var(--text-tertiary)]">{task.project.name}</span>}
          </div>
        </div>

        {/* Actions — visible on hover */}
        <div className="flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
          {NEXT_STATUS[task.status] && (
            <button
              onClick={moveTask}
              disabled={busy}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[10px] font-semibold text-[var(--text-tertiary)] transition-colors hover:border-[rgba(220,193,122,0.38)] hover:text-[var(--accent)]"
              title={STATUS_LABEL[task.status]}
            >
              {STATUS_LABEL[task.status]}
            </button>
          )}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={busy}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[10px] font-semibold text-[var(--text-tertiary)] transition-colors hover:border-[rgba(255,95,109,0.38)] hover:text-[var(--rose)]"
            title="Delete"
          >
            Del
          </button>
        </div>
      </div>
    </div>
    <ConfirmSheet
      open={showDeleteConfirm}
      onOpenChange={setShowDeleteConfirm}
      title="Delete this task?"
      description="This task will be permanently removed."
      confirmLabel="Delete"
      destructive
      onConfirm={deleteTask}
    />
    </>
  );
}
