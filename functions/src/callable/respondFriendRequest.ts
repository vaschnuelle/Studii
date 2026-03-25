import { getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { makeRelationId } from '@studii/shared';

export type RespondFriendRequestInput = {
  /** Other user involved in the relation */
  otherUserId: string;
  action: 'accept' | 'decline';
};

/**
 * Accepts or declines a pending friend request. Only the user who did not initiate
 * the request may accept or decline.
 */
export const respondFriendRequest = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Sign in required.');
  }

  const callerId = request.auth.uid;
  const data = request.data as RespondFriendRequestInput;
  const { otherUserId, action } = data ?? {};

  if (!otherUserId || typeof otherUserId !== 'string') {
    throw new HttpsError('invalid-argument', 'otherUserId is required.');
  }

  if (action !== 'accept' && action !== 'decline') {
    throw new HttpsError('invalid-argument', 'action must be accept or decline.');
  }

  const relationId = makeRelationId(callerId, otherUserId);
  const db = getFirestore();
  const ref = db.collection('friendRelations').doc(relationId);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) {
      throw new HttpsError('not-found', 'Friend relation not found.');
    }

    const doc = snap.data() as {
      userA: string;
      userB: string;
      status: string;
      initiatedBy?: string;
    };

    if (doc.status !== 'pending') {
      throw new HttpsError('failed-precondition', 'Relation is not pending.');
    }

    const initiatedBy = doc.initiatedBy;
    if (!initiatedBy) {
      throw new HttpsError('failed-precondition', 'Relation is missing initiatedBy metadata.');
    }

    if (callerId === initiatedBy) {
      throw new HttpsError('permission-denied', 'Initiator cannot accept or decline their own request.');
    }

    if (callerId !== doc.userA && callerId !== doc.userB) {
      throw new HttpsError('permission-denied', 'Not a participant in this relation.');
    }

    if (action === 'accept') {
      tx.update(ref, { status: 'accepted' });
    } else {
      tx.delete(ref);
    }
  });

  return { relationId, action };
});
