import { useState } from 'react';
import { Search, UserPlus, MessageCircle, TrendingUp, Users } from 'lucide-react';
import { alignmentScoreFromOverlapHours } from '@studii/shared';
import { useStudiiData } from '@/contexts/studii-data-context';
import { DEMO_FRIEND_NAMES } from '@/data/demo-phase2-data';

const allFriends = [
  {
    id: 1,
    name: 'Sarah Chen',
    image: 'https://images.unsplash.com/photo-1758525861586-1c8c8e424dc8?w=200&h=200&fit=crop',
    status: 'active',
    activity: 'Studying Physics',
    hours: '124h',
    currentSession: '1h 23m',
  },
  {
    id: 2,
    name: 'Alex Kumar',
    image: 'https://images.unsplash.com/photo-1770235622334-7b721261a230?w=200&h=200&fit=crop',
    status: 'active',
    activity: 'Studying Math',
    hours: '98h',
    currentSession: '45m',
  },
  {
    id: 3,
    name: 'Maya Johnson',
    image: 'https://images.unsplash.com/photo-1758521540968-3af0cc2074a0?w=200&h=200&fit=crop',
    status: 'active',
    activity: 'Studying Chemistry',
    hours: '156h',
    currentSession: '2h 10m',
  },
  {
    id: 4,
    name: 'David Park',
    image: 'https://images.unsplash.com/photo-1758270705518-b61b40527e76?w=200&h=200&fit=crop',
    status: 'inactive',
    activity: 'Last seen 2h ago',
    hours: '87h',
  },
  {
    id: 5,
    name: 'Emily Rodriguez',
    image: 'https://images.unsplash.com/photo-1758598304332-94b40ce7c7b4?w=200&h=200&fit=crop',
    status: 'inactive',
    activity: 'Last seen 5h ago',
    hours: '112h',
  },
  {
    id: 6,
    name: 'Jordan Lee',
    image: 'https://images.unsplash.com/photo-1764032759724-22608ed91af8?w=200&h=200&fit=crop',
    status: 'inactive',
    activity: 'Last seen 1d ago',
    hours: '73h',
  },
  {
    id: 7,
    name: 'Taylor Smith',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    status: 'inactive',
    activity: 'Last seen 3d ago',
    hours: '45h',
  },
  {
    id: 8,
    name: 'Casey Brown',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    status: 'inactive',
    activity: 'Last seen 1w ago',
    hours: '67h',
  },
];

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { stats, loading: statsLoading } = useStudiiData();

  const topBuddies =
    stats &&
    Object.entries(stats.friendOverlapCache)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id, hours]) => ({
        id,
        name: DEMO_FRIEND_NAMES[id] ?? id,
        hours,
        alignment: alignmentScoreFromOverlapHours(hours),
      }));
  
  const activeFriends = allFriends.filter((f) => f.status === 'active');
  const inactiveFriends = allFriends.filter((f) => f.status === 'inactive');

  const filteredActiveFriends = activeFriends.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredInactiveFriends = inactiveFriends.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24 md:pb-8">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-[#508CA4] to-[#508CA4]/90 rounded-[2rem] p-8 shadow-xl shadow-[#508CA4]/40 text-white border-2 border-[#508CA4]/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Study Buddies</h1>
            <p className="text-white/90 font-medium text-lg">
              {activeFriends.length} friends studying now
            </p>
          </div>
          <button className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
            <UserPlus className="w-8 h-8" />
          </button>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="text-3xl font-bold">{allFriends.length}</div>
            <div className="text-sm text-white/80 font-medium">Total Friends</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="text-3xl font-bold">{activeFriends.length}</div>
            <div className="text-sm text-white/80 font-medium">Active Now</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="text-3xl font-bold">453h</div>
            <div className="text-sm text-white/80 font-medium">Group Total</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-2 shadow-lg border-2 border-white/80">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#22223B]/40" />
          <input
            type="text"
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent rounded-2xl pl-14 pr-6 py-4 text-lg font-medium text-[#22223B] placeholder:text-[#22223B]/40 focus:outline-none"
          />
        </div>
      </div>

      {/* Phase 2: top study buddies (overlap) */}
      <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 shadow-lg border-2 border-[#508CA4]/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#508CA4]/15 flex items-center justify-center">
            <Users className="w-6 h-6 text-[#508CA4]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#22223B]">Top study buddies</h2>
            <p className="text-sm text-[#22223B]/60 font-medium">Overlap in the last 30 days</p>
          </div>
        </div>
        {statsLoading || !topBuddies ? (
          <p className="text-sm text-[#22223B]/50 font-medium">Loading overlap…</p>
        ) : (
          <ol className="space-y-3">
            {topBuddies.map((b, i) => (
              <li
                key={b.id}
                className={`flex items-center justify-between rounded-2xl px-4 py-3 border-2 ${
                  i === 0 ? "border-[#508CA4] bg-[#508CA4]/10" : "border-white/80 bg-amber-50/50"
                }`}
              >
                <span className="font-bold text-[#22223B]">
                  #{i + 1} {b.name}
                  {i === 0 ? (
                    <span className="ml-2 text-xs font-bold text-[#508CA4]">Study buddy highlight</span>
                  ) : null}
                </span>
                <span className="text-sm font-semibold text-[#22223B]/70">
                  {b.hours.toFixed(1)}h · {b.alignment}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Active Friends */}
      {filteredActiveFriends.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-[#508CA4] rounded-full animate-pulse shadow-lg shadow-[#508CA4]/40"></div>
            <h2 className="text-2xl font-bold text-[#22223B]">
              Active ({filteredActiveFriends.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredActiveFriends.map((friend) => (
              <div
                key={friend.id}
                className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 shadow-lg border-2 border-white/80 hover:scale-[1.02] hover:shadow-xl transition-all group"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    <img
                      src={friend.image}
                      alt={friend.name}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#508CA4]/40"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#508CA4] rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[#22223B] text-lg mb-1">{friend.name}</div>
                    <div className="text-sm text-[#22223B]/60 font-medium">{friend.activity}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1 bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl p-3 border-2 border-amber-200/50">
                    <div className="text-xs text-[#22223B]/60 font-bold uppercase mb-0.5">Current Session</div>
                    <div className="text-lg font-bold text-[#22223B]">{friend.currentSession}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t-2 border-slate-200/50">
                  <div>
                    <div className="text-xs text-[#22223B]/60 font-medium">Total Time</div>
                    <div className="text-xl font-bold text-[#508CA4]">{friend.hours}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="w-10 h-10 bg-[#508CA4]/10 rounded-xl flex items-center justify-center hover:bg-[#508CA4]/20 transition-all">
                      <MessageCircle className="w-5 h-5 text-[#508CA4]" />
                    </button>
                    <button className="w-10 h-10 bg-[#508CA4]/10 rounded-xl flex items-center justify-center hover:bg-[#508CA4]/20 transition-all">
                      <TrendingUp className="w-5 h-5 text-[#508CA4]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Offline Friends */}
      {filteredInactiveFriends.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <h2 className="text-2xl font-bold text-[#22223B]">
              Offline ({filteredInactiveFriends.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredInactiveFriends.map((friend) => (
              <div
                key={friend.id}
                className="bg-white/60 backdrop-blur-md rounded-[2rem] p-5 shadow-lg border-2 border-white/80 opacity-70 hover:opacity-100 transition-opacity"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-3">
                    <img
                      src={friend.image}
                      alt={friend.name}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-gray-300/40"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-300 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="font-bold text-[#22223B] mb-1">{friend.name}</div>
                  <div className="text-xs text-[#22223B]/60 font-medium mb-3">{friend.activity}</div>
                  <div className="text-sm font-bold text-[#22223B]/70 bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200">
                    {friend.hours} total
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {searchQuery && filteredActiveFriends.length === 0 && filteredInactiveFriends.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-white/80 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Search className="w-10 h-10 text-[#22223B]/40" />
          </div>
          <p className="text-xl font-bold text-[#22223B]/60">No friends found</p>
          <p className="text-[#22223B]/40 font-medium">Try a different search term</p>
        </div>
      )}
    </div>
  );
}
