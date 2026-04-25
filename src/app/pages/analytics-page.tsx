import { TrendingUp, Award, Target, Calendar, Clock, Flame, Trophy, Book } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, CartesianGrid, Tooltip } from 'recharts';
import { Phase2AnalyticsSection } from '@/app/components/phase2/phase2-analytics-section';

const weekData = [
  { day: 'Mon', hours: 3.5, sessions: 6 },
  { day: 'Tue', hours: 2.8, sessions: 5 },
  { day: 'Wed', hours: 4.2, sessions: 8 },
  { day: 'Thu', hours: 3.1, sessions: 6 },
  { day: 'Fri', hours: 2.5, sessions: 4 },
  { day: 'Sat', hours: 1.8, sessions: 3 },
  { day: 'Sun', hours: 2.6, sessions: 5 },
];

const monthData = [
  { week: 'Week 1', hours: 18.5 },
  { week: 'Week 2', hours: 22.3 },
  { week: 'Week 3', hours: 19.8 },
  { week: 'Week 4', hours: 23.1 },
];

const subjects = [
  { name: 'Mathematics', hours: 18.5, sessions: 34, color: 'bg-[#508CA4]', textColor: 'text-[#508CA4]' },
  { name: 'Physics', hours: 12.3, sessions: 22, color: 'bg-teal-500', textColor: 'text-teal-500' },
  { name: 'Chemistry', hours: 8.7, sessions: 16, color: 'bg-cyan-500', textColor: 'text-cyan-500' },
  { name: 'Biology', hours: 5.7, sessions: 10, color: 'bg-sky-500', textColor: 'text-sky-500' },
];

const achievements = [
  {
    title: 'Marathon Achiever',
    description: 'Completed 50+ hours this month',
    icon: Trophy,
    color: 'from-amber-500 to-orange-500',
    earned: true,
  },
  {
    title: 'Consistency King',
    description: '23 day study streak',
    icon: Flame,
    color: 'from-red-500 to-orange-500',
    earned: true,
  },
  {
    title: 'Early Bird',
    description: 'Started 10 morning sessions',
    icon: Clock,
    color: 'from-blue-500 to-cyan-500',
    earned: true,
  },
  {
    title: 'Scholar',
    description: 'Complete 100 hours total',
    icon: Book,
    color: 'from-purple-500 to-pink-500',
    earned: false,
  },
];

export default function AnalyticsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#508CA4] to-[#508CA4]/90 rounded-[2rem] p-8 shadow-xl shadow-[#508CA4]/40 text-white border-2 border-[#508CA4]/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Your Analytics</h1>
            <p className="text-white/90 font-medium text-lg">Track your progress and insights</p>
          </div>
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
            <TrendingUp className="w-8 h-8" />
          </div>
        </div>
      </div>

      <Phase2AnalyticsSection />

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 shadow-lg border-2 border-white/80">
          <div className="w-12 h-12 bg-gradient-to-br from-[#508CA4] to-[#508CA4]/80 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-[#508CA4]/30">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div className="text-3xl font-bold text-[#22223B] mb-1">45.2h</div>
          <div className="text-sm text-[#22223B]/60 font-semibold mb-2">This month</div>
          <div className="text-xs text-[#508CA4] font-bold bg-[#508CA4]/10 inline-block px-2 py-1 rounded-lg">
            +12% from last month
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 shadow-lg border-2 border-white/80">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-amber-500/30">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div className="text-3xl font-bold text-[#22223B] mb-1">23</div>
          <div className="text-sm text-[#22223B]/60 font-semibold mb-2">Day streak</div>
          <div className="text-xs text-amber-600 font-bold bg-amber-500/10 inline-block px-2 py-1 rounded-lg">
            🔥 Personal best!
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 shadow-lg border-2 border-white/80">
          <div className="w-12 h-12 bg-gradient-to-br from-[#508CA4] to-[#508CA4]/80 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-[#508CA4]/30">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div className="text-3xl font-bold text-[#22223B] mb-1">87</div>
          <div className="text-sm text-[#22223B]/60 font-semibold mb-2">Sessions</div>
          <div className="text-xs text-[#508CA4] font-bold bg-[#508CA4]/10 inline-block px-2 py-1 rounded-lg">
            This month
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 shadow-lg border-2 border-white/80">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-purple-500/30">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div className="text-3xl font-bold text-[#22223B] mb-1">31</div>
          <div className="text-sm text-[#22223B]/60 font-semibold mb-2">Min avg</div>
          <div className="text-xs text-purple-600 font-bold bg-purple-500/10 inline-block px-2 py-1 rounded-lg">
            Per session
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Chart */}
        <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 shadow-lg border-2 border-white/80">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-[#22223B] mb-1">This Week</h3>
              <p className="text-sm text-[#22223B]/60 font-medium">20.5 hours • 37 sessions</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-[#508CA4] to-[#508CA4]/80 rounded-2xl flex items-center justify-center shadow-lg shadow-[#508CA4]/30">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>

          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weekData}>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#22223B', fontSize: 12, fontWeight: 600, opacity: 0.6 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#22223B', fontSize: 12, fontWeight: 600, opacity: 0.6 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '16px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  padding: '12px',
                }}
              />
              <Bar dataKey="hours" fill="#508CA4" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 shadow-lg border-2 border-white/80">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-[#22223B] mb-1">Monthly Trend</h3>
              <p className="text-sm text-[#22223B]/60 font-medium">83.7 hours total</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-[#508CA4] to-[#508CA4]/80 rounded-2xl flex items-center justify-center shadow-lg shadow-[#508CA4]/30">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>

          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="week"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#22223B', fontSize: 12, fontWeight: 600, opacity: 0.6 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#22223B', fontSize: 12, fontWeight: 600, opacity: 0.6 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '16px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  padding: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="hours"
                stroke="#508CA4"
                strokeWidth={3}
                dot={{ fill: '#508CA4', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Subject Breakdown */}
      <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 shadow-lg border-2 border-white/80">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-[#508CA4] to-[#508CA4]/80 rounded-2xl flex items-center justify-center shadow-lg shadow-[#508CA4]/30">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#22223B]">Subject Breakdown</h3>
            <p className="text-sm text-[#22223B]/60 font-medium">Your focus areas this month</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {subjects.map((subject, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border-2 border-white/80 shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-[#22223B]">{subject.name}</h4>
                <div className={`w-3 h-3 ${subject.color} rounded-full shadow-lg`}></div>
              </div>
              <div className="text-3xl font-bold text-[#22223B] mb-1">{subject.hours}h</div>
              <div className="text-sm text-[#22223B]/60 font-medium mb-3">{subject.sessions} sessions</div>
              <div className="h-2 bg-slate-200/50 rounded-full overflow-hidden">
                <div
                  className={`h-full ${subject.color} rounded-full transition-all`}
                  style={{ width: `${(subject.hours / 20) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-[#22223B]">Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement, index) => {
            const Icon = achievement.icon;
            return (
              <div
                key={index}
                className={`${
                  achievement.earned
                    ? `bg-gradient-to-br ${achievement.color} text-white`
                    : 'bg-white/60 text-[#22223B]/50'
                } rounded-[2rem] p-6 shadow-lg border-2 ${
                  achievement.earned ? 'border-white/20' : 'border-white/80'
                } transition-all hover:scale-[1.02]`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-16 h-16 ${
                      achievement.earned ? 'bg-white/20' : 'bg-gray-200'
                    } backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg`}
                  >
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg mb-1">{achievement.title}</h4>
                    <p
                      className={`text-sm font-medium ${
                        achievement.earned ? 'text-white/90' : 'text-[#22223B]/40'
                      }`}
                    >
                      {achievement.description}
                    </p>
                    {!achievement.earned && (
                      <div className="mt-2 text-xs font-bold bg-[#22223B]/10 inline-block px-2 py-1 rounded-lg">
                        Locked
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
