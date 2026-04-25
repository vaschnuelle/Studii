import { Search, UserPlus } from 'lucide-react';

const allFriends = [
  {
    name: 'Sarah Chen',
    image: 'https://images.unsplash.com/photo-1758525861586-1c8c8e424dc8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdvbWFuJTIwc3R1ZHlpbmclMjBib29rc3xlbnwxfHx8fDE3NzQzMDE2ODN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'active',
    activity: 'Studying Physics',
    hours: '124h'
  },
  {
    name: 'Alex Kumar',
    image: 'https://images.unsplash.com/photo-1770235622334-7b721261a230?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwc3R1ZHlpbmclMjBmb2N1c2VkJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzc0MzAxNjgzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'active',
    activity: 'Studying Math',
    hours: '98h'
  },
  {
    name: 'Maya Johnson',
    image: 'https://images.unsplash.com/photo-1758521540968-3af0cc2074a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xsZWdlJTIwc3R1ZGVudCUyMGhlYWRzaG90JTIwcG9ydHJhaXR8ZW58MXx8fHwxNzc0MzAxNjg0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'active',
    activity: 'Studying Chemistry',
    hours: '156h'
  },
  {
    name: 'David Park',
    image: 'https://images.unsplash.com/photo-1758270705518-b61b40527e76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXZlcnNlJTIwc3R1ZGVudCUyMHN0dWR5aW5nJTIwbGFwdG9wfGVufDF8fHx8MTc3NDMwMTY4NXww&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'inactive',
    activity: 'Last seen 2h ago',
    hours: '87h'
  },
  {
    name: 'Emily Rodriguez',
    image: 'https://images.unsplash.com/photo-1758598304332-94b40ce7c7b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaWxsZW5uaWFsJTIwcHJvZmVzc2lvbmFsJTIwaGVhZHNob3R8ZW58MXx8fHwxNzc0MzAxNjg1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'inactive',
    activity: 'Last seen 5h ago',
    hours: '112h'
  },
  {
    name: 'Jordan Lee',
    image: 'https://images.unsplash.com/photo-1764032759724-22608ed91af8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnZW4lMjB6JTIwc3R1ZGVudCUyMGhhcHB5JTIwcG9ydHJhaXR8ZW58MXx8fHwxNzc0MzAxNjg1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'inactive',
    activity: 'Last seen 1d ago',
    hours: '73h'
  }
];

export function FriendsScreen() {
  const activeFriends = allFriends.filter(f => f.status === 'active');
  const inactiveFriends = allFriends.filter(f => f.status === 'inactive');

  return (
    <div className="h-full bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 pt-16 px-6 pb-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#22223B]">Friends</h1>
          <p className="text-sm text-[#22223B]/60 font-semibold">{activeFriends.length} studying now</p>
        </div>
        <button className="w-12 h-12 bg-gradient-to-br from-[#508CA4] to-[#508CA4]/90 rounded-2xl flex items-center justify-center shadow-xl shadow-[#508CA4]/40 hover:scale-105 active:scale-95 transition-all">
          <UserPlus className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#22223B]/40" />
        <input 
          type="text" 
          placeholder="Search friends..."
          className="w-full bg-white/80 backdrop-blur-md rounded-[1.5rem] pl-12 pr-4 py-3.5 text-sm border-2 border-white/50 shadow-lg focus:outline-none focus:border-[#508CA4]/30 focus:ring-4 focus:ring-[#508CA4]/10 transition-all font-medium text-[#22223B] placeholder:text-[#22223B]/40"
        />
      </div>

      {/* Friends List */}
      <div className="flex-1 overflow-y-auto -mr-6 pr-6 space-y-6">
        {/* Active Friends */}
        <div>
          <h2 className="text-xs font-bold text-[#22223B]/70 uppercase tracking-wide mb-3 bg-white/60 inline-block px-3 py-1.5 rounded-xl">
            Active ({activeFriends.length})
          </h2>
          <div className="space-y-2">
            {activeFriends.map((friend, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-md rounded-[1.5rem] p-4 shadow-lg border-2 border-white/50 flex items-center gap-3 hover:scale-[1.02] transition-transform">
                <div className="relative">
                  <img 
                    src={friend.image} 
                    alt={friend.name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#508CA4]/40"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#508CA4] rounded-full border-2 border-white shadow-lg"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[#22223B] text-sm">{friend.name}</div>
                  <div className="text-xs text-[#22223B]/60 font-medium">{friend.activity}</div>
                </div>
                <div className="text-right bg-[#508CA4]/10 px-3 py-2 rounded-xl border border-[#508CA4]/20">
                  <div className="text-xs font-bold text-[#508CA4]">{friend.hours}</div>
                  <div className="text-xs text-[#22223B]/50">total</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inactive Friends */}
        <div>
          <h2 className="text-xs font-bold text-[#22223B]/70 uppercase tracking-wide mb-3 bg-white/60 inline-block px-3 py-1.5 rounded-xl">
            Offline ({inactiveFriends.length})
          </h2>
          <div className="space-y-2">
            {inactiveFriends.map((friend, index) => (
              <div key={index} className="bg-white/60 backdrop-blur-md rounded-[1.5rem] p-4 shadow-lg border-2 border-white/50 flex items-center gap-3 opacity-60">
                <div className="relative">
                  <img 
                    src={friend.image} 
                    alt={friend.name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-gray-300/40"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-300 rounded-full border-2 border-white shadow-lg"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[#22223B] text-sm">{friend.name}</div>
                  <div className="text-xs text-[#22223B]/60 font-medium">{friend.activity}</div>
                </div>
                <div className="text-right bg-gray-100 px-3 py-2 rounded-xl border border-gray-200">
                  <div className="text-xs font-bold text-[#22223B]/70">{friend.hours}</div>
                  <div className="text-xs text-[#22223B]/40">total</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}