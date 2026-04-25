export interface ProductivityHeatmapProps {
  /** 24 floats: hours studied per clock hour (last 30d). */
  hourDistribution: number[];
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * Hour-of-day productivity strip + weekday totals from `users.stats` distributions.
 */
export function ProductivityHeatmap({ hourDistribution }: ProductivityHeatmapProps) {
  const maxH = Math.max(0.01, ...hourDistribution);

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-bold text-[#22223B] mb-3">By hour of day (last 30 days)</h4>
        <div className="flex gap-0.5 items-end h-28">
          {hourDistribution.map((h, i) => {
            const pct = Math.min(100, (h / maxH) * 100);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-[#508CA4] to-[#508CA4]/70 transition-all"
                  style={{ height: `${pct}%` }}
                  title={`${i}:00 — ${h.toFixed(1)}h`}
                />
                <span className="text-[9px] font-semibold text-[#22223B]/40">{i % 4 === 0 ? i : ""}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export interface WeekdayStripProps {
  /** 7 floats Mon–Sun. */
  dayDistribution: number[];
}

/**
 * Weekday totals bar chart for productivity peaks.
 */
export function WeekdayStrip({ dayDistribution }: WeekdayStripProps) {
  const maxD = Math.max(0.01, ...dayDistribution);

  return (
    <div>
      <h4 className="text-sm font-bold text-[#22223B] mb-3">By weekday</h4>
      <div className="flex gap-2 items-end h-32">
        {dayDistribution.map((d, i) => {
          const pct = Math.min(100, (d / maxD) * 100);
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full rounded-t-xl bg-gradient-to-t from-amber-500 to-orange-400 min-h-[4px]"
                style={{ height: `${pct}%` }}
              />
              <span className="text-xs font-bold text-[#22223B]/60">{DAY_LABELS[i]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
