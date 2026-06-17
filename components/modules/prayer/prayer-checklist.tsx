"use client";

import { useEffect, useState } from "react";

interface PrayerTime {
  fajr: string; dhuhr: string; asr: string; maghrib: string; isha: string;
}

interface PrayerLogEntry {
  prayer: string; status: string; scheduledAt: string;
}

interface QuranStats {
  pagesMemorized: number; totalPages: number; percentage: number;
  pagesThisWeek: number; streak: number; targetDate: string | null;
}

export function PrayerChecklist() {
  const [times, setTimes] = useState<PrayerTime | null>(null);
  const [logs, setLogs] = useState<PrayerLogEntry[]>([]);
  const [quran, setQuran] = useState<QuranStats | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/prayer/times").then((r) => r.json()),
      fetch("/api/prayer/log").then((r) => r.json()),
      fetch("/api/quran/stats").then((r) => r.json()),
    ]).then(([t, l, q]) => {
      setTimes(t);
      if (Array.isArray(l)) setLogs(l);
      setQuran(q);
    }).catch(() => {});
  }, []);

  const logPrayer = async (prayer: string, scheduledAt: string) => {
    await fetch("/api/prayer/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prayer, scheduledAt, status: "on_time" }),
    });
    const res = await fetch("/api/prayer/log");
    setLogs(await res.json());
  };

  const logStatus = (prayer: string): string => {
    const log = logs.find((l) => l.prayer === prayer);
    if (!log) return "○";
    if (log.status === "on_time") return "✓";
    if (log.status === "late") return "⏰";
    if (log.status === "missed") return "✗";
    return "○";
  };

  const prayers = times ? [
    { name: "Fajr", time: times.fajr, key: "fajr" },
    { name: "Dhuhr", time: times.dhuhr, key: "dhuhr" },
    { name: "Asr", time: times.asr, key: "asr" },
    { name: "Maghrib", time: times.maghrib, key: "maghrib" },
    { name: "Isha", time: times.isha, key: "isha" },
  ] : [];

  const doneCount = prayers.filter((p) => logStatus(p.key) === "✓" || logStatus(p.key) === "⏰").length;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="premium-stat">
          <div className="premium-label">Prayers Today</div>
          <div className={`text-lg font-bold font-mono mt-1 ${doneCount === 5 ? "text-[var(--emerald)]" : "text-[var(--amber)]"}`}>{doneCount}/5</div>
        </div>
        <div className="premium-stat">
          <div className="premium-label">Quran Memorized</div>
          <div className="text-lg font-bold font-mono mt-1 text-[var(--accent)]">{quran?.pagesMemorized || 0}/{quran?.totalPages || 604}</div>
          <div className="text-[10px] text-[var(--text-tertiary)]">{quran?.percentage || 0}% · {quran?.streak || 0}d streak</div>
        </div>
      </div>

      <div className="premium-panel">
        <div className="mb-2 text-sm font-semibold text-[var(--text)]">Today&apos;s Prayers</div>
        <div className="space-y-2">
          {prayers.map((p) => (
            <div key={p.key} className="flex items-center justify-between rounded-lg px-3 py-2 bg-[var(--surface)] border border-[var(--border-light)]">
              <div>
                <div className="text-sm text-[var(--text)]">{p.name}</div>
                <div className="text-[10px] text-[var(--text-tertiary)]">{new Date(p.time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</div>
              </div>
              <button
                onClick={() => logPrayer(p.key, p.time)}
                className={`text-sm font-bold ${logStatus(p.key) === "✓" ? "text-[var(--emerald)]" : logStatus(p.key) === "⏰" ? "text-[var(--amber)]" : "text-[var(--text-tertiary)] hover:text-[var(--accent)]"}`}
              >
                {logStatus(p.key)}
              </button>
            </div>
          ))}
        </div>
      </div>

      {quran && (
        <div className="premium-panel">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-[var(--text)]">Quran Progress</div>
            <span className="text-[10px] text-[var(--text-tertiary)]">{quran.pagesThisWeek} pages this week</span>
          </div>
          <div className="h-2 rounded-full bg-[var(--border-light)] overflow-hidden">
            <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${quran.percentage}%` }} />
          </div>
          <div className="text-[10px] text-[var(--text-tertiary)] mt-1">
            Target: full Quran by {quran.targetDate ? new Date(quran.targetDate).getFullYear() : "2030"}
          </div>
        </div>
      )}
    </div>
  );
}
