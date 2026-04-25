import type { PersonalityInputs, SessionRecord, UserStats, WrappedSummaryRecord } from "./types";
/**
 * Derives personality inputs from sessions and overlap cache (deterministic).
 */
export declare function buildPersonalityInputs(sessions: SessionRecord[], friendOverlapCache: Record<string, number>, nowMs?: number): PersonalityInputs;
/**
 * Full cached `users.stats` object for Firestore.
 */
export declare function buildUserStats(mySessions: SessionRecord[], friendSessionsById: Record<string, SessionRecord[]>, nowMs?: number): UserStats;
/**
 * ISO week id like 2026-W12 (Monday-based week, minimal implementation).
 */
export declare function weekPeriodId(d?: Date): string;
/**
 * Builds a wrapped summary row for `wrappedSummaries/{userId}/{periodId}`.
 */
export declare function buildWrappedSummary(mySessions: SessionRecord[], friendSessionsById: Record<string, SessionRecord[]>, periodId?: string, nowMs?: number): WrappedSummaryRecord;
//# sourceMappingURL=aggregate.d.ts.map