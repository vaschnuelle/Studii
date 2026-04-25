/**
 * Cached analytics on users/{userId} per Phase 2 data model.
 */
export interface UserStats {
    last30dHourDistribution: number[];
    last30dDayDistribution: number[];
    friendOverlapCache: Record<string, number>;
    personality: PersonalityArchetype;
}
/**
 * Six archetypes from the Phase 2 PRD (deterministic label strings).
 */
export type PersonalityArchetype = "Sprinter" | "Marathoner" | "Night Owl" | "Early Riser" | "Social Learner" | "Solo Grinder";
/**
 * Minimal session shape Phase 2 reads from Firestore `sessions`.
 */
export interface SessionRecord {
    startTs: number;
    endTs: number;
    isPomodoro?: boolean;
    pomodoroCycles?: number;
    visibility?: string;
}
/**
 * Precomputed Wrapped document: wrappedSummaries/{userId}/{periodId}
 */
export interface WrappedSummaryRecord {
    periodId: string;
    personality: PersonalityArchetype;
    topBuddy: string | null;
    topBuddyOverlapHours: number;
    powerHour: number;
    powerDay: number;
    longestSessionMin: number;
    mostPomodorosDay: number;
    streak: number;
    totalHours: number;
    shareCardUrl: string | null;
    generatedAt: Date;
}
/**
 * Inputs for personality classification (all derived deterministically from sessions + overlap).
 */
export interface PersonalityInputs {
    /** Median session length in minutes. */
    medianSessionMin: number;
    /** Hour 0-23 with the most study hours (last 30d). */
    peakHour: number;
    /** Sum of overlap hours / max possible heuristic, 0-1. */
    normalizedFriendOverlap: number;
    /** Completed pomodoro cycles / sessions that were pomodoro, 0-1. */
    pomodoroCompletionRate: number;
}
/**
 * Extended “biggest wins” used in UI (server can store subset on wrapped doc).
 */
export interface BiggestWinsResult {
    longestSessionMin: number;
    mostPomodorosInDay: number;
    longestStreakDays: number;
    mostConsistentWeekLabel: string;
    mostImprovedMonthPercent: number | null;
}
//# sourceMappingURL=types.d.ts.map