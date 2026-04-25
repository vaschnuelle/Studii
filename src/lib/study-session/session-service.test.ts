import { describe, expect, it } from "vitest";
import { buildSessionInsertPayload } from "./session-service";

describe("buildSessionInsertPayload", () => {
  it("supports starting a session without Pomodoro", () => {
    const payload = buildSessionInsertPayload(
      "user-1",
      {
        subject: "Biology",
        pomodoroEnabled: false,
        pomodoroFocusMinutes: 25,
      },
      "2026-04-25T12:00:00.000Z"
    );

    expect(payload.is_pomodoro).toBe(false);
    expect(payload.pomodoro_focus_minutes).toBeNull();
    expect(payload.subject).toBe("Biology");
  });

  it("supports optional Pomodoro configuration", () => {
    const payload = buildSessionInsertPayload(
      "user-1",
      {
        subject: "Calculus",
        pomodoroEnabled: true,
        pomodoroFocusMinutes: 30,
      },
      "2026-04-25T12:00:00.000Z"
    );

    expect(payload.is_pomodoro).toBe(true);
    expect(payload.pomodoro_focus_minutes).toBe(30);
  });
});
