import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Coffee, X, Check } from "lucide-react";

const POMODORO_TIME = 25 * 60;
const SHORT_BREAK_TIME = 5 * 60;
const LONG_BREAK_TIME = 15 * 60;

type TimerMode = "focus" | "shortBreak" | "longBreak";

/**
 * Dedicated Pomodoro tab with classic 25-min focus and next-up break flow.
 */
export default function PomodoroPage() {
  const [mode, setMode] = useState<TimerMode>("focus");
  const [timeLeft, setTimeLeft] = useState(POMODORO_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [completedPomodoros, setCompletedPomodoros] = useState<boolean[]>([false, false, false, false]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((previousTime) => previousTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  /**
   * Advances focus/break cycle and sets next-up session type.
   */
  function handleTimerComplete(): void {
    setIsRunning(false);

    if (mode === "focus") {
      const nextPomodoroCount = pomodoroCount + 1;
      setPomodoroCount(nextPomodoroCount);

      const nextCompletedPomodoros = [...completedPomodoros];
      nextCompletedPomodoros[pomodoroCount] = true;
      setCompletedPomodoros(nextCompletedPomodoros);

      if (nextPomodoroCount % 4 === 0) {
        setMode("longBreak");
        setTimeLeft(LONG_BREAK_TIME);
      } else {
        setMode("shortBreak");
        setTimeLeft(SHORT_BREAK_TIME);
      }
      return;
    }

    setMode("focus");
    setTimeLeft(POMODORO_TIME);
  }

  /**
   * Toggles run/pause state for the active timer.
   */
  function toggleTimer(): void {
    setIsRunning((previousState) => !previousState);
  }

  /**
   * Resets current mode timer to its default duration.
   */
  function resetTimer(): void {
    setIsRunning(false);
    if (mode === "focus") {
      setTimeLeft(POMODORO_TIME);
    } else if (mode === "shortBreak") {
      setTimeLeft(SHORT_BREAK_TIME);
    } else {
      setTimeLeft(LONG_BREAK_TIME);
    }
  }

  /**
   * Skips current timer mode and immediately advances cycle.
   */
  function skipTimer(): void {
    setTimeLeft(0);
  }

  /**
   * Formats timer seconds into MM:SS.
   */
  function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainderSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainderSeconds.toString().padStart(2, "0")}`;
  }

  /**
   * Returns circular progress percent for current mode.
   */
  function getProgressPercent(): number {
    const totalDuration =
      mode === "focus" ? POMODORO_TIME : mode === "shortBreak" ? SHORT_BREAK_TIME : LONG_BREAK_TIME;
    return ((totalDuration - timeLeft) / totalDuration) * 100;
  }

  /**
   * Returns display label for current mode.
   */
  function getModeLabel(): string {
    if (mode === "focus") {
      return "Focus Time";
    }
    if (mode === "shortBreak") {
      return "Short Break";
    }
    return "Long Break";
  }

  /**
   * Returns gradient classes for focus vs break styling.
   */
  function getModeGradient(): string {
    return mode === "focus" ? "from-[#508CA4] to-[#508CA4]/90" : "from-amber-500 to-orange-500";
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 md:pb-8">
      <section className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 shadow-lg border-2 border-white/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-[#22223B] mb-1">Pomodoro Timer</h1>
            <p className="text-[#22223B]/60 font-semibold">Classic 25-minute focus with automatic next-up breaks</p>
          </div>
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => {
                setMode("focus");
                setTimeLeft(POMODORO_TIME);
                setIsRunning(false);
              }}
              className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all ${
                mode === "focus"
                  ? "bg-gradient-to-r from-[#508CA4] to-[#508CA4]/90 text-white shadow-lg"
                  : "bg-white/60 text-[#22223B]/70 hover:bg-white"
              }`}
            >
              Focus
            </button>
            <button
              onClick={() => {
                setMode("shortBreak");
                setTimeLeft(SHORT_BREAK_TIME);
                setIsRunning(false);
              }}
              className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all ${
                mode === "shortBreak"
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
                  : "bg-white/60 text-[#22223B]/70 hover:bg-white"
              }`}
            >
              Short Break
            </button>
            <button
              onClick={() => {
                setMode("longBreak");
                setTimeLeft(LONG_BREAK_TIME);
                setIsRunning(false);
              }}
              className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all ${
                mode === "longBreak"
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
                  : "bg-white/60 text-[#22223B]/70 hover:bg-white"
              }`}
            >
              Long Break
            </button>
          </div>
        </div>

        <div className="flex justify-center gap-3 mb-2">
          {completedPomodoros.map((completed, index) => (
            <div
              key={`pomodoro-dot-${index}`}
              className={`w-4 h-4 rounded-full transition-all ${
                completed
                  ? "bg-[#508CA4] shadow-lg shadow-[#508CA4]/40 scale-110"
                  : index === pomodoroCount && mode === "focus"
                    ? "bg-[#508CA4]/50 ring-2 ring-[#508CA4] ring-offset-2"
                    : "bg-[#508CA4]/20"
              } flex items-center justify-center`}
            >
              {completed ? <Check className="w-2.5 h-2.5 text-white" /> : null}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white/80 backdrop-blur-md rounded-[2rem] p-12 shadow-lg border-2 border-white/80 flex flex-col items-center">
        <div className="relative mb-8">
          <div className={`absolute inset-0 bg-gradient-to-br ${getModeGradient()} opacity-20 rounded-full blur-3xl`} />

          <svg className="w-80 h-80 -rotate-90 relative" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="85" fill="none" stroke="#e5e7eb" strokeWidth="12" className="opacity-30" />
            <circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke={mode === "focus" ? "#508CA4" : "#f59e0b"}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray="534.07"
              strokeDashoffset={534.07 - (534.07 * getProgressPercent()) / 100}
              className="transition-all duration-1000 drop-shadow-lg"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-7xl font-bold text-[#22223B] tracking-tight mb-2">{formatTime(timeLeft)}</div>
            <div className="text-lg text-[#22223B]/60 font-semibold mb-3">{getModeLabel()}</div>
            {mode === "focus" ? (
              <div className={`px-4 py-2 bg-gradient-to-r ${getModeGradient()} text-white rounded-xl shadow-lg`}>
                <span className="text-sm font-bold">Pomodoro {pomodoroCount + 1}/4</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex gap-4 w-full max-w-md">
          <button
            onClick={resetTimer}
            className="w-14 h-14 bg-white/80 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/50 hover:scale-105 transition-transform text-[#22223B]"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={toggleTimer}
            className={`flex-1 bg-gradient-to-r ${getModeGradient()} text-white font-bold py-4 rounded-[1.5rem] shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2`}
          >
            {isRunning ? (
              <>
                <Pause className="w-6 h-6" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-6 h-6" />
                Start
              </>
            )}
          </button>
          <button
            onClick={skipTimer}
            className="w-14 h-14 bg-white/80 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/50 hover:scale-105 transition-transform text-[#22223B]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </section>

      <section className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-[2rem] p-6 shadow-lg border-2 border-amber-200/50 flex items-center gap-4">
        <div className="w-14 h-14 bg-white/80 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0">
          <Coffee className="w-7 h-7 text-amber-600" />
        </div>
        <div className="flex-1">
          <div className="text-xs text-[#22223B]/60 font-bold uppercase mb-1">Next Up</div>
          <div className="text-lg font-bold text-[#22223B]">
            {mode === "focus"
              ? pomodoroCount + 1 >= 4
                ? "15 min long break"
                : "5 min short break"
              : "Back to 25 min focus session"}
          </div>
        </div>
      </section>
    </div>
  );
}
