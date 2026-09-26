import Link from "next/link";
import { dateParts, timeRange } from "@/lib/event-format";
import type { MemberEvent } from "@/lib/members-db";

// The next three events as calendar-style tiles. On a phone they sit in one
// row you can swipe; from tablet width they become three columns.
export function NextUp({ events }: { events: MemberEvent[] }) {
  const items = events.slice(0, 3);

  return (
    <section aria-labelledby="next-up" className="pt-8 md:pt-10">
      <div className="mb-3.5 flex items-end justify-between gap-3">
        <h2 id="next-up" className="text-xl font-semibold tracking-tight">
          Next up
        </h2>
        <Link
          href="/members/events"
          className="inline-flex min-h-11 items-center whitespace-nowrap text-sm font-medium text-brand-blue hover:underline dark:text-[#7dbbec]"
        >
          All events &rarr;
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-300 p-5 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          No upcoming events yet.
        </p>
      ) : (
        <ul className="-mx-5 flex scroll-pl-5 snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
          {items.map((event) => {
            const { month, day, weekday } = dateParts(event.event_date);
            const time = timeRange(event);
            const education = event.category.toLowerCase() === "education";
            return (
              <li
                key={event.id}
                className="max-w-[280px] shrink-0 basis-[78%] snap-start md:max-w-none md:basis-auto"
              >
                <Link
                  href="/members/events"
                  className="grid h-full grid-cols-[auto_1fr] content-start gap-3.5 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm hover:border-brand-blue dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="grid h-fit w-14 rounded-[10px] bg-brand-sky pb-2 pt-2 text-center leading-none dark:bg-[#14324d]">
                    <span className="text-[11px] font-bold tracking-widest text-brand-blue dark:text-[#7dbbec]">
                      {month}
                    </span>
                    <span className="mt-1 text-2xl font-semibold tabular-nums">
                      {day}
                    </span>
                    <span className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                      {weekday}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-semibold leading-snug">
                      {event.title}
                    </h3>
                    {(event.location || time) && (
                      <p className="mt-1.5 text-[13px] text-zinc-600 dark:text-zinc-400">
                        {[event.location, time].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    <span
                      className={`mt-2.5 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        education
                          ? "bg-brand-sky text-brand-blue dark:bg-[#14324d] dark:text-[#7dbbec]"
                          : "bg-brand-cream text-amber-700 dark:bg-[#33290f] dark:text-brand-gold"
                      }`}
                    >
                      {event.category}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
