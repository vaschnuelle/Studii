import { Play, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Hero welcome block with primary CTA to start a focus session (Figma home hero).
 */
export function HomeWelcomeCard() {
  return (
    <div className="rounded-[2rem] border-2 border-[#508CA4]/50 bg-gradient-to-br from-[#508CA4] to-[#508CA4]/90 p-8 text-white shadow-xl shadow-[#508CA4]/40">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="mb-2 text-3xl font-bold">Welcome back! 👋</h2>
          <p className="font-medium text-white/90">Ready to crush your study goals today?</p>
        </div>
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 shadow-lg backdrop-blur-sm">
          <Trophy className="h-8 w-8" aria-hidden />
        </div>
      </div>
      <Link
        to="/focus"
        className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 font-bold text-[#508CA4] shadow-lg transition-transform hover:scale-105"
      >
        <Play className="h-5 w-5" aria-hidden />
        Start Study Session
      </Link>
    </div>
  );
}
