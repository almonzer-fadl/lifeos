"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface PR {
  id: string;
  activityType: string;
  metric: string;
  value: number;
  unit: string;
  formatted: string;
  achievedAt: string;
}

interface Race {
  id: string;
  name: string;
  raceType: string;
  date: string;
  daysUntil: number;
  status: string;
  targetTime: number | null;
}

export function PRBoard() {
  const [prs, setPrs] = useState<PR[]>([]);
  useEffect(() => {
    fetch("/api/health/activity/prs")
      .then((r) => r.json()).then((d) => { if (Array.isArray(d)) setPrs(d); }).catch(() => {});
  }, []);
  if (prs.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {prs.map((pr) => (
        <div key={pr.id} className="premium-stat">
          <div className="premium-label text-[var(--accent)]">{pr.activityType.replace("_", " ")}</div>
          <div className="text-lg font-bold font-mono text-[var(--text)] mt-1">{pr.formatted}</div>
          <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5">PR</div>
        </div>
      ))}
    </div>
  );
}

export function RaceCountdown() {
  const [races, setRaces] = useState<Race[]>([]);
  useEffect(() => {
    fetch("/api/health/activity/races?status=upcoming")
      .then((r) => r.json()).then((d) => { if (Array.isArray(d)) setRaces(d.slice(0, 2)); }).catch(() => {});
  }, []);
  if (races.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {races.map((race) => (
        <Link key={race.id} href="/activity" className="premium-stat block">
          <div className="premium-label text-[var(--accent)]">Upcoming Race</div>
          <div className="text-sm font-semibold text-[var(--text)] mt-1">{race.name}</div>
          <div className="text-lg font-bold font-mono text-[var(--sky)] mt-1">{race.daysUntil} days</div>
          <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5">{race.raceType.replace("_", " ")}</div>
        </Link>
      ))}
    </div>
  );
}
