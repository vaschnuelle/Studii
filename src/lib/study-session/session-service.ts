import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

export type SessionEndedReason = "manual_stop" | "completed" | "inactivity_timeout";

export interface StudySessionStartInput {
  subject: string;
  pomodoroEnabled: boolean;
  pomodoroFocusMinutes: number | null;
}

interface StudySessionRow {
  id: string;
  creator_user_id: string;
  status: "scheduled" | "active" | "completed" | "cancelled";
}

export interface StudySessionInsertPayload {
  creator_user_id: string;
  subject: string;
  start_time: string;
  status: "active";
  is_pomodoro: boolean;
  pomodoro_focus_minutes: number | null;
  last_activity_at: string;
}

/**
 * Creates the insert payload for starting a study session.
 */
export function buildSessionInsertPayload(
  userId: string,
  input: StudySessionStartInput,
  nowIso: string
): StudySessionInsertPayload {
  return {
    creator_user_id: userId,
    subject: input.subject,
    start_time: nowIso,
    status: "active",
    is_pomodoro: input.pomodoroEnabled,
    pomodoro_focus_minutes: input.pomodoroEnabled ? input.pomodoroFocusMinutes : null,
    last_activity_at: nowIso,
  };
}

/**
 * Creates and starts a new active study session in Supabase.
 */
export async function startStudySession(input: StudySessionStartInput): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = getSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User must be authenticated to start a study session.");
  }

  const nowIso = new Date().toISOString();
  const sessionInsertPayload = buildSessionInsertPayload(user.id, input, nowIso);
  const { data, error } = await supabase
    .from("study_sessions")
    .insert(sessionInsertPayload)
    .select("id,creator_user_id,status")
    .single<StudySessionRow>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.id) {
    return null;
  }

  await supabase.from("user_presence").upsert({
    user_id: user.id,
    status: "studying",
    active_session_id: data.id,
    subject: input.subject,
    last_heartbeat_at: nowIso,
  });

  return data.id;
}

/**
 * Sends a heartbeat so server-side inactivity detection stays accurate.
 */
export async function sendSessionHeartbeat(sessionId: string, subject: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    return;
  }
  const supabase = getSupabaseClient();
  const { error } = await supabase.rpc("record_session_heartbeat", {
    p_session_id: sessionId,
    p_subject: subject,
  });

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Ends an active session and records the final reason for analytics/auditing.
 */
export async function stopStudySession(
  sessionId: string,
  subject: string,
  endedReason: SessionEndedReason
): Promise<void> {
  if (!isSupabaseConfigured()) {
    return;
  }

  const supabase = getSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return;
  }

  const nowIso = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("study_sessions")
    .update({
      status: "completed",
      end_time: nowIso,
      ended_reason: endedReason,
      last_activity_at: nowIso,
      subject,
    })
    .eq("id", sessionId)
    .eq("creator_user_id", user.id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  await supabase.from("study_session_activity").insert({
    session_id: sessionId,
    user_id: user.id,
    activity_type: endedReason === "manual_stop" ? "manual_stop" : "notification_ack",
  });

  await supabase.from("user_presence").upsert({
    user_id: user.id,
    status: "idle",
    active_session_id: null,
    subject: null,
    last_heartbeat_at: nowIso,
  });
}
