import type { MemberEvent } from "@/lib/members-db";

// Dates are plain YYYY-MM-DD strings (no timezone). Parsing and
// formatting both in UTC keeps the day from shifting on any server.
function parseDate(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function formatDay(ymd: string): string {
  return parseDate(ymd).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

// Monday of the event's week, as YYYY-MM-DD.
export function weekStart(ymd: string): string {
  const date = parseDate(ymd);
  const sinceMonday = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - sinceMonday);
  return date.toISOString().slice(0, 10);
}

function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function timeRange(
  event: Pick<MemberEvent, "start_time" | "end_time">,
): string | null {
  if (!event.start_time) return null;
  return event.end_time
    ? `${formatTime(event.start_time)} - ${formatTime(event.end_time)}`
    : formatTime(event.start_time);
}

// "Today" in LA as YYYY-MM-DD (all events are in LA; the server runs in UTC).
export function todayInLA(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Los_Angeles",
  });
}

// Whole days from `from` (default: today in LA) to `ymd`; 0 means today.
export function daysUntil(ymd: string, from: string = todayInLA()): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round(
    (parseDate(ymd).getTime() - parseDate(from).getTime()) / msPerDay,
  );
}

// Pieces for a calendar-style date chip: SEP / 29 / Tue.
export function dateParts(ymd: string): {
  month: string;
  day: number;
  weekday: string;
} {
  const date = parseDate(ymd);
  return {
    month: date
      .toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })
      .toUpperCase(),
    day: date.getUTCDate(),
    weekday: date.toLocaleDateString("en-US", {
      weekday: "short",
      timeZone: "UTC",
    }),
  };
}
