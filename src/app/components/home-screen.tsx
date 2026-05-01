import { Clock, Users } from 'lucide-react';
import { StudiiLogoCombined } from '@/app/components/brand/studii-logo';

const friends = [
  {
    name: 'Sarah Chen',
    image: 'https://images.unsplash.com/photo-1758525861586-1c8c8e424dc8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdvbWFuJTIwc3R1ZHlpbmclMjBib29rc3xlbnwxfHx8fDE3NzQzMDE2ODN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'Studying Physics',
    duration: '1h 23m'
  },
  {
    name: 'Alex Kumar',
    image: 'https://images.unsplash.com/photo-1770235622334-7b721261a230?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwc3R1ZHlpbmclMjBmb2N1c2VkJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzc0MzAxNjgzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'Studying Math',
    duration: '45m'
  },
  {
    name: 'Maya Johnson',
    image: 'https://images.unsplash.com/photo-1758521540968-3af0cc2074a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xsZWdlJTIwc3R1ZGVudCUyMGhlYWRzaG90JTIwcG9ydHJhaXR8ZW58MXx8fHwxNzc0MzAxNjg0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'Studying Chemistry',
    duration: '2h 10m'
  }
];

export function HomeScreen() {
  return (
    <div className="h-full bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 pt-16 px-6 pb-6 flex flex-col">
      {/* Header */}
      <div className="mb-8 max-w-full">
        <StudiiLogoCombined
          variant="full"
          className="w-full max-w-sm sm:max-w-md"
          gapClassName="gap-4 sm:gap-5"
          iconClassName="h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem] shrink-0"
          wordmarkClassName="h-12 sm:h-14 min-w-0 flex-1 max-w-none"
          alt="Studii"
          priority
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-4 shadow-lg border-2 border-[#508CA4]/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#508CA4] to-[#508CA4]/80 rounded-2xl flex items-center justify-center shadow-lg shadow-[#508CA4]/30">
              <Clock className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#22223B]">12.5h</div>
          <div className="text-xs text-[#22223B]/60">This week</div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-4 shadow-lg border-2 border-[#508CA4]/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#508CA4] to-[#508CA4]/80 rounded-2xl flex items-center justify-center shadow-lg shadow-[#508CA4]/30">
              <Users className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#22223B]">8</div>
          <div className="text-xs text-[#22223B]/60">Study buddies</div>
        </div>
      </div>

      {/* Friends Studying */}
      <div className="flex-1">
        <h2 className="text-sm font-semibold text-[#22223B]/80 mb-3">Friends Studying Now</h2>
        <div className="space-y-3">
          {friends.map((friend, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-md rounded-[1.5rem] p-4 shadow-lg border-2 border-white/50 flex items-center gap-3">
              <div className="relative">
                <img 
                  src={friend.image} 
                  alt={friend.name}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#508CA4]/30"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#508CA4] rounded-full border-2 border-white shadow-lg"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[#22223B] text-sm truncate">{friend.name}</div>
                <div className="text-xs text-[#22223B]/60">{friend.status}</div>
              </div>
              <div className="text-xs font-bold text-[#508CA4] bg-[#508CA4]/10 px-3 py-1.5 rounded-xl border border-[#508CA4]/20">
                {friend.duration}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <button className="w-full mt-6 bg-gradient-to-r from-[#508CA4] to-[#508CA4]/90 hover:from-[#508CA4]/90 hover:to-[#508CA4]/80 text-white font-bold py-4 rounded-[1.5rem] shadow-xl shadow-[#508CA4]/40 transition-all hover:scale-[1.02] active:scale-[0.98]">
        Start Studying
      </button>
    </div>
  );
}