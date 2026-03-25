/** Friend row shown on Home (“studying now”). */
export type FriendActivity = {
  name: string;
  image: string;
  status: string;
  duration: string;
  active: boolean;
};

/** Completed session summary for the recent list. */
export type RecentSession = {
  subject: string;
  duration: string;
  time: string;
};
