import { initializeApp } from 'firebase-admin/app';

initializeApp();

export { createFriendRelation } from './callable/createFriendRelation.js';
export { respondFriendRequest } from './callable/respondFriendRequest.js';
export { onSessionWritten } from './triggers/onSessionWritten.js';
export { batchNotificationWorker } from './scheduled/batchNotificationWorker.js';
export { analyticsAggregator } from './scheduled/analyticsAggregator.js';
