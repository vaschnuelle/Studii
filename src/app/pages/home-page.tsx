import { Clock, Users, Play, Trophy, Flame, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import { useStudiiData } from '@/contexts/studii-data-context';

const friends = [
  {
    name: 'Sarah Chen',
    image: 'https://images.unsplash.com/photo-1758525861586-1c8c8e424dc8?w=200&h=200&fit=crop',
    status: 'Studying Physics',
    duration: '1h 23m',
    active: true,
  },
  {
    name: 'Alex Kumar',
    image: 'https://images.unsplash.com/photo-1770235622334-7b721261a230?w=200&h=200&fit=crop',
    status: 'Studying Math',
    duration: '45m',
    active: true,
  },
  {
    name: 'Maya Johnson',
    image: 'https://images.unsplash.com/photo-1758521540968-3af0cc2074a0?w=200&h=200&fit=crop',
    status: 'Studying Chemistry',
    duration: '2h 10m',
    active: true,
  },
];

const recentSessions = [
  { subject: 'Mathematics', duration: '25m', time: '2 hours ago' },
  { subject: 'Physics', duration: '25m', time: '5 hours ago' },
  { subject: 'Chemistry', duration: '50m', time: 'Yesterday' },
];

export default function HomePage() {
  const { stats, wrappedSummary, loading } = useStudiiData();

  return (
    <div className="space-y-8 pb-24 md:pb-8">
      {/* Phase 2: Wrapped prompt */}
      <Link
        to="/wrapped"
        className="block bg-gradient-to-br from-[#22223B] via-[#2d2d44] to-[#508CA4] rounded-[2rem] p-6 md:p-8 shadow-xl border-2 border-white/20 text-white hover:opacity-[0.98] transition-opacity"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/70">Phase 2</p>
              <h2 className="text-xl md:text-2xl font-black">Studii Wrapped</h2>
              <p className="text-white/85 text-sm font-medium mt-1">
                {loading
                  ? "Loading your insights…"
                  : stats && wrappedSummary
                    ? `${stats.personality} · ${wrappedSummary.totalHours.toFixed(1)}h (30d) · ${wrappedSummary.streak}d streak`
                    : "See personality, buddies, peaks, and wins."}
              </p>
            </div>
          </div>
          <span className="text-sm font-bold bg-white/20 px-4 py-2 rounded-xl shrink-0">Open →</span>
        </div>
      </Link>

      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-[#508CA4] to-[#508CA4]/90 rounded-[2rem] p-8 shadow-xl shadow-[#508CA4]/40 text-white border-2 border-[#508CA4]/50">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">Welcome back! 👋</h2>
            <p className="text-white/90 font-medium">Ready to crush your study goals today?</p>
          </div>
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
            <Trophy className="w-8 h-8" />
          </div>
        </div>
        <Link
          to="/timer"
          className="inline-flex items-center gap-2 bg-white text-[#508CA4] px-6 py-3 rounded-2xl font-bold shadow-lg hover:scale-105 transition-transform"
        >
          <Play className="w-5 h-5" />
          Start Study Session
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 shadow-lg border-2 border-white/80">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#508CA4] to-[#508CA4]/80 rounded-2xl flex items-center justify-center shadow-lg shadow-[#508CA4]/30">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="text-3xl font-bold text-[#22223B]">12.5h</div>
              <div className="text-sm text-[#22223B]/60 font-semibold">This week</div>
            </div>
          </div>
          <div className="h-2 bg-slate-200/50 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#508CA4] to-[#508CA4]/80 rounded-full" style={{ width: '62.5%' }}></div>
          </div>
          <p className="text-xs text-[#22223B]/60 font-medium mt-2">Goal: 20h per week</p>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 shadow-lg border-2 border-white/80">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Flame className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="text-3xl font-bold text-[#22223B]">23</div>
              <div className="text-sm text-[#22223B]/60 font-semibold">Day streak</div>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-2xl">🔥</span>
            <span className="text-xs font-bold text-amber-600 bg-amber-500/10 px-2 py-1 rounded-lg">Personal best!</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 shadow-lg border-2 border-white/80">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#508CA4] to-[#508CA4]/80 rounded-2xl flex items-center justify-center shadow-lg shadow-[#508CA4]/30">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="text-3xl font-bold text-[#22223B]">8</div>
              <div className="text-sm text-[#22223B]/60 font-semibold">Study buddies</div>
            </div>
          </div>
          <p className="text-xs text-[#508CA4] font-bold bg-[#508CA4]/10 px-2 py-1 rounded-lg inline-block">3 studying now</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Friends Studying Now */}
        <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 shadow-lg border-2 border-white/80">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#22223B]">Friends Studying Now</h2>
            <Link
              to="/friends"
              className="text-sm font-bold text-[#508CA4] hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {friends.map((friend, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-[1.5rem] p-4 flex items-center gap-3 border-2 border-white/80 shadow-md"
              >
                <div className="relative">
                  <img
                    src={friend.image}
                    alt={friend.name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#508CA4]/30"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#508CA4] rounded-full border-2 border-white shadow-lg"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[#22223B]">{friend.name}</div>
                  <div className="text-sm text-[#22223B]/60 font-medium">{friend.status}</div>
                </div>
                <div className="text-sm font-bold text-[#508CA4] bg-white/80 px-3 py-2 rounded-xl border border-[#508CA4]/20">
                  {friend.duration}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 shadow-lg border-2 border-white/80">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#22223B]">Recent Sessions</h2>
            <Link
              to="/analytics"
              className="text-sm font-bold text-[#508CA4] hover:underline"
            >
              Analytics
            </Link>
          </div>
          <div className="space-y-3">
            {recentSessions.map((session, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-[1.5rem] p-4 flex items-center justify-between border-2 border-white/80 shadow-md"
              >
                <div>
                  <div className="font-bold text-[#22223B]">{session.subject}</div>
                  <div className="text-sm text-[#22223B]/60 font-medium">{session.time}</div>
                </div>
                <div className="text-lg font-bold text-[#508CA4] bg-white/80 px-4 py-2 rounded-xl border border-[#508CA4]/20">
                  {session.duration}
                </div>
              </div>
            ))}
          </div>
          <Link
            to="/timer"
            className="mt-4 w-full bg-gradient-to-r from-[#508CA4] to-[#508CA4]/90 text-white font-bold py-3 rounded-[1.5rem] shadow-lg shadow-[#508CA4]/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            New Session
          </Link>
        </div>
      </div>
    </div>
  );
}
