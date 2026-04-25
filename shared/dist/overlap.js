"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeOverlapHours = computeOverlapHours;
exports.buildFriendOverlapCache = buildFriendOverlapCache;
exports.alignmentScoreFromOverlapHours = alignmentScoreFromOverlapHours;
const MS_PER_HOUR = 3600000;
/**
 * Computes overlapping duration (ms) between two intervals.
 */
function overlapMs(aStart, aEnd, bStart, bEnd) {
    const start = Math.max(aStart, bStart);
    const end = Math.min(aEnd, bEnd);
    return end > start ? end - start : 0;
}
/**
 * Total overlap hours between the current user's sessions and a friend's sessions
 * in the rolling last-30-day window. Deterministic: clip each session to window.
 */
function computeOverlapHours(mySessions, friendSessions, nowMs = Date.now()) {
    const cutoff = nowMs - 30 * 24 * MS_PER_HOUR;
    let ms = 0;
    for (const mine of mySessions) {
        const m0 = Math.max(mine.startTs, cutoff);
        const m1 = Math.min(mine.endTs, nowMs);
        if (m1 <= m0)
            continue;
        for (const theirs of friendSessions) {
            const t0 = Math.max(theirs.startTs, cutoff);
            const t1 = Math.min(theirs.endTs, nowMs);
            if (t1 <= t0)
                continue;
            ms += overlapMs(m0, m1, t0, t1);
        }
    }
    return ms / MS_PER_HOUR;
}
/**
 * Builds friendOverlapCache map: friendId -> overlap hours.
 */
function buildFriendOverlapCache(mySessions, friendSessionsById, nowMs = Date.now()) {
    const out = {};
    for (const friendId of Object.keys(friendSessionsById)) {
        out[friendId] = computeOverlapHours(mySessions, friendSessionsById[friendId], nowMs);
    }
    return out;
}
/**
 * Alignment score 0-100 from overlap hours (saturating curve).
 */
function alignmentScoreFromOverlapHours(overlapHours) {
    return Math.min(100, Math.round(overlapHours * 12));
}
