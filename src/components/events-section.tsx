import { links } from "../../content/links";

// Embeds the public Google Calendar from content/links.ts. The board edits
// events in Google Calendar itself, not here -- this just displays it.
// A null calendarEmbed renders a placeholder instead of a broken embed.
export function EventsSection() {
  return (
    <section aria-labelledby="events-heading" className="border-t border-zinc-200 px-6 py-12 dark:border-zinc-800">
      <div className="mx-auto max-w-2xl">
        <h2 id="events-heading" className="text-2xl font-semibold tracking-tight">
          Events
        </h2>
        {links.calendarEmbed ? (
          <div className="mt-6 w-full overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
            <iframe
              src={links.calendarEmbed}
              title="AnderTech events calendar"
              className="h-[600px] w-full"
              style={{ border: 0 }}
              loading="lazy"
            />
          </div>
        ) : (
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">Event calendar coming soon.</p>
        )}
      </div>
    </section>
  );
}
