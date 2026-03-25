import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions';

/**
 * Aggregates and rate-limits friend activity push notifications (max 3 per friend per day).
 * Implement FCM send + notificationsLog writes in a follow-up pass.
 */
export const batchNotificationWorker = onSchedule(
  {
    schedule: '*/15 * * * *',
    region: 'us-central1',
    timeZone: 'Etc/UTC',
  },
  async () => {
    logger.info('batchNotificationWorker tick — implement batching + FCM');
  }
);
