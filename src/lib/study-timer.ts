export const BREAK_INTERVALS = [30, 45, 60] as const; // minutes of study before a break
export const BREAK_LENGTH_MIN = 5;

export type TimerMode = "idle" | "study" | "break";

export interface TimerState {
  mode: TimerMode;
  intervalMin: number;
  segmentStart: number | null; // ms timestamp when current study/break started
  todayKey: string;
  todaySeconds: number; // completed study seconds today
  totalSeconds: number; // completed study seconds all-time
  breaksTaken: number;
}

export const dayKey = (d = new Date()) => d.toISOString().slice(0, 10);

export const initialTimer = (): TimerState => ({
  mode: "idle",
  intervalMin: 30,
  segmentStart: null,
  todayKey: dayKey(),
  todaySeconds: 0,
  totalSeconds: 0,
  breaksTaken: 0,
});

/** Seconds elapsed in the current segment. */
export const elapsed = (s: TimerState, now: number) =>
  s.segmentStart ? Math.max(0, Math.floor((now - s.segmentStart) / 1000)) : 0;

/** Bank finished study time, rolling over the daily counter when the date changes. */
export function bankStudy(s: TimerState, now: number): TimerState {
  const today = dayKey(new Date(now));
  const base = s.todayKey === today ? s : { ...s, todayKey: today, todaySeconds: 0 };
  if (s.mode !== "study") return base;
  const secs = elapsed(s, now);
  return { ...base, todaySeconds: base.todaySeconds + secs, totalSeconds: base.totalSeconds + secs };
}

export const isBreakDue = (s: TimerState, now: number) =>
  s.mode === "study" && elapsed(s, now) >= s.intervalMin * 60;

export const isBreakOver = (s: TimerState, now: number) =>
  s.mode === "break" && elapsed(s, now) >= BREAK_LENGTH_MIN * 60;

export function formatDuration(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const sec = secs % 60;
  if (h) return `${h}h ${m}m`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}
