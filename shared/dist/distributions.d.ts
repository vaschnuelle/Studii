import type { SessionRecord } from "./types";
/**
 * Builds last-30-day hour (0-23) and weekday (Mon-Sun) hour totals from sessions.
 * Sessions outside [now - 30d, now] are ignored.
 */
export declare function buildLast30dDistributions(sessions: SessionRecord[], nowMs?: number): {
    hour: number[];
    weekday: number[];
};
/**
 * Total study hours in the last 30 days from sessions.
 */
export declare function totalHoursLast30d(sessions: SessionRecord[], nowMs?: number): number;
/**
 * Index of maximum element; ties pick the smallest index.
 */
export declare function argMax(values: number[]): number;
/**
 * Derives power hour (0-23) and power day (0-6 Mon-Sun) from distributions.
 */
export declare function powerHourAndDay(hour: number[], weekday: number[]): {
    powerHour: number;
    powerDay: number;
};
/**
 * Median session length in minutes from sessions in window.
 */
export declare function medianSessionMinutes(sessions: SessionRecord[], nowMs?: number): number;
//# sourceMappingURL=distributions.d.ts.map