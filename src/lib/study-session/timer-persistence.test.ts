import { describe, expect, it } from "vitest";
import { computeElapsedSeconds, type PersistedTimerSnapshot } from "./timer-persistence";

describe("computeElapsedSeconds", () => {
  it("keeps elapsed time accurate after background-like wall-clock gaps", () => {
    const snapshot: PersistedTimerSnapshot = {
      sessionId: "session-1",
      subject: "Physics",
      startedAtIso: "2026-04-25T10:00:00.000Z",
      isRunning: true,
      accumulatedSeconds: 0,
      pomodoroEnabled: false,
      pomodoroFocusMinutes: null,
      lastClientActivityAtIso: "2026-04-25T10:00:00.000Z",
    };

    const elapsed = computeElapsedSeconds(snapshot, new Date("2026-04-25T10:45:15.000Z"));
    expect(elapsed).toBe(2715);
  });

  it("returns accumulated seconds when paused", () => {
    const snapshot: PersistedTimerSnapshot = {
      sessionId: "session-1",
      subject: "Physics",
      startedAtIso: "2026-04-25T10:00:00.000Z",
      isRunning: false,
      accumulatedSeconds: 600,
      pomodoroEnabled: true,
      pomodoroFocusMinutes: 25,
      lastClientActivityAtIso: "2026-04-25T10:10:00.000Z",
    };

    const elapsed = computeElapsedSeconds(snapshot, new Date("2026-04-25T10:30:00.000Z"));
    expect(elapsed).toBe(600);
  });
});
