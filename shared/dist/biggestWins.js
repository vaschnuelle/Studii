"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeBiggestWins = computeBiggestWins;
const MS_DAY = 86400000;
/**
 * Calendar day key in local time (YYYY-MM-DD).
 */
function dayKeyLocal(ts) {
    const d = new Date(ts);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}
/**
 * Computes Phase 2 "biggest wins" metrics from sessions (last 90d window for month-over-month).
 */
function computeBiggestWins(sessions, nowMs = Date.now()) {
    const ninetyDaysAgo = nowMs - 90 * MS_DAY;
    const windowed = sessions.filter((s) => s.endTs > ninetyDaysAgo && s.startTs < nowMs);
    let longestSessionMin = 0;
    const pomodorosByDay = new Map();
    const minutesByDay = new Map();
    for (const s of windowed) {
        const lenMin = Math.min(s.endTs, nowMs) - Math.max(s.startTs, ninetyDaysAgo);
        if (lenMin <= 0)
            continue;
        const minutes = lenMin / 60000;
        longestSessionMin = Math.max(longestSessionMin, minutes);
        const key = dayKeyLocal(Math.max(s.startTs, ninetyDaysAgo));
        minutesByDay.set(key, (minutesByDay.get(key) ?? 0) + minutes);
        const cycles = s.pomodoroCycles ?? (s.isPomodoro ? 1 : 0);
        if (cycles > 0) {
            pomodorosByDay.set(key, (pomodorosByDay.get(key) ?? 0) + cycles);
        }
    }
    let mostPomodorosInDay = 0;
    for (const v of pomodorosByDay.values()) {
        mostPomodorosInDay = Math.max(mostPomodorosInDay, v);
    }
    const longestStreakDays = computeStudyStreakDays(minutesByDay, nowMs);
    const mostConsistentWeekLabel = computeMostConsistentWeek(minutesByDay, nowMs);
    const mostImprovedMonthPercent = computeMonthImprovementPercent(minutesByDay, nowMs);
    return {
        longestSessionMin: Math.round(longestSessionMin),
        mostPomodorosInDay,
        longestStreakDays,
        mostConsistentWeekLabel,
        mostImprovedMonthPercent,
    };
}
const MIN_MINUTES_FOR_STUDY_DAY = 15;
/**
 * Longest run of consecutive days with at least MIN_MINUTES_FOR_STUDY_DAY minutes.
 */
function computeStudyStreakDays(minutesByDay, nowMs) {
    const days = [...minutesByDay.entries()]
        .filter(([, m]) => m >= MIN_MINUTES_FOR_STUDY_DAY)
        .map(([k]) => k)
        .sort();
    if (days.length === 0)
        return 0;
    let best = 1;
    let run = 1;
    for (let i = 1; i < days.length; i++) {
        const prev = parseDay(days[i - 1]);
        const cur = parseDay(days[i]);
        const diffDays = (cur.getTime() - prev.getTime()) / MS_DAY;
        if (diffDays === 1) {
            run += 1;
            best = Math.max(best, run);
        }
        else {
            run = 1;
        }
    }
    return best;
}
function parseDay(ymd) {
    const [y, m, d] = ymd.split("-").map(Number);
    return new Date(y, m - 1, d);
}
/**
 * Finds a 7-day window with the least coefficient of variation of daily minutes (deterministic tie-break).
 */
function computeMostConsistentWeek(minutesByDay, nowMs) {
    // Build last 8 weeks of daily totals
    const start = new Date(nowMs);
    start.setHours(0, 0, 0, 0);
    const series = [];
    for (let i = 0; i < 56; i++) {
        const t = start.getTime() - i * MS_DAY;
        const k = dayKeyLocal(t);
        series.push(minutesByDay.get(k) ?? 0);
    }
    series.reverse();
    let bestStd = Number.POSITIVE_INFINITY;
    let bestIdx = 0;
    for (let w = 0; w <= series.length - 7; w++) {
        const chunk = series.slice(w, w + 7);
        const mean = chunk.reduce((a, b) => a + b, 0) / 7;
        const variance = chunk.reduce((acc, x) => acc + (x - mean) * (x - mean), 0) / 7;
        const std = Math.sqrt(variance);
        const score = mean < 1 ? Number.POSITIVE_INFINITY : std / mean; // CV
        if (score < bestStd) {
            bestStd = score;
            bestIdx = w;
        }
    }
    if (!Number.isFinite(bestStd))
        return "—";
    const endDay = new Date(nowMs - bestIdx * MS_DAY);
    return `Week of ${endDay.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}
/**
 * Compares last full calendar month vs previous; percent improvement in total hours.
 */
function computeMonthImprovementPercent(minutesByDay, nowMs) {
    const cur = new Date(nowMs);
    const thisMonth = cur.getMonth();
    const thisYear = cur.getFullYear();
    const prevMonthDate = new Date(thisYear, thisMonth - 1, 1);
    const prevMonth = prevMonthDate.getMonth();
    const prevYear = prevMonthDate.getFullYear();
    let curTotal = 0;
    let prevTotal = 0;
    for (const [k, m] of minutesByDay) {
        const d = parseDay(k);
        if (d.getMonth() === thisMonth && d.getFullYear() === thisYear && d.getTime() <= nowMs) {
            curTotal += m;
        }
        if (d.getMonth() === prevMonth && d.getFullYear() === prevYear) {
            prevTotal += m;
        }
    }
    if (prevTotal < 1)
        return null;
    return Math.round(((curTotal - prevTotal) / prevTotal) * 100);
}
