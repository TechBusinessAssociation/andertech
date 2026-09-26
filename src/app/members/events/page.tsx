import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  getUpcomingEvents,
  isApprovedMember,
  type MemberEvent,
} from "@/lib/members-db";

// Same gate as /members: middleware confirms a session, this re-checks
// the live membership list on every load.

// Dates are plain YYYY-MM-DD strings (no timezone). Parsing and
// formatting both in UTC keeps the day from shifting on any server.
function parseDate(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function formatDay(ymd: string): string {
  return parseDate(ymd).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

// Monday of the event's week, as YYYY-MM-DD.
function weekStart(ymd: string): string {
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

function timeRange(event: MemberEvent): string | null {
  if (!event.start_time) return null;
  return event.end_time
    ? `${formatTime(event.start_time)} - ${formatTime(event.end_time)}`
    : formatTime(event.start_time);
}

export default async function MemberEventsPage() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email || !(await isApprovedMember(email))) {
    redirect("/sign-in");
  }

  const events = await getUpcomingEvents();

  const weeks: { start: string; events: MemberEvent[] }[] = [];
  for (const event of events) {
    const start = weekStart(event.event_date);
    let week = weeks.find((w) => w.start === start);
    if (!week) {
      week = { start, events: [] };
      weeks.push(week);
    }
    week.events.push(event);
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <div className="flex flex-col gap-2">
        <Link
          href="/members"
          className="text-sm text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Back to members
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">
          Upcoming events
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Members-only. All times Pacific.
        </p>
      </div>

      {weeks.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          No upcoming events yet.
        </p>
      ) : (
        weeks.map((week) => (
          <section key={week.start} className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
              Week of {formatDay(week.start)}
            </h2>
            <ul className="flex flex-col gap-4">
              {week.events.map((event) => {
                const time = timeRange(event);
                return (
                  <li
                    key={event.id}
                    className="flex flex-col gap-1 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {formatDay(event.event_date)}
                        {time ? `, ${time}` : ""}
                      </span>
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800">
                        {event.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold">{event.title}</h3>
                    {event.location && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {event.location}
                      </p>
                    )}
                    {event.description && (
                      <p className="text-sm text-zinc-700 dark:text-zinc-300">
                        {event.description}
                      </p>
                    )}
                    {event.url && (
                      <a
                        href={event.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-fit text-sm text-brand-navy underline dark:text-brand-blue"
                      >
                        Details / RSVP
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}
    </main>
  );
}
