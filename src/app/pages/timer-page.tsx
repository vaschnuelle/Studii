import { useEffect, useMemo, useState } from "react";
import { Clock3, Play, Pause, Square, Sparkles, BellRing } from "lucide-react";
import {
  clearPersistedTimerSnapshot,
  computeElapsedSeconds,
  loadPersistedTimerSnapshot,
  persistTimerSnapshot,
} from "@/lib/study-session/timer-persistence";
import {
  startStudySession,
  stopStudySession,
  sendSessionHeartbeat,
} from "@/lib/study-session/session-service";
import { formatDuration } from "@/lib/study-session/timer-utils";
import { isSupabaseConfigured, getSupabaseClient } from "@/lib/supabase";

const HEARTBEAT_INTERVAL_MILLISECONDS = 60_000;
const SESSION_STATUS_POLL_INTERVAL_MILLISECONDS = 60_000;
const INACTIVITY_WARNING_MILLISECONDS = 4.5 * 60 * 60 * 1000;

/**
 * Study-session screen focused on starting/managing active sessions.
 * Pomodoro is intentionally moved to its dedicated `/pomodoro` tab.
 */
export default function TimerPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [subject, setSubject] = useState("Mathematics");
  const [startedAtIso, setStartedAtIso] = useState<string | null>(null);
  const [accumulatedSeconds, setAccumulatedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [lastClientActivityAtIso, setLastClientActivityAtIso] = useState(new Date().toISOString());

  /**
   * Persists active session timer state for reload/background resilience.
   */
  useEffect(() => {
    if (!sessionId || !startedAtIso) {
      clearPersistedTimerSnapshot();
      return;
    }

    persistTimerSnapshot({
      sessionId,
      subject,
      startedAtIso,
      isRunning,
      accumulatedSeconds,
      pomodoroEnabled: false,
      pomodoroFocusMinutes: null,
      lastClientActivityAtIso,
    });
  }, [sessionId, subject, startedAtIso, isRunning, accumulatedSeconds, lastClientActivityAtIso]);

  /**
   * Restores persisted session timer details from local storage.
   */
  useEffect(() => {
    const snapshot = loadPersistedTimerSnapshot();
    if (!snapshot) {
      return;
    }
    setSessionId(snapshot.sessionId);
    setSubject(snapshot.subject);
    setStartedAtIso(snapshot.startedAtIso);
    setIsRunning(snapshot.isRunning);
    setAccumulatedSeconds(snapshot.accumulatedSeconds);
    setLastClientActivityAtIso(snapshot.lastClientActivityAtIso);
    setStatusMessage("Recovered active session timer.");
  }, []);

  /**
   * Recomputes elapsed time from timestamps to keep timer accurate.
   */
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (!startedAtIso) {
        setElapsedSeconds(accumulatedSeconds);
        return;
      }

      setElapsedSeconds(
        computeElapsedSeconds(
          {
            sessionId: sessionId ?? "pending",
            subject,
            startedAtIso,
            isRunning,
            accumulatedSeconds,
            pomodoroEnabled: false,
            pomodoroFocusMinutes: null,
            lastClientActivityAtIso,
          },
          new Date()
        )
      );
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [sessionId, subject, startedAtIso, isRunning, accumulatedSeconds, lastClientActivityAtIso]);

  /**
   * Sends periodic heartbeats so backend inactivity logic can enforce auto-stop.
   */
  useEffect(() => {
    if (!sessionId || !isRunning) {
      return;
    }

    const heartbeatIntervalId = window.setInterval(() => {
      void sendSessionHeartbeat(sessionId, subject).catch((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : "Failed to send heartbeat.";
        setStatusMessage(errorMessage);
      });
    }, HEARTBEAT_INTERVAL_MILLISECONDS);

    return () => {
      window.clearInterval(heartbeatIntervalId);
    };
  }, [sessionId, isRunning, subject]);

  /**
   * Polls backend session status so auto-stop changes show in UI quickly.
   */
  useEffect(() => {
    if (!sessionId || !isSupabaseConfigured()) {
      return;
    }

    const pollIntervalId = window.setInterval(() => {
      const supabase = getSupabaseClient();
      void supabase
        .from("study_sessions")
        .select("status,ended_reason")
        .eq("id", sessionId)
        .maybeSingle<{ status: string; ended_reason: string | null }>()
        .then(({ data }) => {
          if (data?.status === "completed" && data.ended_reason === "inactivity_timeout") {
            setStatusMessage("Session auto-stopped after inactivity.");
            resetLocalSessionState();
          }
        });
    }, SESSION_STATUS_POLL_INTERVAL_MILLISECONDS);

    return () => {
      window.clearInterval(pollIntervalId);
    };
  }, [sessionId]);

  const progressPercent = useMemo(() => {
    const maxVisualProgressSeconds = 60 * 60;
    const completedSeconds = Math.min(maxVisualProgressSeconds, elapsedSeconds);
    return Math.max(0, Math.min(100, Math.floor((completedSeconds / maxVisualProgressSeconds) * 100)));
  }, [elapsedSeconds]);

  const inactivityWarningVisible =
    Date.now() - new Date(lastClientActivityAtIso).getTime() >= INACTIVITY_WARNING_MILLISECONDS;

  /**
   * Requests/sends browser inactivity reminders when configured.
   */
  useEffect(() => {
    const notificationsEnabled = import.meta.env.VITE_ENABLE_BROWSER_NOTIFICATIONS === "true";
    if (!notificationsEnabled || !inactivityWarningVisible || !sessionId) {
      return;
    }

    if (!("Notification" in window)) {
      return;
    }

    if (Notification.permission === "granted") {
      const notification = new Notification("Studii session inactivity warning", {
        body: "Open Studii and interact to keep your study session active.",
      });
      notification.onclick = () => window.focus();
      return;
    }

    if (Notification.permission === "default") {
      void Notification.requestPermission();
    }
  }, [inactivityWarningVisible, sessionId]);

  /**
   * Clears all local active-session fields and persisted timer snapshot.
   */
  function resetLocalSessionState(): void {
    setSessionId(null);
    setStartedAtIso(null);
    setIsRunning(false);
    setAccumulatedSeconds(0);
    setElapsedSeconds(0);
    clearPersistedTimerSnapshot();
  }

  /**
   * Marks user activity timestamp to delay inactivity warnings.
   */
  function markUserInteraction(): void {
    setLastClientActivityAtIso(new Date().toISOString());
  }

  /**
   * Starts a new study session using non-Pomodoro mode.
   */
  async function handleStartSession(): Promise<void> {
    if (!subject.trim()) {
      setStatusMessage("Please provide a subject before starting.");
      return;
    }

    try {
      setIsBusy(true);
      const startedSessionId = await startStudySession({
        subject: subject.trim(),
        pomodoroEnabled: false,
        pomodoroFocusMinutes: null,
      });

      const nowIso = new Date().toISOString();
      setSessionId(startedSessionId);
      setStartedAtIso(nowIso);
      setAccumulatedSeconds(0);
      setIsRunning(true);
      setLastClientActivityAtIso(nowIso);
      setStatusMessage("Study session started.");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to start session.";
      setStatusMessage(errorMessage);
    } finally {
      setIsBusy(false);
    }
  }

  /**
   * Pauses or resumes session stopwatch while preserving elapsed time.
   */
  function handleTogglePause(): void {
    markUserInteraction();
    if (!sessionId) {
      return;
    }

    if (isRunning) {
      setAccumulatedSeconds(elapsedSeconds);
      setIsRunning(false);
      return;
    }

    setStartedAtIso(new Date().toISOString());
    setIsRunning(true);
  }

  /**
   * Ends the current session and writes manual-stop reason to backend.
   */
  async function handleStopSession(): Promise<void> {
    if (!sessionId) {
      return;
    }
    try {
      setIsBusy(true);
      await stopStudySession(sessionId, subject, "manual_stop");
      setStatusMessage("Session ended.");
      resetLocalSessionState();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to stop session.";
      setStatusMessage(errorMessage);
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 md:pb-8">
      <section className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 border-2 border-white/80 shadow-lg">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-black text-[#22223B]">Study Session</h1>
            <p className="text-[#22223B]/65 font-semibold mt-1">
              Start instantly with a subject. Pomodoro lives in the dedicated tab.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#508CA4]/10 text-[#508CA4] font-bold">
            <Sparkles className="w-4 h-4" />
            Focus + fun
          </div>
        </div>
      </section>

      <section className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 border-2 border-white/80 shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-black text-[#22223B]">Start Study Session</h2>
          <span className="text-xs font-bold uppercase tracking-wide text-[#508CA4] bg-[#508CA4]/10 px-2.5 py-1 rounded-lg">
            Core session
          </span>
        </div>
        <label className="block mt-4">
          <span className="text-xs uppercase tracking-wide text-[#22223B]/60 font-bold">Subject</span>
          <input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            onBlur={markUserInteraction}
            className="mt-2 w-full rounded-2xl border-2 border-[#508CA4]/25 bg-white/90 px-4 py-3 text-[#22223B] font-semibold focus:outline-none focus:border-[#508CA4]"
            placeholder="What are you studying?"
          />
        </label>

        {!sessionId ? (
          <button
            onClick={() => void handleStartSession()}
            disabled={isBusy}
            className="mt-5 w-full px-6 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-[#508CA4] to-[#5ea4bf] hover:scale-[1.01] transition-all shadow-lg inline-flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Play className="w-5 h-5" />
            Start Study Session
          </button>
        ) : (
          <p className="mt-5 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
            Session is active. Use stopwatch controls below.
          </p>
        )}
      </section>

      <section className="bg-gradient-to-br from-[#22223B] via-[#2c2c45] to-[#508CA4] text-white rounded-[2rem] p-8 shadow-xl border-2 border-white/20">
        <div className="flex flex-col items-center">
          <div className="relative w-64 h-64 mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="12" />
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="#ffffff"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray="534.07"
                strokeDashoffset={534.07 - (534.07 * progressPercent) / 100}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-4xl font-black">{formatDuration(elapsedSeconds)}</div>
              <div className="text-sm font-semibold text-white/80 mt-1">Study Session Stopwatch</div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-center">
            {sessionId ? (
              <>
                <button
                  onClick={handleTogglePause}
                  disabled={isBusy}
                  className="px-5 py-3 rounded-2xl bg-white/15 border border-white/30 font-bold inline-flex items-center gap-2"
                >
                  {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  {isRunning ? "Pause" : "Resume"}
                </button>
                <button
                  onClick={() => void handleStopSession()}
                  disabled={isBusy}
                  className="px-5 py-3 rounded-2xl bg-rose-400/90 border border-rose-300 font-bold inline-flex items-center gap-2"
                >
                  <Square className="w-5 h-5" />
                  Stop Session
                </button>
              </>
            ) : (
              <div className="text-sm text-white/80 font-semibold inline-flex items-center gap-2">
                <Clock3 className="w-4 h-4" />
                Start a session to begin tracking.
              </div>
            )}
          </div>
        </div>
      </section>

      {inactivityWarningVisible && sessionId ? (
        <section className="bg-amber-100 border-2 border-amber-300 rounded-2xl p-4 flex items-center justify-between gap-4">
          <p className="text-[#22223B] font-semibold text-sm">
            Inactivity warning: interact or resume to avoid server auto-stop at 5 hours.
          </p>
          <button
            onClick={markUserInteraction}
            className="px-4 py-2 rounded-xl bg-white border border-amber-300 font-bold text-[#22223B] inline-flex items-center gap-2"
          >
            <BellRing className="w-4 h-4" />
            Keep Active
          </button>
        </section>
      ) : null}

      {statusMessage ? (
        <section className="bg-white/80 border-2 border-white/80 rounded-2xl px-4 py-3 text-sm font-semibold text-[#22223B]/80">
          {statusMessage}
        </section>
      ) : null}
    </div>
  );
}
