import { Link } from 'react-router-dom';
import type { FriendActivity } from './types';

type FriendActivityListProps = {
  /** Friends currently in a session (props keep the list ready for API data). */
  friends: FriendActivity[];
};

/**
 * “Friends studying now” panel with avatar rows and link to the full friends view.
 */
export function FriendActivityList({ friends }: FriendActivityListProps) {
  return (
    <div className="rounded-[2rem] border-2 border-white/80 bg-white/80 p-6 shadow-lg backdrop-blur-md">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#22223B]">Friends Studying Now</h2>
        <Link to="/friends" className="text-sm font-bold text-[#508CA4] hover:underline">
          View all
        </Link>
      </div>
      <ul className="space-y-3">
        {friends.map((friend) => (
          <li
            key={friend.name}
            className="flex items-center gap-3 rounded-[1.5rem] border-2 border-white/80 bg-gradient-to-r from-amber-50 to-orange-50 p-4 shadow-md"
          >
            <div className="relative shrink-0">
              <img
                src={friend.image}
                alt=""
                className="h-14 w-14 rounded-2xl object-cover ring-2 ring-[#508CA4]/30"
                width={56}
                height={56}
              />
              {friend.active ? (
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white bg-[#508CA4] shadow-lg" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-[#22223B]">{friend.name}</div>
              <div className="text-sm font-medium text-[#22223B]/60">{friend.status}</div>
            </div>
            <div className="shrink-0 rounded-xl border border-[#508CA4]/20 bg-white/80 px-3 py-2 text-sm font-bold text-[#508CA4]">
              {friend.duration}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
