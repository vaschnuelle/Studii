import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions';

/**
 * Nightly (or incremental) analytics: streaks, top subjects, habit alignment inputs.
 */
export const analyticsAggregator = onSchedule(
  {
    schedule: '0 4 * * *',
    region: 'us-central1',
    timeZone: 'Etc/UTC',
  },
  async () => {
    logger.info('analyticsAggregator tick — implement streaks and top subjects');
  }
);
