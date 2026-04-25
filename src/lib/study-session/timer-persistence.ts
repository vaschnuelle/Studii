export interface PersistedTimerSnapshot {
  sessionId: string;
  subject: string;
  startedAtIso: string;
  isRunning: boolean;
  accumulatedSeconds: number;
  pomodoroEnabled: boolean;
  pomodoroFocusMinutes: number | null;
  lastClientActivityAtIso: string;
}

const STUDY_TIMER_STORAGE_KEY = "studii:active-session-timer";

/**
 * Saves the active study timer snapshot so timer recovery survives app reloads.
 */
export function persistTimerSnapshot(snapshot: PersistedTimerSnapshot): void {
  window.localStorage.setItem(STUDY_TIMER_STORAGE_KEY, JSON.stringify(snapshot));
}

/**
 * Loads a persisted timer snapshot from localStorage.
 */
export function loadPersistedTimerSnapshot(): PersistedTimerSnapshot | null {
  const rawSnapshot = window.localStorage.getItem(STUDY_TIMER_STORAGE_KEY);
  if (!rawSnapshot) {
    return null;
  }

  try {
    const parsedSnapshot = JSON.parse(rawSnapshot) as PersistedTimerSnapshot;
    if (!parsedSnapshot.sessionId || !parsedSnapshot.startedAtIso) {
      return null;
    }
    return parsedSnapshot;
  } catch {
    return null;
  }
}

/**
 * Clears the persisted active study timer from local storage.
 */
export function clearPersistedTimerSnapshot(): void {
  window.localStorage.removeItem(STUDY_TIMER_STORAGE_KEY);
}

/**
 * Computes elapsed seconds from persisted data and current wall-clock time.
 */
export function computeElapsedSeconds(snapshot: PersistedTimerSnapshot, now: Date): number {
  const accumulatedSeconds = Math.max(0, snapshot.accumulatedSeconds);
  if (!snapshot.isRunning) {
    return accumulatedSeconds;
  }

  const startedAtMillis = new Date(snapshot.startedAtIso).getTime();
  if (Number.isNaN(startedAtMillis)) {
    return accumulatedSeconds;
  }

  const currentMillis = now.getTime();
  const elapsedSinceStartSeconds = Math.max(0, Math.floor((currentMillis - startedAtMillis) / 1000));
  return accumulatedSeconds + elapsedSinceStartSeconds;
}
