import type { SessionRecord } from "@studii/shared";

/** Display names for demo friend document ids. */
export const DEMO_FRIEND_NAMES: Record<string, string> = {
  "friend-sarah": "Sarah Chen",
  "friend-alex": "Alex Kumar",
  "friend-maya": "Maya Johnson",
};

const DAY_MS = 86400000;

/**
 * Builds deterministic demo sessions for the last 30 days: overlapping windows with Sarah,
 * solo blocks, and pomodoro-tagged sessions for classification variety.
 */
export function generateDemoPhase2Sessions(nowMs: number = Date.now()): {
  mine: SessionRecord[];
  byFriend: Record<string, SessionRecord[]>;
} {
  const mine: SessionRecord[] = [];
  const byFriend: Record<string, SessionRecord[]> = {
    "friend-sarah": [],
    "friend-alex": [],
    "friend-maya": [],
  };

  for (let d = 0; d < 30; d++) {
    const base = new Date(nowMs - (d + 1) * DAY_MS);
    base.setHours(0, 0, 0, 0);
    const dayOffset = base.getTime();

    // Afternoon study block (Marathoner-ish lengths on some days)
    const s1 = dayOffset + 14 * 3600000;
    const e1 = s1 + (d % 4 === 0 ? 95 : 38) * 60000;
    mine.push({
      startTs: s1,
      endTs: e1,
      isPomodoro: d % 3 !== 0,
      pomodoroCycles: d % 3 !== 0 ? 2 : 0,
    });

    // Overlap with Sarah — same window shifted inside my block
    const sS = s1 + 10 * 60000;
    const eS = s1 + 55 * 60000;
    byFriend["friend-sarah"]!.push({
      startTs: sS,
      endTs: eS,
      isPomodoro: true,
      pomodoroCycles: 1,
    });

    // Alex — evening overlap 2 nights per week
    if (d % 3 === 0) {
      const s2 = dayOffset + 20 * 3600000;
      const e2 = s2 + 40 * 60000;
      mine.push({
        startTs: s2,
        endTs: e2,
        isPomodoro: true,
        pomodoroCycles: 1,
      });
      byFriend["friend-alex"]!.push({
        startTs: s2 + 5 * 60000,
        endTs: e2 - 5 * 60000,
        isPomodoro: false,
      });
    }

    // Maya — morning overlap weekends
    if (d % 7 === 0 || d % 7 === 6) {
      const s3 = dayOffset + 9 * 3600000;
      const e3 = s3 + 50 * 60000;
      mine.push({ startTs: s3, endTs: e3, isPomodoro: false });
      byFriend["friend-maya"]!.push({
        startTs: s3 + 15 * 60000,
        endTs: e3 - 10 * 60000,
        isPomodoro: true,
        pomodoroCycles: 2,
      });
    }
  }

  return { mine, byFriend };
}
