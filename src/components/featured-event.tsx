import { featuredEvent, isUpcoming } from "../../content/featured-event";

// The "Coming up" card under the hero: one featured event, from
// content/featured-event.ts. It renders nothing when there is no featured
// event or the event day has passed, so it can be left in place safely.
// Poster-style navy panel (title, theme, when and where) beside an agenda
// panel; stacked on phones. No JavaScript and no session, so the home page
// stays static.
export function FeaturedEvent() {
  const event = featuredEvent;
  if (!event || !isUpcoming(event)) return null;

  return (
    <section
      id="featured-event"
      aria-labelledby="featured-event-heading"
      className="mx-auto max-w-5xl px-5 pt-10 md:pt-14"
    >
      <div className="reveal grid overflow-hidden rounded-3xl border border-brand-navy/10 shadow-sm md:grid-cols-[1.15fr_1fr] dark:border-white/10">
        <div className="bg-brand-navy p-6 text-white md:p-9">
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-brand-gold">
            <span aria-hidden="true" className="size-2 rounded-full bg-brand-gold" />
            {event.label}
          </p>
          <h2
            id="featured-event-heading"
            className="mt-4 text-3xl font-semibold leading-[1.08] tracking-tight text-balance md:text-4xl"
          >
            {event.title}
          </h2>
          <p className="mt-3 max-w-[44ch] text-base leading-snug text-white/85 md:text-lg">
            {event.theme}
          </p>
          <p className="mt-3 text-sm text-white/70">
            Presented by {event.presentedBy}
          </p>

          <dl className="mt-6 grid gap-3 text-sm">
            <div>
              <dt className="sr-only">Date</dt>
              <dd className="text-base font-semibold">
                <time dateTime={event.date}>{event.dateLabel}</time>
              </dd>
            </div>
            <div>
              <dt className="sr-only">Time</dt>
              <dd className="text-white/85">{event.timeLabel}</dd>
            </div>
            <div>
              <dt className="sr-only">Venue</dt>
              <dd className="text-white/85">{event.venue}</dd>
            </div>
          </dl>

          {event.link && (
            <a
              href={event.link.href}
              className="mt-7 inline-flex min-h-11 items-center rounded-full bg-brand-gold px-6 text-sm font-semibold text-brand-navy hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {event.link.label}
            </a>
          )}
        </div>

        <div className="bg-white p-6 md:p-9 dark:bg-zinc-900">
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600 dark:text-zinc-400">
            Agenda
          </h3>
          <ol className="mt-4 divide-y divide-zinc-900/10 dark:divide-white/10">
            {event.agenda.map((item) => (
              <li key={item.time} className="py-3.5 first:pt-0">
                <p className="text-sm font-medium text-brand-blue tabular-nums dark:text-[#7dbbec]">
                  {item.time}
                </p>
                <p className="mt-0.5 font-semibold">{item.title}</p>
                {item.details && (
                  <ul className="mt-2 grid gap-1.5">
                    {item.details.map((detail) => (
                      <li
                        key={detail}
                        className="flex gap-2.5 text-sm text-zinc-700 dark:text-zinc-300"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-[0.45em] size-1.5 shrink-0 rounded-full bg-brand-gold"
                        />
                        {detail}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
