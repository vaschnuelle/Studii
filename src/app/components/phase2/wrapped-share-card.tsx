import { forwardRef } from "react";
import type { PersonalityArchetype } from "@studii/shared";
import { DEMO_FRIEND_NAMES } from "@/data/demo-phase2-data";

export interface WrappedShareCardProps {
  /** DOM id used by html-to-canvas export. */
  exportId?: string;
  personality: PersonalityArchetype;
  totalHours: number;
  topBuddyId: string | null;
  /** Resolved display name for share card (Firestore friends or demo map). */
  topBuddyDisplayName?: string | null;
  streak: number;
  tagline: string;
}

/**
 * Brand-aligned share card surface for client-side capture (html-to-canvas).
 */
export const WrappedShareCard = forwardRef<HTMLDivElement, WrappedShareCardProps>(
  function WrappedShareCard(
    {
      exportId = "studii-wrapped-share-card",
      personality,
      totalHours,
      topBuddyId,
      topBuddyDisplayName,
      streak,
      tagline,
    },
    ref
  ) {
    const buddyName =
      topBuddyDisplayName ??
      (topBuddyId ? DEMO_FRIEND_NAMES[topBuddyId] ?? topBuddyId : "—");

    return (
      <div
        ref={ref}
        id={exportId}
        className="w-[320px] sm:w-[360px] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/30"
        style={{
          background: "linear-gradient(145deg, #508CA4 0%, #3d6d82 45%, #22223B 100%)",
        }}
      >
        <div className="p-8 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70 mb-2">Studii Wrapped</p>
          <h2 className="text-3xl font-black leading-tight mb-6">Your study era</h2>

          <div className="space-y-4 text-lg">
            <div className="flex justify-between gap-4 border-b border-white/20 pb-3">
              <span className="text-white/80 font-medium">Personality</span>
              <span className="font-bold text-right">{personality}</span>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/20 pb-3">
              <span className="text-white/80 font-medium">Total hours (30d)</span>
              <span className="font-bold">{totalHours.toFixed(1)}h</span>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/20 pb-3">
              <span className="text-white/80 font-medium">#1 study buddy</span>
              <span className="font-bold text-right truncate max-w-[55%]">{buddyName}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-white/80 font-medium">Streak</span>
              <span className="font-bold">{streak} days</span>
            </div>
          </div>

          <p className="mt-8 text-center text-white/90 font-semibold italic leading-snug">&ldquo;{tagline}&rdquo;</p>
          <p className="mt-6 text-center text-xs text-white/50">studii.app</p>
        </div>
      </div>
    );
  }
);
