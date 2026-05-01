import { useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Download, Share2, Sparkles } from "lucide-react";
import html2canvas from "html2canvas";
import { alignmentScoreFromOverlapHours } from "@studii/shared";
import { useStudiiData } from "@/contexts/studii-data-context";
import { DEMO_FRIEND_NAMES } from "@/data/demo-phase2-data";
import { PersonalityBadge, PERSONALITY_COPY } from "@/app/components/phase2/personality-badge";
import { ProductivityHeatmap, WeekdayStrip } from "@/app/components/phase2/productivity-heatmap";
import { WrappedShareCard } from "@/app/components/phase2/wrapped-share-card";
import { downloadWrappedPng } from "@/lib/download-wrapped-png";

const STEP_LABELS = ["Welcome", "Personality", "Buddies", "Peaks", "Wins", "Share"];

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/**
 * Multi-step Studii Wrapped flow: personality, buddies, productivity peaks, biggest wins, share card.
 */
export default function WrappedPage() {
  const { stats, wrappedSummary, wins, loading } = useStudiiData();
  const [step, setStep] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const topBuddies = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.friendOverlapCache)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id, hours]) => ({
        id,
        name: DEMO_FRIEND_NAMES[id] ?? id,
        hours,
        alignment: alignmentScoreFromOverlapHours(hours),
      }));
  }, [stats]);

  const buddyHighlight = topBuddies[0] ?? null;

  const tagline = wrappedSummary
    ? PERSONALITY_COPY[wrappedSummary.personality].blurb
    : "Keep showing up — consistency compounds.";

  if (loading || !stats || !wrappedSummary || !wins) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-[#22223B]/60 font-semibold">
        Loading Wrapped…
      </div>
    );
  }

  async function handleShareDownload() {
    await downloadWrappedPng("studii-wrapped-share-card");
  }

  async function handleNativeShare() {
    const el = document.getElementById("studii-wrapped-share-card");
    if (!el || !navigator.share) {
      await handleShareDownload();
      return;
    }
    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png")
      );
      if (blob && navigator.canShare?.({ files: [new File([blob], "studii-wrapped.png", { type: "image/png" })] })) {
        const file = new File([blob], "studii-wrapped.png", { type: "image/png" });
        await navigator.share({
          files: [file],
          title: "Studii Wrapped",
          text: "My study wrap is in — check out Studii!",
        });
        return;
      }
    } catch {
      /* fall through */
    }
    await handleShareDownload();
  }

  const powerDayLabel = WEEKDAYS[wrappedSummary.powerDay] ?? "—";
  const powerHourLabel = `${wrappedSummary.powerHour}:00`;

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-28 md:pb-10">
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/"
          className="text-sm font-bold text-[#508CA4] hover:underline"
        >
          ← Home
        </Link>
        <span className="text-xs font-bold text-[#22223B]/50 uppercase tracking-widest">
          Wrapped · {STEP_LABELS[step]}
        </span>
      </div>

      <div className="flex gap-1 justify-center flex-wrap">
        {STEP_LABELS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setStep(i)}
            className={`h-2 rounded-full transition-all ${
              i === step ? "w-8 bg-[#508CA4]" : "w-2 bg-[#22223B]/20"
            }`}
            aria-label={`Go to step ${i + 1}`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.22 }}
          className="min-h-[320px]"
        >
          {step === 0 && (
            <div className="text-center space-y-6 pt-4">
              <div className="inline-flex w-20 h-20 rounded-3xl bg-gradient-to-br from-[#508CA4] to-[#22223B] items-center justify-center shadow-xl">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-black text-[#22223B]">Studii Wrapped</h1>
              <p className="text-[#22223B]/70 font-medium leading-relaxed px-4">
                Your habits, your crew, your peaks — a quick tour of how you studied lately.
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <PersonalityBadge personality={stats.personality} size="lg" />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-[#22223B]">Top study buddies</h3>
              <p className="text-sm text-[#22223B]/65 font-medium">
                Ranked by overlapping focus time (last 30 days).
              </p>
              <ul className="space-y-3">
                {topBuddies.map((b, idx) => (
                  <li
                    key={b.id}
                    className={`rounded-2xl border-2 p-4 flex justify-between items-center ${
                      idx === 0 ? "border-[#508CA4] bg-[#508CA4]/10" : "border-white/80 bg-white/70"
                    }`}
                  >
                    <div>
                      <p className="font-bold text-[#22223B]">
                        #{idx + 1} {b.name}
                        {idx === 0 ? (
                          <span className="ml-2 text-xs font-bold text-[#508CA4]">★ Highlight</span>
                        ) : null}
                      </p>
                      <p className="text-xs text-[#22223B]/55">
                        {b.hours.toFixed(1)}h overlap · alignment {b.alignment}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              {buddyHighlight ? (
                <p className="text-sm text-[#22223B]/70">
                  You and <strong>{buddyHighlight.name}</strong> sync up the most — total overlap{" "}
                  <strong>{buddyHighlight.hours.toFixed(1)}h</strong>.
                </p>
              ) : null}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 bg-white/80 rounded-[2rem] border-2 border-white/90 p-6 shadow-lg">
              <div>
                <h3 className="text-xl font-bold text-[#22223B] mb-1">Productivity peaks</h3>
                <p className="text-sm text-[#22223B]/60 font-medium mb-4">
                  Power hour <strong>{powerHourLabel}</strong>, strongest weekday{" "}
                  <strong>{powerDayLabel}</strong>.
                </p>
              </div>
              <ProductivityHeatmap hourDistribution={stats.last30dHourDistribution} />
              <WeekdayStrip dayDistribution={stats.last30dDayDistribution} />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-[#22223B]">Biggest wins</h3>
              <div className="grid gap-3">
                <div className="rounded-2xl bg-white/80 border-2 border-white/90 p-4 shadow-md">
                  <p className="text-xs font-bold text-[#508CA4] uppercase">Longest session</p>
                  <p className="text-2xl font-black text-[#22223B]">{wins.longestSessionMin} min</p>
                </div>
                <div className="rounded-2xl bg-white/80 border-2 border-white/90 p-4 shadow-md">
                  <p className="text-xs font-bold text-[#508CA4] uppercase">Most pomodoros in a day</p>
                  <p className="text-2xl font-black text-[#22223B]">{wins.mostPomodorosInDay}</p>
                </div>
                <div className="rounded-2xl bg-white/80 border-2 border-white/90 p-4 shadow-md">
                  <p className="text-xs font-bold text-[#508CA4] uppercase">Longest streak</p>
                  <p className="text-2xl font-black text-[#22223B]">{wins.longestStreakDays} days</p>
                </div>
                <div className="rounded-2xl bg-white/80 border-2 border-white/90 p-4 shadow-md">
                  <p className="text-xs font-bold text-[#508CA4] uppercase">Most consistent week</p>
                  <p className="text-lg font-bold text-[#22223B]">{wins.mostConsistentWeekLabel}</p>
                </div>
                <div className="rounded-2xl bg-white/80 border-2 border-white/90 p-4 shadow-md">
                  <p className="text-xs font-bold text-[#508CA4] uppercase">Month-over-month</p>
                  <p className="text-lg font-bold text-[#22223B]">
                    {wins.mostImprovedMonthPercent != null
                      ? `${wins.mostImprovedMonthPercent > 0 ? "+" : ""}${wins.mostImprovedMonthPercent}%`
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 flex flex-col items-center">
              <WrappedShareCard
                ref={cardRef}
                personality={wrappedSummary.personality}
                totalHours={wrappedSummary.totalHours}
                topBuddyId={wrappedSummary.topBuddy}
                streak={wrappedSummary.streak}
                tagline={tagline}
              />
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => void handleShareDownload()}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#508CA4] text-white px-6 py-3 font-bold shadow-lg hover:opacity-95"
                >
                  <Download className="w-5 h-5" />
                  Save image
                </button>
                <button
                  type="button"
                  onClick={() => void handleNativeShare()}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#22223B] text-white px-6 py-3 font-bold shadow-lg hover:opacity-95"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between items-center gap-4 pt-2">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="inline-flex items-center gap-1 font-bold text-[#508CA4] disabled:opacity-30"
        >
          <ChevronLeft className="w-5 h-5" /> Back
        </button>
        <button
          type="button"
          onClick={() => setStep((s) => Math.min(STEP_LABELS.length - 1, s + 1))}
          disabled={step === STEP_LABELS.length - 1}
          className="inline-flex items-center gap-1 font-bold text-[#508CA4] disabled:opacity-30"
        >
          Next <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
