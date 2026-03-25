import { Clock, Flame, Users } from 'lucide-react';

/**
 * Weekly hours card with progress toward a goal (matches Figma stat tile).
 */
export function StudyStatWeekCard() {
  return (
    <div className="rounded-[2rem] border-2 border-white/80 bg-white/80 p-6 shadow-lg backdrop-blur-md">
      <div className="mb-4 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#508CA4] to-[#508CA4]/80 shadow-lg shadow-[#508CA4]/30">
          <Clock className="h-7 w-7 text-white" aria-hidden />
        </div>
        <div>
          <div className="text-3xl font-bold text-[#22223B]">12.5h</div>
          <div className="text-sm font-semibold text-[#22223B]/60">This week</div>
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200/50">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#508CA4] to-[#508CA4]/80"
          style={{ width: '62.5%' }}
        />
      </div>
      <p className="mt-2 text-xs font-medium text-[#22223B]/60">Goal: 20h per week</p>
    </div>
  );
}

/**
 * Streak counter with highlight badge (Figma stat tile).
 */
export function StudyStatStreakCard() {
  return (
    <div className="rounded-[2rem] border-2 border-white/80 bg-white/80 p-6 shadow-lg backdrop-blur-md">
      <div className="mb-4 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30">
          <Flame className="h-7 w-7 text-white" aria-hidden />
        </div>
        <div>
          <div className="text-3xl font-bold text-[#22223B]">23</div>
          <div className="text-sm font-semibold text-[#22223B]/60">Day streak</div>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1">
        <span className="text-2xl" aria-hidden>
          🔥
        </span>
        <span className="rounded-lg bg-amber-500/10 px-2 py-1 text-xs font-bold text-amber-600">
          Personal best!
        </span>
      </div>
    </div>
  );
}

/**
 * Study buddies count with “studying now” hint (Figma stat tile).
 */
export function StudyStatBuddiesCard() {
  return (
    <div className="rounded-[2rem] border-2 border-white/80 bg-white/80 p-6 shadow-lg backdrop-blur-md">
      <div className="mb-4 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#508CA4] to-[#508CA4]/80 shadow-lg shadow-[#508CA4]/30">
          <Users className="h-7 w-7 text-white" aria-hidden />
        </div>
        <div>
          <div className="text-3xl font-bold text-[#22223B]">8</div>
          <div className="text-sm font-semibold text-[#22223B]/60">Study buddies</div>
        </div>
      </div>
      <p className="inline-block rounded-lg bg-[#508CA4]/10 px-2 py-1 text-xs font-bold text-[#508CA4]">
        3 studying now
      </p>
    </div>
  );
}
