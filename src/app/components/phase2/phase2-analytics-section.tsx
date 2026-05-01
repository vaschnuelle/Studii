import { Link } from "react-router";
import { Sparkles, Users } from "lucide-react";
import { alignmentScoreFromOverlapHours } from "@studii/shared";
import { useStudiiData } from "@/contexts/studii-data-context";
import { DEMO_FRIEND_NAMES } from "@/data/demo-phase2-data";
import { PersonalityBadge } from "@/app/components/phase2/personality-badge";
import { ProductivityHeatmap, WeekdayStrip } from "@/app/components/phase2/productivity-heatmap";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * Phase 2 insights block for the Analytics page: personality, peaks preview, buddies, Wrapped CTA.
 */
export function Phase2AnalyticsSection() {
  const { stats, wrappedSummary, loading } = useStudiiData();

  if (loading || !stats || !wrappedSummary) {
    return (
      <div className="rounded-[2rem] border-2 border-white/80 bg-white/50 p-6 text-center text-[#22223B]/50 font-semibold">
        Loading insights…
      </div>
    );
  }

  const topThree = Object.entries(stats.friendOverlapCache)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id, hours]) => ({
      id,
      name: DEMO_FRIEND_NAMES[id] ?? id,
      hours,
      alignment: alignmentScoreFromOverlapHours(hours),
    }));

  const powerDay = WEEKDAYS[wrappedSummary.powerDay] ?? "—";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#22223B]">Wrapped insights</h2>
          <p className="text-sm text-[#22223B]/60 font-medium">
            Personality, peaks, and buddy overlap — open Wrapped for the full story.
          </p>
        </div>
        <Link
          to="/wrapped"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#508CA4] to-[#3d6d82] text-white px-6 py-3 font-bold shadow-lg shadow-[#508CA4]/30 hover:opacity-95 transition-opacity"
        >
          <Sparkles className="w-5 h-5" />
          Open Wrapped
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PersonalityBadge personality={stats.personality} />
        <div className="rounded-[2rem] border-2 border-white/80 bg-white/80 p-6 shadow-lg">
          <h3 className="text-lg font-bold text-[#22223B] mb-1">Productivity peaks</h3>
          <p className="text-sm text-[#22223B]/60 mb-4">
            Strongest around <strong>{wrappedSummary.powerHour}:00</strong>, best weekday{" "}
            <strong>{powerDay}</strong>.
          </p>
          <ProductivityHeatmap hourDistribution={stats.last30dHourDistribution} />
          <div className="mt-6">
            <WeekdayStrip dayDistribution={stats.last30dDayDistribution} />
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border-2 border-white/80 bg-white/80 p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#508CA4]/15 flex items-center justify-center">
            <Users className="w-6 h-6 text-[#508CA4]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#22223B]">Top study buddies</h3>
            <p className="text-sm text-[#22223B]/60">Overlap hours (last 30 days)</p>
          </div>
        </div>
        <ul className="space-y-2">
          {topThree.map((b, i) => (
            <li
              key={b.id}
              className="flex justify-between items-center rounded-xl bg-amber-50/80 px-4 py-3 border border-amber-100"
            >
              <span className="font-bold text-[#22223B]">
                #{i + 1} {b.name}
              </span>
              <span className="text-sm font-semibold text-[#22223B]/70">
                {b.hours.toFixed(1)}h · {b.alignment} pts
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
