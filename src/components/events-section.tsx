import Link from "next/link";
import { SectionLabel } from "@/components/home/ui";
import { links } from "../../content/links";

// The events slot under the conferences on the home page. Embeds the public
// Google Calendar from content/links.ts; the board edits events in Google
// Calendar itself, not here. A null calendarEmbed renders a placeholder
// instead of a broken embed, and points members at the members-only events
// page. It reads no database, so the home page stays static.
export function EventsSection() {
  return (
    <div
      id="events"
      aria-labelledby="events-heading"
      role="region"
      className="mt-6 grid scroll-mt-16 gap-6 rounded-3xl bg-white p-6 md:grid-cols-[5fr_7fr] md:items-center md:gap-10 md:rounded-[32px] md:p-11 dark:bg-zinc-900"
    >
      <div>
        <SectionLabel>Events calendar</SectionLabel>
        <h3
          id="events-heading"
          className="mt-3 max-w-[14ch] font-display text-[28px] font-bold leading-[1.05] tracking-[-0.035em] md:text-[32px]"
        >
          Everything coming up, in one place.
        </h3>
        <p className="mt-3 text-sm text-brand-navy/70 dark:text-white/70">
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
    </div>
  );
}
