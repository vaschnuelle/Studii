/**
 * Firestore user document shape (Phase 1 + agreed extensions).
 */
export type UserProfile = {
  displayName: string;
  email: string;
  avatarUrl: string | null;
  timezone: string;
  privacy: {
    liveStatusVisible: boolean;
  };
  notifications: {
    friendActivityEnabled: boolean;
    checkInEnabled: boolean;
  };
  preferences: {
    checkInIntervalMin: number;
    checkInMissedThreshold: number;
    autoStopEnabled: boolean;
  };
  createdAt: unknown;
  lastActiveAt: unknown;
  weeklyCache: number;
  monthlyCache: number;
};

export type FriendRelationStatus = 'pending' | 'accepted' | 'blocked';

/**
 * Firestore friendRelations document.
 * `initiatedBy` records who sent the request (required for accept/decline authorization).
 */
export type FriendRelation = {
  userA: string;
  userB: string;
  /** Firebase Auth uid of the user who sent the friend request */
  initiatedBy: string;
  status: FriendRelationStatus;
  createdAt: unknown;
};

export type SessionVisibility = 'friends' | 'private';

export type PomodoroStatus = 'running' | 'paused' | 'completed';

/**
 * Firestore sessions document.
 */
export type Session = {
  userId: string;
  subject: string;
  note: string | null;
  startTs: unknown;
  endTs: unknown | null;
  isPomodoro: boolean;
  pomodoroCycles: number;
  visibility: SessionVisibility;
  createdAt: unknown;
};

/**
 * Firestore pomodoros document — one doc per active Pomodoro instance, updated in place.
 */
export type Pomodoro = {
  sessionId: string;
  focusDurationSec: number;
  breakDurationSec: number;
  cycleIndex: number;
  status: PomodoroStatus;
};

export type NotificationActionTaken =
  | 'opened'
  | 'dismissed'
  | 'snoozed'
  | 'ignored'
  | null;

/**
 * Firestore notificationsLog document payload (required keys per spec).
 */
export type NotificationLogPayload = {
  friendId: string;
  sessionId: string;
  elapsedMinutes: number;
  templateId: string;
  [key: string]: unknown;
};

/**
 * Firestore notificationsLog document.
 */
export type NotificationLog = {
  userId: string;
  type: string;
  payload: NotificationLogPayload;
  sentAt: unknown;
  actionTaken: NotificationActionTaken;
};
