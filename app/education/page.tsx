"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Course {
  id: string; code: string; name: string; credits: number;
  currentGrade: number | null; targetGrade: string | null;
  _count: { assignments: number; exams: number };
}

interface Deadline {
  id: string; title: string; dueDate: string; courseCode: string; courseName: string;
  weight: number | null; status: string;
}

interface LangStat {
  language: string; currentLevel: string; targetLevel: string;
  totalMinutes: number; totalSessions: number; streakDays: number;
}

export default function EducationPage() {
  const [dashboard, setDashboard] = useState<{ courses: Course[]; currentGPA: number | null; currentCGPA: number | null; upcomingDeadlines: Deadline[] } | null>(null);
  const [langStats, setLangStats] = useState<LangStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/education/dashboard").then((r) => r.json()),
      fetch("/api/education/languages/stats").then((r) => r.json()),
    ]).then(([d, l]) => {
      setDashboard(d);
      if (Array.isArray(l)) setLangStats(l);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="premium-page"><div className="skeleton h-32 w-full rounded-lg" /></div>;

  return (
    <div className="premium-page animate-fade-in">
      <div className="premium-header">
        <div className="premium-kicker">Academic Command</div>
        <h1 className="premium-title">Education</h1>
        <p className="premium-subtitle">University of Malaya · Information Systems</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="premium-stat">
          <div className="premium-label">GPA</div>
          <div className="text-lg font-bold font-mono mt-1 text-[var(--accent)]">{dashboard?.currentGPA?.toFixed(2) || "--"}</div>
          <div className="text-[10px] text-[var(--text-tertiary)]">Current Semester</div>
        </div>
        <div className="premium-stat">
          <div className="premium-label">CGPA</div>
          <div className="text-lg font-bold font-mono mt-1 text-[var(--sky)]">{dashboard?.currentCGPA?.toFixed(2) || "--"}</div>
          <div className="text-[10px] text-[var(--text-tertiary)]">Cumulative</div>
        </div>
      </div>

      {dashboard?.upcomingDeadlines && dashboard.upcomingDeadlines.length > 0 && (
        <div className="premium-panel">
          <div className="mb-2 text-sm font-semibold text-[var(--text)]">Upcoming Deadlines</div>
          <div className="space-y-1">
            {dashboard.upcomingDeadlines.map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-lg px-3 py-2 bg-[var(--surface)] border border-[var(--border-light)]">
                <div className="min-w-0">
                  <div className="text-sm text-[var(--text)] truncate">{d.title}</div>
                  <div className="text-[10px] text-[var(--text-tertiary)]">{d.courseCode} · {d.weight ? `${d.weight}%` : ""}</div>
                </div>
                <span className="text-xs text-[var(--amber)] shrink-0 ml-2">{new Date(d.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {dashboard?.courses && dashboard.courses.length > 0 && (
        <div className="premium-panel">
          <div className="mb-2 text-sm font-semibold text-[var(--text)]">Courses</div>
          <div className="space-y-1">
            {dashboard.courses.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg px-3 py-2 bg-[var(--surface)] border border-[var(--border-light)]">
                <div className="min-w-0">
                  <div className="text-sm text-[var(--text)]">{c.code}: {c.name}</div>
                  <div className="text-[10px] text-[var(--text-tertiary)]">{c.credits} credits · {c._count.assignments} assignments · {c._count.exams} exams</div>
                </div>
                {c.currentGrade != null && (
                  <span className={`text-xs font-mono font-bold ${(c.currentGrade) >= 80 ? "text-[var(--emerald)]" : c.currentGrade >= 60 ? "text-[var(--amber)]" : "text-[var(--rose)]"}`}>{c.currentGrade}%</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {langStats.length > 0 && (
        <div className="premium-panel">
          <div className="mb-2 text-sm font-semibold text-[var(--text)]">Languages</div>
          <div className="space-y-1">
            {langStats.map((l) => (
              <div key={l.language} className="flex items-center justify-between rounded-lg px-3 py-2 bg-[var(--surface)] border border-[var(--border-light)]">
                <div>
                  <div className="text-sm text-[var(--text)] capitalize">{l.language}</div>
                  <div className="text-[10px] text-[var(--text-tertiary)]">{l.currentLevel} → {l.targetLevel}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[var(--sky)]">{Math.round(l.totalMinutes / 60)}h</div>
                  <div className="text-[10px] text-[var(--text-tertiary)]">{l.streakDays}d streak</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Link href="/tasks" className="premium-action text-xs text-center block">View All Tasks →</Link>
    </div>
  );
}
