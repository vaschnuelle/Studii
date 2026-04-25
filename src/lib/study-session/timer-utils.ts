/**
 * Formats elapsed seconds into an HH:MM:SS or MM:SS display string.
 */
export function formatDuration(totalSeconds: number): string {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Computes remaining seconds for Pomodoro mode; returns null in stopwatch mode.
 */
export function computePomodoroRemainingSeconds(
  pomodoroEnabled: boolean,
  pomodoroFocusMinutes: number | null,
  elapsedSeconds: number
): number | null {
  if (!pomodoroEnabled || !pomodoroFocusMinutes) {
    return null;
  }

  const totalFocusSeconds = pomodoroFocusMinutes * 60;
  return Math.max(0, totalFocusSeconds - elapsedSeconds);
}
