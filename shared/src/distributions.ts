import type { SessionRecord } from "./types";

const MS_PER_HOUR = 3600000;

/**
 * Weekday 0 = Monday … 6 = Sunday (matches data model `powerDay`).
 */
function weekdayMonSunZero(localDate: Date): number {
  const js = localDate.getDay(); // 0 Sun … 6 Sat
  return js === 0 ? 6 : js - 1;
}

/**
 * Builds last-30-day hour (0-23) and weekday (Mon-Sun) hour totals from sessions.
 * Sessions outside [now - 30d, now] are ignored.
 */
export function buildLast30dDistributions(
  sessions: SessionRecord[],
  nowMs: number = Date.now()
): { hour: number[]; weekday: number[] } {
  const hour = Array.from({ length: 24 }, () => 0);
  const weekday = Array.from({ length: 7 }, () => 0);
  const cutoff = nowMs - 30 * 24 * MS_PER_HOUR;

  for (const s of sessions) {
    if (s.endTs <= cutoff || s.startTs >= nowMs) continue;
    const clippedStart = Math.max(s.startTs, cutoff);
    const clippedEnd = Math.min(s.endTs, nowMs);
    if (clippedEnd <= clippedStart) continue;

    const durationHours = (clippedEnd - clippedStart) / MS_PER_HOUR;

    // Attribute bulk to start hour for heatmap (simple deterministic rule).
    const start = new Date(clippedStart);
    const h = start.getHours();
    hour[h] += durationHours;

    const dayKey = weekdayMonSunZero(start);
    weekday[dayKey] += durationHours;
  }

  return { hour, weekday };
}

/**
 * Total study hours in the last 30 days from sessions.
 */
export function totalHoursLast30d(sessions: SessionRecord[], nowMs: number = Date.now()): number {
  const cutoff = nowMs - 30 * 24 * MS_PER_HOUR;
  let sum = 0;
  for (const s of sessions) {
    if (s.endTs <= cutoff || s.startTs >= nowMs) continue;
    const clippedStart = Math.max(s.startTs, cutoff);
    const clippedEnd = Math.min(s.endTs, nowMs);
    if (clippedEnd > clippedStart) {
      sum += (clippedEnd - clippedStart) / MS_PER_HOUR;
    }
  }
  return sum;
}

/**
 * Index of maximum element; ties pick the smallest index.
 */
export function argMax(values: number[]): number {
  let best = 0;
  for (let i = 1; i < values.length; i++) {
    if (values[i] > values[best]) best = i;
  }
  return best;
}

/**
 * Derives power hour (0-23) and power day (0-6 Mon-Sun) from distributions.
 */
export function powerHourAndDay(hour: number[], weekday: number[]): {
  powerHour: number;
  powerDay: number;
} {
  return {
    powerHour: argMax(hour),
    powerDay: argMax(weekday),
  };
}

/**
 * Median session length in minutes from sessions in window.
 */
export function medianSessionMinutes(
  sessions: SessionRecord[],
  nowMs: number = Date.now()
): number {
  const cutoff = nowMs - 30 * 24 * MS_PER_HOUR;
  const lengths: number[] = [];
  for (const s of sessions) {
    if (s.endTs <= cutoff || s.startTs >= nowMs) continue;
    const clippedStart = Math.max(s.startTs, cutoff);
    const clippedEnd = Math.min(s.endTs, nowMs);
    if (clippedEnd > clippedStart) {
      lengths.push((clippedEnd - clippedStart) / 60000);
    }
  }
  if (lengths.length === 0) return 0;
  lengths.sort((a, b) => a - b);
  const mid = Math.floor(lengths.length / 2);
  return lengths.length % 2 === 0
    ? (lengths[mid - 1]! + lengths[mid]!) / 2
    : lengths[mid]!;
}
