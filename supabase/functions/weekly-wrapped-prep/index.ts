import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

type WrappedSummaryPayload = {
  period_id: string;
  personality: string;
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
};

/**
 * Builds a placeholder wrapped summary payload.
 * Replace this logic with real session aggregation when production data pipelines are ready.
 */
function buildDefaultWrappedSummary(periodId: string): WrappedSummaryPayload {
  return {
    period_id: periodId,
    personality: "Solo Grinder",
    top_buddy: null,
    top_buddy_overlap_hours: 0,
    power_hour: 0,
    power_day: 0,
    longest_session_min: 0,
    most_pomodoros_day: 0,
    streak: 0,
    total_hours: 0,
    share_card_url: null,
    generated_at: new Date().toISOString(),
  };
}

/**
 * Returns an ISO-like week key such as 2026-W17.
 */
function currentWeekPeriodId(): string {
  const now = new Date();
  const utcDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const dayNum = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((utcDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${utcDate.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

Deno.serve(async () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const serviceClient = createClient(supabaseUrl, serviceRoleKey);
  const periodId = currentWeekPeriodId();
  const wrappedPayload = buildDefaultWrappedSummary(periodId);

  const { data: users, error: usersError } = await serviceClient
    .from("users")
    .select("user_id")
    .limit(10000);

  if (usersError) {
    return new Response(JSON.stringify({ ok: false, error: usersError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const wrappedRows = (users ?? []).map((row) => ({
    user_id: row.user_id as string,
    ...wrappedPayload,
  }));

  if (wrappedRows.length === 0) {
    return new Response(JSON.stringify({ ok: true, periodId, processedUsers: 0 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { error: upsertError } = await serviceClient.from("wrapped_summaries").upsert(wrappedRows, {
    onConflict: "user_id,period_id",
  });

  if (upsertError) {
    return new Response(JSON.stringify({ ok: false, error: upsertError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({ ok: true, periodId, processedUsers: wrappedRows.length, mode: "scaffold" }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
});
