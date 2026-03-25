import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { isValidSessionTimeRange } from '../lib/sessionValidation.js';

/**
 * Validates session timestamps and updates user weekly/monthly caches on writes.
 * Extend with friend notifications and stale-session cleanup as Phase 1 progresses.
 */
export const onSessionWritten = onDocumentWritten(
  { document: 'sessions/{sessionId}', region: 'us-central1' },
  async (event) => {
    const before = event.data?.before;
    const after = event.data?.after;
    if (!after?.exists) {
      return;
    }

    const session = after.data();
    const startTs = session?.startTs;
    const endTs = session?.endTs ?? null;

    if (!isValidSessionTimeRange(startTs, endTs)) {
      logger.warn('Invalid session time range — skipping side effects', {
        sessionId: after.id,
      });
      return;
    }

    const userId = session?.userId as string | undefined;
    if (!userId) {
      return;
    }

    const priorEnd = before?.exists ? before.data()?.endTs : undefined;
    const endedNow = !priorEnd && !!endTs;

    if (endedNow && endTs && startTs) {
      const db = getFirestore();
      const durationMs = endTs.toMillis() - startTs.toMillis();
      const hours = Math.max(0, durationMs / (1000 * 60 * 60));
      await db
        .collection('users')
        .doc(userId)
        .set(
          {
            weeklyCache: FieldValue.increment(hours),
            monthlyCache: FieldValue.increment(hours),
            lastActiveAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
    }
  }
);
