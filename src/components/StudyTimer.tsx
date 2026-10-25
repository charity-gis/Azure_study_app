import { useEffect, useRef, useState } from "react";
import { Bell, Coffee, Pause, Play, Timer, X } from "lucide-react";
import {
  BREAK_INTERVALS,
  BREAK_LENGTH_MIN,
  bankStudy,
  elapsed,
  formatDuration,
  initialTimer,
  isBreakDue,
  isBreakOver,
  type TimerState,
} from "@/lib/study-timer";

const KEY = "az900-study-timer";

function notify(title: string, body: string) {
  try {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body });
    }
    navigator.vibrate?.(300);
  } catch {
    /* notifications unavailable */
  }
}

export function StudyTimer() {
  const [s, setS] = useState<TimerState | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [open, setOpen] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);
  const notified = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      setS(raw ? { ...initialTimer(), ...JSON.parse(raw) } : initialTimer());
    } catch {
      setS(initialTimer());
    }
  }, []);

  useEffect(() => {
    if (s) localStorage.setItem(KEY, JSON.stringify(s));
  }, [s]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!s) return;
    if (isBreakDue(s, now) && !notified.current) {
      notified.current = true;
      const msg = `You've studied ${s.intervalMin} minutes. Time for a ${BREAK_LENGTH_MIN}-minute break!`;
      setAlert(msg);
      setOpen(true);
      notify("Break time ☕", msg);
    } else if (isBreakOver(s, now) && !notified.current) {
      notified.current = true;
      const msg = "Break's over — ready to get back to studying?";
      setAlert(msg);
      setOpen(true);
      notify("Back to study 📘", msg);
    }
  }, [s, now]);

  if (!s) return null;

  const update = (next: TimerState) => {
    notified.current = false;
    setAlert(null);
    setS(next);
  };
  const start = () => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
    update({ ...bankStudy(s, Date.now()), mode: "study", segmentStart: Date.now() });
  };
  const takeBreak = () =>
    update({ ...bankStudy(s, Date.now()), mode: "break", segmentStart: Date.now(), breaksTaken: s.breaksTaken + 1 });
  const stop = () => update({ ...bankStudy(s, Date.now()), mode: "idle", segmentStart: null });

  const cur = elapsed(s, now);
  const today = (s.todayKey === new Date(now).toISOString().slice(0, 10) ? s.todaySeconds : 0) + (s.mode === "study" ? cur : 0);
  const untilBreak = Math.max(0, s.intervalMin * 60 - cur);
  const breakLeft = Math.max(0, BREAK_LENGTH_MIN * 60 - cur);

  const label = s.mode === "study" ? formatDuration(cur) : s.mode === "break" ? `Break ${formatDuration(breakLeft)}` : "Timer";

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="w-72 rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-card">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-semibold">Study timer</p>
            <button aria-label="Close timer" onClick={() => setOpen(false)} className="text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          {alert && (
            <div className="mb-3 flex gap-2 rounded-xl bg-primary/10 p-3 text-sm text-foreground">
              <Bell className="h-4 w-4 shrink-0 text-primary" /> {alert}
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 text-center text-sm">
            <div className="rounded-xl bg-muted p-2">
              <p className="text-xs text-muted-foreground">Today</p>
              <p className="font-semibold">{formatDuration(today)}</p>
            </div>
            <div className="rounded-xl bg-muted p-2">
              <p className="text-xs text-muted-foreground">All time</p>
              <p className="font-semibold">{formatDuration(s.totalSeconds + (s.mode === "study" ? cur : 0))}</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {s.mode === "study" && `Break in ${formatDuration(untilBreak)}`}
            {s.mode === "break" && `Back to study in ${formatDuration(breakLeft)}`}
            {s.mode === "idle" && `Breaks taken: ${s.breaksTaken}`}
          </p>
          <p className="mt-3 text-xs font-medium text-muted-foreground">Remind me to break every</p>
          <div className="mt-1 flex gap-2">
            {BREAK_INTERVALS.map((m) => (
              <button
                key={m}
                onClick={() => setS({ ...s, intervalMin: m })}
                className={`flex-1 rounded-lg border px-2 py-1 text-sm ${s.intervalMin === m ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
              >
                {m === 60 ? "1 hr" : `${m} min`}
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            {s.mode !== "study" && (
              <button onClick={start} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
                <Play className="h-4 w-4" /> {s.mode === "break" ? "Resume" : "Start"}
              </button>
            )}
            {s.mode === "study" && (
              <button onClick={takeBreak} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground">
                <Coffee className="h-4 w-4" /> Break
              </button>
            )}
            {s.mode !== "idle" && (
              <button onClick={stop} className="flex items-center justify-center gap-1 rounded-lg border border-border px-3 py-2 text-sm">
                <Pause className="h-4 w-4" /> Stop
              </button>
            )}
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open study timer"
        className={`flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold shadow-card ${alert ? "animate-pulse" : ""} ${s.mode === "break" ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"}`}
      >
        {s.mode === "break" ? <Coffee className="h-4 w-4" /> : <Timer className="h-4 w-4" />}
        {label}
      </button>
    </div>
  );
}
