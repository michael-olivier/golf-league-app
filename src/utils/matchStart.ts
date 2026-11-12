import type { WeeklyMatch } from "../types";

const START_ROUND_LEAD_MS = 30 * 60 * 1000;
/** After tee — enough for check-in and first few holes on match day. */
const START_ROUND_TAIL_MS = 5 * 60 * 60 * 1000;

function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function endOfLocalDay(d: Date): Date {
  const end = new Date(d);
  end.setHours(23, 59, 59, 999);
  return end;
}

/** Local tee time on `match.date` as `Date`, or null when the date is invalid. */
export function matchStartDate(match: WeeklyMatch): Date | null {
  const parts = match.date.split("-").map((n) => Number(n));
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return null;

  const time = match.startTime?.trim() || "16:20";
  const [hour, minute] = time.split(":").map((n) => Number(n));
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;

  const [year, month, day] = parts;
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

export function formatMatchStartTime(match: WeeklyMatch): string {
  const time = match.startTime?.trim() || "16:20";
  const [h, m] = time.split(":");
  const hour = Number(h);
  const minute = Number(m);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return time;

  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Start Round on the home card: local match day only, from 30 minutes before
 * tee through a short post-tee window (capped at end of that day).
 */
export function shouldShowLeagueStartRound(
  match: WeeklyMatch,
  now: Date = new Date(),
): boolean {
  if (match.status !== "scheduled" && match.status !== "in_progress") {
    return false;
  }

  const start = matchStartDate(match);
  if (!start) return false;

  if (!isSameLocalDay(now, start)) return false;

  const windowStart = new Date(start.getTime() - START_ROUND_LEAD_MS);
  const windowEnd = new Date(
    Math.min(start.getTime() + START_ROUND_TAIL_MS, endOfLocalDay(start).getTime()),
  );

  return now >= windowStart && now <= windowEnd;
}
