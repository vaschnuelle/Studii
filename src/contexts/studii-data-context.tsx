import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  buildUserStats,
  buildWrappedSummary,
  computeBiggestWins,
  weekPeriodId,
  type BiggestWinsResult,
  type UserStats,
  type WrappedSummaryRecord,
} from "@studii/shared";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { generateDemoPhase2Sessions } from "@/data/demo-phase2-data";

export type StudiiDataSource = "demo" | "supabase";

export interface StudiiDataValue {
  source: StudiiDataSource;
  stats: UserStats | null;
  wrappedSummary: WrappedSummaryRecord | null;
  wins: BiggestWinsResult | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const StudiiDataContext = createContext<StudiiDataValue | null>(null);

interface UserStatsRow {
  user_id: string;
  stats: UserStats;
}

interface WrappedSummaryRow {
  user_id: string;
  period_id: string;
  personality: WrappedSummaryRecord["personality"];
  top_buddy: string | null;
  top_buddy_overlap_hours: number;
  power_hour: number;
  power_day: number;
  longest_session_min: number;
  most_pomodoros_day: number;
  streak: number;
  total_hours: number;
  share_card_url: string | null;
  generated_at: string;
}

/**
 * Maps a DB `wrapped_summaries` row into the app's wrapped record shape.
 */
function mapWrappedSummaryRowToRecord(row: WrappedSummaryRow): WrappedSummaryRecord {
  return {
    periodId: row.period_id,
    personality: row.personality,
    topBuddy: row.top_buddy,
    topBuddyOverlapHours: row.top_buddy_overlap_hours ?? 0,
    powerHour: row.power_hour ?? 0,
    powerDay: row.power_day ?? 0,
    longestSessionMin: row.longest_session_min ?? 0,
    mostPomodorosDay: row.most_pomodoros_day ?? 0,
    streak: row.streak ?? 0,
    totalHours: row.total_hours ?? 0,
    shareCardUrl: row.share_card_url,
    generatedAt: row.generated_at ? new Date(row.generated_at) : new Date(),
  };
}

/**
 * Loads Phase 2 aggregates: always computes demo baselines; overlays Supabase `users.stats`
 * and `wrapped_summaries` row values when Supabase is configured and `supabaseUserId` is set.
 */
export function StudiiDataProvider({
  children,
  supabaseUserId = null,
}: {
  children: ReactNode;
  supabaseUserId?: string | null;
}) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [wrappedSummary, setWrappedSummary] = useState<WrappedSummaryRecord | null>(null);
  const [wins, setWins] = useState<BiggestWinsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [source, setSource] = useState<StudiiDataSource>("demo");

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;

    function applyDemo() {
      const { mine, byFriend } = generateDemoPhase2Sessions();
      const s = buildUserStats(mine, byFriend);
      const w = buildWrappedSummary(mine, byFriend);
      const b = computeBiggestWins(mine);
      setStats(s);
      setWrappedSummary(w);
      setWins(b);
    }

    async function run() {
      setLoading(true);
      setError(null);
      applyDemo();
      if (!cancelled) setSource("demo");

      if (supabaseUserId && isSupabaseConfigured()) {
        try {
          const supabase = getSupabaseClient();
          const userStatsResult = await supabase
            .from("users")
            .select("user_id,stats")
            .eq("user_id", supabaseUserId)
            .maybeSingle<UserStatsRow>();

          if (userStatsResult.error) {
            throw userStatsResult.error;
          }

          const rawStats = userStatsResult.data?.stats;
          if (rawStats && !cancelled) {
            setStats(rawStats);
            setSource("supabase");
          }

          const period = weekPeriodId();
          const wrappedSummaryResult = await supabase
            .from("wrapped_summaries")
            .select(
              "user_id,period_id,personality,top_buddy,top_buddy_overlap_hours,power_hour,power_day,longest_session_min,most_pomodoros_day,streak,total_hours,share_card_url,generated_at"
            )
            .eq("user_id", supabaseUserId)
            .eq("period_id", period)
            .maybeSingle<WrappedSummaryRow>();

          if (wrappedSummaryResult.error) {
            throw wrappedSummaryResult.error;
          }

          if (wrappedSummaryResult.data && !cancelled) {
            setWrappedSummary(mapWrappedSummaryRowToRecord(wrappedSummaryResult.data));
            setSource("supabase");
          }
        } catch (e) {
          if (!cancelled) {
            setError(e instanceof Error ? e.message : "Failed to load Supabase data");
          }
        }
      }

      if (!cancelled) setLoading(false);
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [supabaseUserId, tick]);

  const value = useMemo<StudiiDataValue>(
    () => ({
      source,
      stats,
      wrappedSummary,
      wins,
      loading,
      error,
      refresh,
    }),
    [source, stats, wrappedSummary, wins, loading, error, refresh]
  );

  return <StudiiDataContext.Provider value={value}>{children}</StudiiDataContext.Provider>;
}

/**
 * Phase 2 analytics and Wrapped data (demo or Supabase-backed).
 */
export function useStudiiData(): StudiiDataValue {
  const ctx = useContext(StudiiDataContext);
  if (!ctx) {
    throw new Error("useStudiiData must be used within StudiiDataProvider");
  }
  return ctx;
}
