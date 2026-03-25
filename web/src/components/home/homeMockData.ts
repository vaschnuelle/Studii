import type { FriendActivity, RecentSession } from './types';

/** Placeholder content — swap for Firestore-backed data when wiring the backend. */
export const HOME_FRIENDS_MOCK: FriendActivity[] = [
  {
    name: 'Sarah Chen',
    image:
      'https://images.unsplash.com/photo-1758525861586-1c8c8e424dc8?w=200&h=200&fit=crop',
    status: 'Studying Physics',
    duration: '1h 23m',
    active: true,
  },
  {
    name: 'Alex Kumar',
    image:
      'https://images.unsplash.com/photo-1770235622334-7b721261a230?w=200&h=200&fit=crop',
    status: 'Studying Math',
    duration: '45m',
    active: true,
  },
  {
    name: 'Maya Johnson',
    image:
      'https://images.unsplash.com/photo-1758521540968-3af0cc2074a0?w=200&h=200&fit=crop',
    status: 'Studying Chemistry',
    duration: '2h 10m',
    active: true,
  },
];

/** Recent focus sessions for the home feed (placeholder). */
export const HOME_RECENT_SESSIONS_MOCK: RecentSession[] = [
  { subject: 'Mathematics', duration: '25m', time: '2 hours ago' },
  { subject: 'Physics', duration: '25m', time: '5 hours ago' },
  { subject: 'Chemistry', duration: '50m', time: 'Yesterday' },
];
