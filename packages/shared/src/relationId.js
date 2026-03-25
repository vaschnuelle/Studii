/**
 * Builds a deterministic Firestore document id for a pair of user ids.
 * Uses lexicographic order so the same pair always maps to one id (rules-friendly).
 *
 * @param userIdA - First Firebase Auth uid
 * @param userIdB - Second Firebase Auth uid
 * @returns Stable id string `minUid_maxUid`
 */
export function makeRelationId(userIdA, userIdB) {
    if (userIdA === userIdB) {
        throw new Error('Cannot create a friend relation with the same user id twice.');
    }
    return userIdA < userIdB ? `${userIdA}_${userIdB}` : `${userIdB}_${userIdA}`;
}
