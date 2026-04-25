import { TrendingUp, Award, Target, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer } from 'recharts';

const weekData = [
  { day: 'Mon', hours: 3.5 },
  { day: 'Tue', hours: 2.8 },
  { day: 'Wed', hours: 4.2 },
  { day: 'Thu', hours: 3.1 },
  { day: 'Fri', hours: 2.5 },
  { day: 'Sat', hours: 1.8 },
  { day: 'Sun', hours: 2.6 }
];

const subjects = [
  { name: 'Mathematics', hours: 18.5, color: 'bg-[#508CA4]' },
  { name: 'Physics', hours: 12.3, color: 'bg-teal-500' },
  { name: 'Chemistry', hours: 8.7, color: 'bg-cyan-500' }
];

export function AnalyticsScreen() {
  return (
    <div className="h-full bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 pt-16 px-6 pb-6 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#22223B] mb-1">Analytics</h1>
        <p className="text-sm text-[#22223B]/60 font-semibold">Your study insights</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-4 shadow-lg border-2 border-[#508CA4]/20">
          <div className="w-10 h-10 bg-gradient-to-br from-[#508CA4] to-[#508CA4]/80 rounded-2xl flex items-center justify-center mb-2 shadow-lg shadow-[#508CA4]/30">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div className="text-2xl font-bold text-[#22223B]">45.2h</div>
          <div className="text-xs text-[#22223B]/60">This month</div>
          <div className="text-xs text-[#508CA4] font-bold mt-1 bg-[#508CA4]/10 inline-block px-2 py-0.5 rounded-lg">+12%</div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-4 shadow-lg border-2 border-[#508CA4]/20">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mb-2 shadow-lg shadow-amber-500/30">
            <Award className="w-5 h-5 text-white" />
          </div>
          <div className="text-2xl font-bold text-[#22223B]">23</div>
          <div className="text-xs text-[#22223B]/60">Study streak</div>
          <div className="text-xs text-amber-600 font-bold mt-1 bg-amber-500/10 inline-block px-2 py-0.5 rounded-lg">🔥 Best!</div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-5 shadow-lg border-2 border-[#508CA4]/20 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-[#22223B] text-sm">This Week</h3>
            <p className="text-xs text-[#22223B]/60 font-medium">20.5 hours total</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-[#508CA4] to-[#508CA4]/80 rounded-2xl flex items-center justify-center shadow-lg shadow-[#508CA4]/30">
            <Calendar className="w-5 h-5 text-white" />
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={weekData}>
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#22223B', fontSize: 11, fontWeight: 600, opacity: 0.6 }}
            />
            <Bar 
              dataKey="hours" 
              fill="#508CA4" 
              radius={[10, 10, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Subjects Breakdown */}
      <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-5 shadow-lg border-2 border-[#508CA4]/20 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-[#508CA4] to-[#508CA4]/80 rounded-2xl flex items-center justify-center shadow-lg shadow-[#508CA4]/30">
            <Target className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-bold text-[#22223B] text-sm">Top Subjects</h3>
        </div>
        
        <div className="space-y-3">
          {subjects.map((subject, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#22223B] font-bold">{subject.name}</span>
                <span className="text-sm text-[#22223B] font-bold bg-[#508CA4]/10 px-2.5 py-1 rounded-lg">{subject.hours}h</span>
              </div>
              <div className="h-3 bg-slate-200/50 rounded-full overflow-hidden shadow-inner">
                <div 
                  className={`h-full ${subject.color} rounded-full transition-all shadow-sm`}
                  style={{ width: `${(subject.hours / 20) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievement */}
      <div className="bg-gradient-to-br from-[#508CA4] to-[#508CA4]/90 rounded-[2rem] p-5 shadow-xl shadow-[#508CA4]/40 text-white border-2 border-[#508CA4]/50">
        <div className="flex items-start gap-3">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <Award className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold mb-1 text-base">Marathon Achiever</h3>
            <p className="text-sm text-white/90 font-medium">Completed 50+ hours this month! Keep up the amazing work.</p>
          </div>
        </div>
      </div>
    </div>
  );
}