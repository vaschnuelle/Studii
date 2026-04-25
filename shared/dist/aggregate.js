"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPersonalityInputs = buildPersonalityInputs;
exports.buildUserStats = buildUserStats;
exports.weekPeriodId = weekPeriodId;
exports.buildWrappedSummary = buildWrappedSummary;
const biggestWins_1 = require("./biggestWins");
const distributions_1 = require("./distributions");
const overlap_1 = require("./overlap");
const personality_1 = require("./personality");
/**
 * Derives personality inputs from sessions and overlap cache (deterministic).
 */
function buildPersonalityInputs(sessions, friendOverlapCache, nowMs = Date.now()) {
    const { hour } = (0, distributions_1.buildLast30dDistributions)(sessions, nowMs);
    let peakIdx = 0;
    for (let i = 1; i < 24; i++) {
        if (hour[i] > hour[peakIdx])
            peakIdx = i;
    }
    const overlaps = Object.values(friendOverlapCache);
    const maxBuddyOverlap = overlaps.length ? Math.max(...overlaps) : 0;
    /** Saturating curve: ~40h overlap with a buddy in 30d reads as fully "social". */
    const normOverlap = Math.min(1, maxBuddyOverlap / 40);
    let pomodoroSessions = 0;
    let pomodoroCompleted = 0;
    for (const s of sessions) {
        if (s.isPomodoro) {
            pomodoroSessions += 1;
            if ((s.pomodoroCycles ?? 0) > 0)
                pomodoroCompleted += 1;
        }
    }
    const pomodoroCompletionRate = pomodoroSessions > 0 ? pomodoroCompleted / pomodoroSessions : 0.5;
    return {
        medianSessionMin: (0, distributions_1.medianSessionMinutes)(sessions, nowMs),
        peakHour: peakIdx,
        normalizedFriendOverlap: normOverlap,
        pomodoroCompletionRate,
    };
}
/**
 * Full cached `users.stats` object for Firestore.
 */
function buildUserStats(mySessions, friendSessionsById, nowMs = Date.now()) {
    const { hour, weekday } = (0, distributions_1.buildLast30dDistributions)(mySessions, nowMs);
    const friendOverlapCache = (0, overlap_1.buildFriendOverlapCache)(mySessions, friendSessionsById, nowMs);
    const inputs = buildPersonalityInputs(mySessions, friendOverlapCache, nowMs);
    const personality = (0, personality_1.classifyPersonality)(inputs);
    return {
        last30dHourDistribution: hour.map((x) => Math.round(x * 1000) / 1000),
        last30dDayDistribution: weekday.map((x) => Math.round(x * 1000) / 1000),
        friendOverlapCache,
        personality,
    };
}
/**
 * ISO week id like 2026-W12 (Monday-based week, minimal implementation).
 */
function weekPeriodId(d = new Date()) {
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    const y = t.getUTCFullYear();
    return `${y}-W${String(weekNo).padStart(2, "0")}`;
}
/**
 * Builds a wrapped summary row for `wrappedSummaries/{userId}/{periodId}`.
 */
function buildWrappedSummary(mySessions, friendSessionsById, periodId = weekPeriodId(), nowMs = Date.now()) {
    const stats = buildUserStats(mySessions, friendSessionsById, nowMs);
    const { hour, weekday } = (0, distributions_1.buildLast30dDistributions)(mySessions, nowMs);
    const { powerHour, powerDay } = (0, distributions_1.powerHourAndDay)(hour, weekday);
    const wins = (0, biggestWins_1.computeBiggestWins)(mySessions, nowMs);
    const entries = Object.entries(stats.friendOverlapCache).sort((a, b) => b[1] - a[1]);
    const top = entries[0];
    return {
        periodId,
        personality: stats.personality,
        topBuddy: top && top[1] > 0 ? top[0] : null,
        topBuddyOverlapHours: top ? Math.round(top[1] * 1e2) / 1e2 : 0,
        powerHour,
        powerDay,
        longestSessionMin: wins.longestSessionMin,
        mostPomodorosDay: wins.mostPomodorosInDay,
        streak: wins.longestStreakDays,
        totalHours: Math.round((0, distributions_1.totalHoursLast30d)(mySessions, nowMs) * 1e2) / 1e2,
        shareCardUrl: null,
        generatedAt: new Date(nowMs),
    };
}
