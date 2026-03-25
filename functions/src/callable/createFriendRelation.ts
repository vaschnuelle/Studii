import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { makeRelationId } from '@studii/shared';

export type CreateFriendRelationRequest = {
  /** Target Firebase Auth uid to connect with */
  targetUserId: string;
};

export type CreateFriendRelationResponse = {
  relationId: string;
  status: 'pending' | 'accepted' | 'blocked';
  created: boolean;
};

/**
 * Creates a pending friend relation if none exists, or returns the existing relation.
 * Uses a deterministic document id to prevent duplicate rows.
 */
export const createFriendRelation = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Sign in required.');
  }

  const callerId = request.auth.uid;
  const data = request.data as CreateFriendRelationRequest;
  const targetUserId = data?.targetUserId;

  if (!targetUserId || typeof targetUserId !== 'string') {
    throw new HttpsError('invalid-argument', 'targetUserId is required.');
  }

  if (targetUserId === callerId) {
    throw new HttpsError('invalid-argument', 'Cannot create a relation with yourself.');
  }

  const relationId = makeRelationId(callerId, targetUserId);
  const db = getFirestore();
  const ref = db.collection('friendRelations').doc(relationId);

  const result = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (snap.exists) {
      const existing = snap.data() as { status: string };
      return {
        relationId,
        status: existing.status as CreateFriendRelationResponse['status'],
        created: false,
      };
    }

    const userA = callerId < targetUserId ? callerId : targetUserId;
    const userB = callerId < targetUserId ? targetUserId : callerId;

    tx.set(ref, {
      userA,
      userB,
      initiatedBy: callerId,
      status: 'pending',
      createdAt: FieldValue.serverTimestamp(),
    });

    return { relationId, status: 'pending' as const, created: true };
  });

  return result;
});
