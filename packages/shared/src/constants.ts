/**
 * Default notification and check-in preferences used when creating a user profile.
 */
export const DEFAULT_NOTIFICATION_PREFERENCES = {
  friendActivityEnabled: false,
  checkInEnabled: true,
} as const;

/**
 * Default session check-in preferences (per user).
 */
export const DEFAULT_USER_PREFERENCES = {
  checkInIntervalMin: 30,
  checkInMissedThreshold: 2,
  autoStopEnabled: true,
} as const;

/** Friend activity push: minimum study minutes before a notification may be sent. */
export const FRIEND_NOTIFICATION_THRESHOLD_MINUTES = 60;

/** Maximum friend activity push notifications per friend per rolling day. */
export const FRIEND_NOTIFICATION_DAILY_CAP = 3;

/** Minutes after session end during which the session `note` may still be edited. */
export const NOTE_EDIT_WINDOW_MS = 30 * 60 * 1000;
