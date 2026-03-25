import { Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { RecentSession } from './types';

type RecentSessionsSectionProps = {
  sessions: RecentSession[];
};

/**
 * Recent sessions list with analytics shortcut and primary “new session” action.
 */
export function RecentSessionsSection({ sessions }: RecentSessionsSectionProps) {
  return (
    <div className="rounded-[2rem] border-2 border-white/80 bg-white/80 p-6 shadow-lg backdrop-blur-md">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#22223B]">Recent Sessions</h2>
        <Link to="/analytics" className="text-sm font-bold text-[#508CA4] hover:underline">
          Analytics
        </Link>
      </div>
      <ul className="space-y-3">
        {sessions.map((session) => (
          <li
            key={`${session.subject}-${session.time}`}
            className="flex items-center justify-between rounded-[1.5rem] border-2 border-white/80 bg-gradient-to-r from-amber-50 to-orange-50 p-4 shadow-md"
          >
            <div>
              <div className="font-bold text-[#22223B]">{session.subject}</div>
              <div className="text-sm font-medium text-[#22223B]/60">{session.time}</div>
            </div>
            <div className="rounded-xl border border-[#508CA4]/20 bg-white/80 px-4 py-2 text-lg font-bold text-[#508CA4]">
              {session.duration}
            </div>
          </li>
        ))}
      </ul>
      <Link
        to="/focus"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-[1.5rem] bg-gradient-to-r from-[#508CA4] to-[#508CA4]/90 py-3 font-bold text-white shadow-lg shadow-[#508CA4]/30 transition-all hover:scale-[1.02]"
      >
        <Play className="h-5 w-5" aria-hidden />
        New Session
      </Link>
    </div>
  );
}
