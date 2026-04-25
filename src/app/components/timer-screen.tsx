import { Pause, X, Coffee } from 'lucide-react';

export function TimerScreen() {
  return (
    <div className="h-full bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 pt-16 px-6 pb-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button className="w-11 h-11 bg-white/80 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/50 hover:scale-105 transition-transform">
          <X className="w-5 h-5 text-[#22223B]" />
        </button>
        <span className="text-sm font-bold text-[#22223B]/70 bg-white/60 px-4 py-2 rounded-xl">Pomodoro Session</span>
        <div className="w-11"></div>
      </div>

      {/* Pomodoro Progress Indicators */}
      <div className="flex justify-center gap-2 mb-8">
        <div className="w-3 h-3 rounded-full bg-[#508CA4] shadow-lg shadow-[#508CA4]/40"></div>
        <div className="w-3 h-3 rounded-full bg-[#508CA4] shadow-lg shadow-[#508CA4]/40"></div>
        <div className="w-3 h-3 rounded-full bg-[#508CA4]/30"></div>
        <div className="w-3 h-3 rounded-full bg-[#508CA4]/30"></div>
      </div>

      {/* Timer Circle */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative">
          {/* Outer decorative ring */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#508CA4]/20 to-[#508CA4]/10 rounded-full blur-2xl"></div>
          
          {/* Outer Ring */}
          <svg className="w-72 h-72 -rotate-90 relative" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="10"
              className="opacity-30"
            />
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="#508CA4"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray="565.48"
              strokeDashoffset="141.37"
              className="transition-all duration-1000 drop-shadow-lg"
            />
          </svg>
          
          {/* Timer Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-7xl font-bold text-[#22223B] tracking-tight">25:00</div>
            <div className="text-sm text-[#22223B]/60 mt-2 font-semibold">Focus Time</div>
            <div className="mt-3 px-4 py-1.5 bg-[#508CA4]/10 rounded-xl border border-[#508CA4]/20">
              <span className="text-xs font-bold text-[#508CA4]">Pomodoro 2/4</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subject & Break Info */}
      <div className="space-y-3 mb-6">
        <div className="bg-white/80 backdrop-blur-md rounded-[1.5rem] p-4 shadow-lg border-2 border-[#508CA4]/20">
          <div className="text-xs text-[#22223B]/60 mb-1 font-semibold uppercase tracking-wide">Current Subject</div>
          <div className="text-lg font-bold text-[#22223B]">Mathematics</div>
        </div>
        
        <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-[1.5rem] p-4 shadow-lg border-2 border-amber-200/50 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/80 rounded-2xl flex items-center justify-center shadow-md">
            <Coffee className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-[#22223B]/60 font-semibold">Next Break</div>
            <div className="text-sm font-bold text-[#22223B]">5 min break after this</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <button className="flex-1 bg-white/80 backdrop-blur-md rounded-[1.5rem] py-4 shadow-lg border-2 border-white/50 flex items-center justify-center gap-2 font-bold text-[#22223B] hover:scale-[1.02] active:scale-[0.98] transition-all">
          <Pause className="w-5 h-5" />
          Pause
        </button>
        <button className="flex-1 bg-gradient-to-r from-[#508CA4] to-[#508CA4]/90 hover:from-[#508CA4]/90 hover:to-[#508CA4]/80 text-white font-bold py-4 rounded-[1.5rem] shadow-xl shadow-[#508CA4]/40 transition-all hover:scale-[1.02] active:scale-[0.98]">
          Skip
        </button>
      </div>
    </div>
  );
}