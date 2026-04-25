import type { SessionRecord } from "./types";
/**
 * Total overlap hours between the current user's sessions and a friend's sessions
 * in the rolling last-30-day window. Deterministic: clip each session to window.
 */
export declare function computeOverlapHours(mySessions: SessionRecord[], friendSessions: SessionRecord[], nowMs?: number): number;
/**
 * Builds friendOverlapCache map: friendId -> overlap hours.
 */
export declare function buildFriendOverlapCache(mySessions: SessionRecord[], friendSessionsById: Record<string, SessionRecord[]>, nowMs?: number): Record<string, number>;
/**
 * Alignment score 0-100 from overlap hours (saturating curve).
 */
export declare function alignmentScoreFromOverlapHours(overlapHours: number): number;
//# sourceMappingURL=overlap.d.ts.map