import Link from "next/link";
import { links } from "../../content/links";

// Embeds the public Google Calendar from content/links.ts. The board edits
// events in Google Calendar itself, not here -- this just displays it.
// A null calendarEmbed renders a placeholder instead of a broken embed, and
// points members at the members-only events page.
export function EventsSection() {
  return (
    <section aria-labelledby="events-heading" className="py-10 md:py-14">
      <div className="mb-3.5">
        <h2 id="events-heading" className="text-xl font-semibold tracking-tight md:text-2xl">
          Events
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Workshops, panels and mixers across the year.
        </p>
      </div>
      {links.calendarEmbed ? (
        <div className="w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800">
          <iframe
            src={links.calendarEmbed}
            title="AnderTech events calendar"
            className="h-[600px] w-full"
            style={{ border: 0 }}
            loading="lazy"
          />
        </div>
      ) : (
        <div className="grid gap-2 rounded-2xl bg-brand-cream p-5 text-brand-navy dark:bg-[#33290f] dark:text-zinc-100">
          <p className="font-semibold">The public event calendar is coming soon.</p>
          <p className="text-sm opacity-80">
            AnderTech members can already see every upcoming event after
            signing in.
          </p>
          <Link
            href="/members/events"
            className="mt-1 inline-flex min-h-11 w-fit items-center text-sm font-semibold text-brand-blue hover:underline dark:text-brand-gold"
          >
            Members: see upcoming events &rarr;
          </Link>
        </div>
      )}
    </section>
  );
}
