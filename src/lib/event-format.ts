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

// "October 2026", for the month headings on the events list.
export function monthLabel(ymd: string): string {
  return parseDate(ymd).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

// A friendly "how soon" badge: Today, Tomorrow, In 5 days. Only for the next
// two weeks (further out it would just be noise); null otherwise.
export function relativeLabel(days: number): string | null {
  if (days < 0 || days > 14) return null;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

// "HH:MM" -> minutes after midnight.
function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

// YYYYMMDD[THHMMSS] as Google Calendar wants it (local time, no separators).
function calStamp(ymd: string, minutes?: number): string {
  const day = ymd.replaceAll("-", "");
  if (minutes === undefined) return day;
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(minutes % 60).padStart(2, "0");
  return `${day}T${h}${m}00`;
}

// A link that opens Google Calendar's "new event" form already filled in, so a
// member can add the event to their own calendar. No backend and no data leaves
// the site until they click it. Events with no start time become all-day; one
// with no end time lasts an hour. All events are in Los Angeles time.
export function googleCalendarUrl(event: MemberEvent): string {
  let dates: string;
  if (event.start_time) {
    const start = toMinutes(event.start_time);
    const end = event.end_time
      ? toMinutes(event.end_time)
      : Math.min(start + 60, 23 * 60 + 59);
    dates = `${calStamp(event.event_date, start)}/${calStamp(event.event_date, Math.max(end, start))}`;
  } else {
    const next = parseDate(event.event_date);
    next.setUTCDate(next.getUTCDate() + 1);
    dates = `${calStamp(event.event_date)}/${calStamp(next.toISOString().slice(0, 10))}`;
  }
  const details = [event.description, event.url].filter(Boolean).join("\n\n");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates,
    ctz: "America/Los_Angeles",
  });
  if (event.location) params.set("location", event.location);
  if (details) params.set("details", details.slice(0, 800));
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
