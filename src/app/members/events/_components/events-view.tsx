import Link from "next/link";
import {
  dateParts,
  daysUntil,
  googleCalendarUrl,
  monthLabel,
  relativeLabel,
  timeRange,
} from "@/lib/event-format";
import { categoryTone } from "@/lib/event-tone";
import type { MemberEvent } from "@/lib/members-db";

// The members events list: category filter chips, events grouped by month,
// and a card per event. Presentational only (the page does the sign-in check
// and the query), so it can be previewed with sample data. Filtering is
// server-side through ?cat= links, so it works without JavaScript.

const chipBase =
  "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-3.5 text-sm font-medium";
const chipOff =
  "border-zinc-200 bg-white text-zinc-600 hover:border-brand-blue dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400";
const chipOn =
  "border-brand-navy bg-brand-navy text-white dark:border-brand-gold dark:bg-brand-gold dark:text-brand-navy";

const iconProps = {
  viewBox: "0 0 16 16",
  className: "size-4 shrink-0",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function ClockIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 4.8V8l2.2 1.4" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg {...iconProps}>
      <path d="M8 14.5s4.5-4 4.5-7.5a4.5 4.5 0 1 0-9 0c0 3.5 4.5 7.5 4.5 7.5Z" />
      <circle cx="8" cy="7" r="1.6" />
    </svg>
  );
}

function CalendarPlusIcon() {
  return (
    <svg {...iconProps}>
      <rect x="2" y="3" width="12" height="11" rx="2" />
      <path d="M2 6.5h12M5.5 1.8v2.4M10.5 1.8v2.4M8 8.6v3.2M6.4 10.2h3.2" />
    </svg>
  );
}

function EventCard({ event }: { event: MemberEvent }) {
  const tone = categoryTone(event.category);
  const { month, day, weekday } = dateParts(event.event_date);
  const time = timeRange(event);
  const soon = relativeLabel(daysUntil(event.event_date));
  const today = soon === "Today";

  return (
    <article className="relative grid grid-cols-[auto_1fr] gap-x-4 gap-y-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 pl-6 shadow-sm sm:p-5 sm:pl-7 md:grid-cols-[auto_1fr_auto] md:items-start dark:border-zinc-800 dark:bg-zinc-900">
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 w-1.5 ${tone.bar}`}
      />

      <div
        className={`grid h-fit w-16 rounded-xl py-2.5 text-center leading-none ${tone.chip}`}
      >
        <span className="text-[11px] font-bold tracking-widest">{month}</span>
        <span className="mt-1.5 text-3xl font-semibold tabular-nums">{day}</span>
        <span className="mt-1.5 text-[11px] opacity-75">{weekday}</span>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${tone.chip}`}
          >
            {event.category}
          </span>
          {soon && (
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                today
                  ? "bg-brand-gold text-brand-navy"
                  : "border border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
              }`}
            >
              {soon}
            </span>
          )}
        </div>

        <h3 className="mt-2 text-lg font-semibold leading-snug tracking-tight md:text-xl">
          {event.title}
        </h3>

        {(time || event.location) && (
          <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-zinc-600 dark:text-zinc-400">
            {time && (
              <span className="inline-flex items-center gap-1.5">
                <ClockIcon />
                {time}
              </span>
            )}
            {event.location && (
              <span className="inline-flex items-center gap-1.5">
                <PinIcon />
                {event.location}
              </span>
            )}
          </p>
        )}

        {event.description && (
          <p className="mt-3 max-w-[68ch] text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">
            {event.description}
          </p>
        )}
      </div>

      <div className="col-span-2 flex flex-wrap items-center gap-2.5 md:col-span-1 md:flex-col md:items-stretch">
        {event.url && (
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center justify-center rounded-full bg-brand-navy px-5 text-sm font-semibold text-white hover:bg-brand-blue dark:bg-brand-gold dark:text-brand-navy dark:hover:brightness-105"
          >
            Details / RSVP
          </a>
        )}
        <a
          href={googleCalendarUrl(event)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-zinc-300 px-4 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <CalendarPlusIcon />
          Add to calendar
        </a>
      </div>
    </article>
  );
}

export function EventsView({
  events,
  cat,
}: {
  // Every upcoming event, soonest first.
  events: MemberEvent[];
  // The selected category, or null for all.
  cat: string | null;
}) {
  // Categories in order of first appearance, with how many events each has.
  const categories: { name: string; count: number }[] = [];
  for (const event of events) {
    const found = categories.find((c) => c.name === event.category);
    if (found) found.count += 1;
    else categories.push({ name: event.category, count: 1 });
  }

  const shown = cat ? events.filter((event) => event.category === cat) : events;

  const months: { label: string; events: MemberEvent[] }[] = [];
  for (const event of shown) {
    const label = monthLabel(event.event_date);
    let month = months.find((m) => m.label === label);
    if (!month) {
      month = { label, events: [] };
      months.push(month);
    }
    month.events.push(event);
  }

  if (events.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-zinc-300 p-6 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        No upcoming events yet. New events show up here as soon as the board
        adds them.
      </p>
    );
  }

  return (
    <div>
      {categories.length > 1 && (
        <nav
          aria-label="Filter events by category"
          className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
        >
          <Link
            href="/members/events"
            aria-current={cat ? undefined : "true"}
            className={`${chipBase} ${cat ? chipOff : chipOn}`}
          >
            All
            <span className="opacity-70">{events.length}</span>
          </Link>
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/members/events?cat=${encodeURIComponent(category.name)}`}
              aria-current={cat === category.name ? "true" : undefined}
              className={`${chipBase} ${cat === category.name ? chipOn : chipOff}`}
            >
              {category.name}
              <span className="opacity-70">{category.count}</span>
            </Link>
          ))}
        </nav>
      )}

      <div className="mt-6 grid gap-10">
        {months.map((month) => (
          <section key={month.label} aria-label={month.label}>
            <div className="flex items-baseline gap-3 border-b border-zinc-200 pb-2 dark:border-zinc-800">
              <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
                {month.label}
              </h2>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {month.events.length}{" "}
                {month.events.length === 1 ? "event" : "events"}
              </span>
            </div>
            <ul className="mt-4 grid gap-3">
              {month.events.map((event) => (
                <li key={event.id}>
                  <EventCard event={event} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
