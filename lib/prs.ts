// ─── Personal Record Detection ─────────────────────────────────

interface ActivityLike {
  type: string;
  distance: number | null;
  startTime: Date | string;
  endTime: Date | string | null;
  id?: string;
}

export function detectPR(
  activity: ActivityLike,
  existingRecord: { value: number } | null
): { isPR: boolean; newValue: number; metric: "time" | "distance" | null } | null {
  const startMs = typeof activity.startTime === "string" ? new Date(activity.startTime).getTime() : activity.startTime.getTime();

  // For time-based activities: run, swim, bike, walk, hike
  if (["run", "swim", "bike", "walk", "hike"].includes(activity.type)) {
    if (!activity.endTime) return null;
    const endMs = typeof activity.endTime === "string" ? new Date(activity.endTime).getTime() : activity.endTime.getTime();
    const durationSec = (endMs - startMs) / 1000;
    if (durationSec <= 0) return null;

    if (!existingRecord || durationSec < existingRecord.value) {
      return { isPR: true, newValue: durationSec, metric: "time" };
    }
    return null;
  }

  // For non-timed activities: distance is the metric
  if (activity.distance && activity.distance > 0) {
    if (!existingRecord || activity.distance > existingRecord.value) {
      return { isPR: true, newValue: activity.distance, metric: "distance" };
    }
  }

  return null;
}

export function formatPR(
  value: number,
  metric: string,
  unit: string
): string {
  if (metric === "time" && unit === "seconds") {
    const h = Math.floor(value / 3600);
    const m = Math.floor((value % 3600) / 60);
    const s = Math.floor(value % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    if (m > 0) return `${m}:${String(s).padStart(2, "0")}`;
    return `${s}s`;
  }
  if (metric === "distance" && unit === "meters") {
    if (value >= 1000) return `${(value / 1000).toFixed(2)} km`;
    return `${Math.round(value)}m`;
  }
  if (metric === "reps") return `${value} reps`;
  if (metric === "weight") return `${value} kg`;
  return `${value} ${unit}`;
}
